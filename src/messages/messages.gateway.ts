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
import { UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { UsersService } from '../users/users.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserStatus } from '../users/schemas/user.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
  ) {
    // Set the gateway reference in the service to avoid circular dependency
    this.messagesService.setGateway(this);
  }

  async handleConnection(client: Socket) {
    try {
      const userId = client.handshake.auth?.userId;
      if (userId) {
        this.connectedUsers.set(userId, client.id);
        await this.usersService.updateSocketId(userId, client.id);
        await this.usersService.updateStatus(userId, UserStatus.ONLINE);
        
        // Notify other users that this user is online
        client.broadcast.emit('userOnline', { userId });
        
        console.log(`User ${userId} connected with socket ${client.id}`);
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const userId = this.getUserIdBySocketId(client.id);
      if (userId) {
        this.connectedUsers.delete(userId);
        await this.usersService.updateStatus(userId, UserStatus.OFFLINE);
        
        // Notify other users that this user is offline
        client.broadcast.emit('userOffline', { userId });
        
        console.log(`User ${userId} disconnected`);
      }
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; content: string; type?: string },
  ) {
    try {
      const senderId = client.handshake.auth?.userId;
      if (!senderId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      console.log(`🔌 Socket: sendMessage called by ${senderId} to ${data.receiverId}`);

      const createMessageDto: CreateMessageDto = {
        receiverId: data.receiverId,
        content: data.content,
        type: data.type as any,
      };

      const message = await this.messagesService.create(senderId, createMessageDto);
      
      console.log(`🔌 Socket: Message created:`, {
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content
      });
      
      // Send to receiver if online
      const receiverSocketId = this.connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', message);
        console.log(`🔌 Socket: Sent newMessage to receiver ${data.receiverId}`);
      } else {
        console.log(`🔌 Socket: Receiver ${data.receiverId} is not online`);
      }

      // Send confirmation to sender
      client.emit('messageSent', message);
      console.log(`🔌 Socket: Sent messageSent confirmation to sender ${senderId}`);

      return message;
    } catch (error) {
      console.error('🔌 Socket: Error in sendMessage:', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    try {
      const userId = client.handshake.auth?.userId;
      if (!userId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      await this.messagesService.markAsRead(data.messageId, userId);
      client.emit('messageRead', { messageId: data.messageId });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('markConversationAsRead')
  async handleMarkConversationAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    try {
      const currentUserId = client.handshake.auth?.userId;
      if (!currentUserId) {
        client.emit('error', { message: 'Unauthorized' });
        return;
      }

      console.log(`🔌 Socket: markConversationAsRead called by ${currentUserId} for conversation with ${data.userId}`);

      await this.messagesService.markConversationAsRead(data.userId, currentUserId);
      
      // Emit event to the current user to update their UI immediately
      client.emit('conversationMarkedAsRead', { 
        userId: data.userId,
        timestamp: new Date().toISOString()
      });
      
      console.log(`🔌 Socket: Emitted conversationMarkedAsRead to ${currentUserId}`);
      
      // Also emit to the other user if they're online to update their UI
      const otherUserSocketId = this.connectedUsers.get(data.userId);
      if (otherUserSocketId) {
        this.server.to(otherUserSocketId).emit('conversationRead', { 
          userId: currentUserId,
          timestamp: new Date().toISOString()
        });
        console.log(`🔌 Socket: Emitted conversationRead to ${data.userId}`);
      }
    } catch (error) {
      console.error('🔌 Socket: Error in markConversationAsRead:', error);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; isTyping: boolean },
  ) {
    const senderId = client.handshake.auth?.userId;
    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('userTyping', {
        userId: senderId,
        isTyping: data.isTyping,
      });
    }
  }

  private getUserIdBySocketId(socketId: string): string | undefined {
    for (const [userId, id] of this.connectedUsers.entries()) {
      if (id === socketId) {
        return userId;
      }
    }
    return undefined;
  }

  // Method to send message to specific user
  sendToUser(userId: string, event: string, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }

  // Method to check if user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
} 