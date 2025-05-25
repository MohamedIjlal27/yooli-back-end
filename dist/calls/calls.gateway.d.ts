import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CallsService } from './calls.service';
import { UsersService } from '../users/users.service';
import { CallType } from './schemas/call.schema';
import { NotificationsService } from '../notifications/notifications.service';
export declare class CallsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private callsService;
    private usersService;
    private notificationsService;
    server: Server;
    private connectedUsers;
    private activeCalls;
    private ringingTimers;
    constructor(callsService: CallsService, usersService: UsersService, notificationsService: NotificationsService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleInitiateCall(client: Socket, data: {
        receiverId: string;
        type: CallType;
        offer?: string;
    }): Promise<void>;
    handleAnswerCall(client: Socket, data: {
        callId: string;
        answer?: string;
    }): Promise<void>;
    handleDeclineCall(client: Socket, data: {
        callId: string;
    }): Promise<void>;
    handleEndCall(client: Socket, data: {
        callId: string;
    }): Promise<void>;
    handleIceCandidate(client: Socket, data: {
        callId: string;
        candidate: string;
        targetUserId: string;
    }): Promise<void>;
    handleWebRTCOffer(client: Socket, data: {
        callId: string;
        offer: string;
        targetUserId: string;
    }): Promise<void>;
    handleWebRTCAnswer(client: Socket, data: {
        callId: string;
        answer: string;
        targetUserId: string;
    }): Promise<void>;
    registerUser(userId: string, socketId: string): void;
    unregisterUser(userId: string): void;
    private getUserIdBySocketId;
}
