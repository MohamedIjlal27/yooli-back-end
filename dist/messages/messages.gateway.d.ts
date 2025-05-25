import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { UsersService } from '../users/users.service';
export declare class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private messagesService;
    private usersService;
    server: Server;
    private connectedUsers;
    constructor(messagesService: MessagesService, usersService: UsersService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleMessage(client: Socket, data: {
        receiverId: string;
        content: string;
        type?: string;
    }): Promise<import("./schemas/message.schema").Message>;
    handleMarkAsRead(client: Socket, data: {
        messageId: string;
    }): Promise<void>;
    handleMarkConversationAsRead(client: Socket, data: {
        userId: string;
    }): Promise<void>;
    handleTyping(client: Socket, data: {
        receiverId: string;
        isTyping: boolean;
    }): Promise<void>;
    private getUserIdBySocketId;
    sendToUser(userId: string, event: string, data: any): void;
    isUserOnline(userId: string): boolean;
}
