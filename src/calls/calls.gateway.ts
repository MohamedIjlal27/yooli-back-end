import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CallsService } from './calls.service';
import { UsersService } from '../users/users.service';
import { CallStatus, CallType } from './schemas/call.schema';
import { UserStatus } from '../users/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CallsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId
  private activeCalls = new Map<string, any>(); // callId -> call data
  private ringingTimers = new Map<string, NodeJS.Timeout>(); // callId -> timer

  constructor(
    private callsService: CallsService,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const userId = client.handshake.auth?.userId;
      if (userId) {
        this.connectedUsers.set(userId, client.id);
        await this.usersService.updateStatus(userId, UserStatus.ONLINE);
        console.log(`📞 User ${userId} connected for calls with socket ${client.id}`);
      }
    } catch (error) {
      console.error('📞 Call connection error:', error);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const userId = this.getUserIdBySocketId(client.id);
      if (userId) {
        this.connectedUsers.delete(userId);
        
        // End any active calls for this user
        for (const [callId, callData] of this.activeCalls.entries()) {
          if (callData.callerId === userId || callData.receiverId === userId) {
            await this.handleEndCall(client, { callId });
          }
        }
        
        await this.usersService.updateStatus(userId, UserStatus.OFFLINE);
        console.log(`📞 User ${userId} disconnected from calls`);
      }
    } catch (error) {
      console.error('📞 Call disconnection error:', error);
    }
  }

  @SubscribeMessage('initiateCall')
  async handleInitiateCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; type: CallType; offer?: string },
  ) {
    try {
      const callerId = client.handshake.auth?.userId;
      if (!callerId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      console.log(`📞 Call initiated by ${callerId} to ${data.receiverId}, type: ${data.type}`);

      // Check if receiver is available
      const receiver = await this.usersService.findOne(data.receiverId);
      if (receiver.status === UserStatus.IN_CALL) {
        client.emit('callFailed', { reason: 'User is already in a call' });
        return;
      }

      // Check if receiver is online
      const receiverSocketId = this.connectedUsers.get(data.receiverId);
      if (!receiverSocketId) {
        client.emit('callFailed', { reason: 'User is not available' });
        return;
      }

      const call = await this.callsService.initiateCall(callerId, {
        receiverId: data.receiverId,
        type: data.type,
        offer: data.offer,
      });

      const callId = (call as any)._id.toString();

      // Store call data
      this.activeCalls.set(callId, {
        callId,
        callerId,
        receiverId: data.receiverId,
        type: data.type,
        status: 'ringing',
        startTime: new Date(),
      });

      // Update caller status
      await this.usersService.updateStatus(callerId, UserStatus.IN_CALL);

      // Get caller info
      const caller = await this.usersService.findOne(callerId);

      // Send call invitation to receiver with ringing
      this.server.to(receiverSocketId).emit('incomingCall', {
        callId,
        caller: {
          id: callerId,
          name: caller.fullName,
          avatar: caller.avatar,
        },
        type: data.type,
        offer: data.offer,
      });

      // Start ringing sound for caller
      client.emit('callRinging', { callId });

      // Set timeout for call (30 seconds)
      const ringingTimer = setTimeout(async () => {
        console.log(`📞 Call ${callId} timed out`);
        
        // Auto-decline the call
        await this.callsService.declineCall(callId, data.receiverId);
        
        // Notify both users
        client.emit('callTimeout', { callId });
        this.server.to(receiverSocketId).emit('callTimeout', { callId });
        
        // Clean up
        this.activeCalls.delete(callId);
        this.ringingTimers.delete(callId);
        
        // Update caller status back to online
        await this.usersService.updateStatus(callerId, UserStatus.ONLINE);
      }, 30000); // 30 seconds timeout

      this.ringingTimers.set(callId, ringingTimer);

      client.emit('callInitiated', { callId });
      
      console.log(`📞 Call ${callId} initiated, ringing started`);
    } catch (error) {
      console.error('📞 Error initiating call:', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('answerCall')
  async handleAnswerCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string; answer?: string },
  ) {
    try {
      const userId = client.handshake.auth?.userId;
      if (!userId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      console.log(`📞 Call ${data.callId} answered by ${userId}`);

      // Clear ringing timer
      const ringingTimer = this.ringingTimers.get(data.callId);
      if (ringingTimer) {
        clearTimeout(ringingTimer);
        this.ringingTimers.delete(data.callId);
      }

      const call = await this.callsService.answerCall(data.callId, userId, data.answer);
      
      // Update call status
      const callData = this.activeCalls.get(data.callId);
      if (callData) {
        callData.status = 'connected';
        callData.connectedTime = new Date();
        this.activeCalls.set(data.callId, callData);
      }
      
      // Update receiver status
      await this.usersService.updateStatus(userId, UserStatus.IN_CALL);

      // Notify caller that call was answered
      const callerSocketId = this.connectedUsers.get(call.callerId.toString());
      if (callerSocketId) {
        this.server.to(callerSocketId).emit('callAnswered', {
          callId: data.callId,
          answer: data.answer,
        });
      }

      client.emit('callConnected', { callId: data.callId });
      
      console.log(`📞 Call ${data.callId} connected successfully`);
    } catch (error) {
      console.error('📞 Error answering call:', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('declineCall')
  async handleDeclineCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    try {
      const userId = client.handshake.auth?.userId;
      if (!userId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      console.log(`📞 Call ${data.callId} declined by ${userId}`);

      // Clear ringing timer
      const ringingTimer = this.ringingTimers.get(data.callId);
      if (ringingTimer) {
        clearTimeout(ringingTimer);
        this.ringingTimers.delete(data.callId);
      }

      const call = await this.callsService.declineCall(data.callId, userId);

      // Notify caller that call was declined
      const callerSocketId = this.connectedUsers.get(call.callerId.toString());
      if (callerSocketId) {
        this.server.to(callerSocketId).emit('callDeclined', { callId: data.callId });
      }

      // Update caller status back to online
      await this.usersService.updateStatus(call.callerId.toString(), UserStatus.ONLINE);

      // Clean up call data
      this.activeCalls.delete(data.callId);

      client.emit('callEnded', { callId: data.callId });
      
      console.log(`📞 Call ${data.callId} declined and cleaned up`);
    } catch (error) {
      console.error('📞 Error declining call:', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('endCall')
  async handleEndCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    try {
      const userId = client.handshake.auth?.userId;
      if (!userId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      console.log(`📞 Call ${data.callId} ended by ${userId}`);

      // Clear ringing timer if exists
      const ringingTimer = this.ringingTimers.get(data.callId);
      if (ringingTimer) {
        clearTimeout(ringingTimer);
        this.ringingTimers.delete(data.callId);
      }

      const call = await this.callsService.endCall(data.callId, userId);

      // Notify other participant
      const otherUserId = call.callerId.toString() === userId 
        ? call.receiverId.toString() 
        : call.callerId.toString();
      
      const otherUserSocketId = this.connectedUsers.get(otherUserId);
      if (otherUserSocketId) {
        this.server.to(otherUserSocketId).emit('callEnded', { callId: data.callId });
      }

      // Update both users' status back to online
      await this.usersService.updateStatus(call.callerId.toString(), UserStatus.ONLINE);
      await this.usersService.updateStatus(call.receiverId.toString(), UserStatus.ONLINE);

      // Clean up call data
      this.activeCalls.delete(data.callId);

      client.emit('callEnded', { callId: data.callId });
      
      console.log(`📞 Call ${data.callId} ended and cleaned up`);
    } catch (error) {
      console.error('📞 Error ending call:', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('iceCandidate')
  async handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string; candidate: string; targetUserId: string },
  ) {
    try {
      console.log(`📞 ICE candidate received for call ${data.callId}`);
      
      await this.callsService.addIceCandidate(data.callId, data.candidate);

      // Forward ICE candidate to the other peer
      const targetSocketId = this.connectedUsers.get(data.targetUserId);
      if (targetSocketId) {
        this.server.to(targetSocketId).emit('iceCandidate', {
          callId: data.callId,
          candidate: data.candidate,
        });
        console.log(`📞 ICE candidate forwarded to ${data.targetUserId}`);
      }
    } catch (error) {
      console.error('📞 Error handling ICE candidate:', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('webrtcOffer')
  async handleWebRTCOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string; offer: string; targetUserId: string },
  ) {
    try {
      console.log(`📞 WebRTC offer received for call ${data.callId}`);
      
      // Forward offer to the other peer
      const targetSocketId = this.connectedUsers.get(data.targetUserId);
      if (targetSocketId) {
        this.server.to(targetSocketId).emit('webrtcOffer', {
          callId: data.callId,
          offer: data.offer,
        });
        console.log(`📞 WebRTC offer forwarded to ${data.targetUserId}`);
      }
    } catch (error) {
      console.error('📞 Error handling WebRTC offer:', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('webrtcAnswer')
  async handleWebRTCAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string; answer: string; targetUserId: string },
  ) {
    try {
      console.log(`📞 WebRTC answer received for call ${data.callId}`);
      
      // Forward answer to the other peer
      const targetSocketId = this.connectedUsers.get(data.targetUserId);
      if (targetSocketId) {
        this.server.to(targetSocketId).emit('webrtcAnswer', {
          callId: data.callId,
          answer: data.answer,
        });
        console.log(`📞 WebRTC answer forwarded to ${data.targetUserId}`);
      }
    } catch (error) {
      console.error('📞 Error handling WebRTC answer:', error);
      client.emit('error', { message: error.message });
    }
  }

  // Helper method to register user connection
  registerUser(userId: string, socketId: string) {
    this.connectedUsers.set(userId, socketId);
  }

  // Helper method to unregister user connection
  unregisterUser(userId: string) {
    this.connectedUsers.delete(userId);
  }

  private getUserIdBySocketId(socketId: string): string | undefined {
    for (const [userId, id] of this.connectedUsers.entries()) {
      if (id === socketId) {
        return userId;
      }
    }
    return undefined;
  }
} 