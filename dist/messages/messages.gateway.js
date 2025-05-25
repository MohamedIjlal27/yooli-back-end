"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const messages_service_1 = require("./messages.service");
const users_service_1 = require("../users/users.service");
const user_schema_1 = require("../users/schemas/user.schema");
let MessagesGateway = class MessagesGateway {
    constructor(messagesService, usersService) {
        this.messagesService = messagesService;
        this.usersService = usersService;
        this.connectedUsers = new Map();
        this.messagesService.setGateway(this);
    }
    async handleConnection(client) {
        try {
            const userId = client.handshake.auth?.userId;
            if (userId) {
                this.connectedUsers.set(userId, client.id);
                await this.usersService.updateSocketId(userId, client.id);
                await this.usersService.updateStatus(userId, user_schema_1.UserStatus.ONLINE);
                client.broadcast.emit('userOnline', { userId });
                console.log(`User ${userId} connected with socket ${client.id}`);
            }
        }
        catch (error) {
            console.error('Connection error:', error);
        }
    }
    async handleDisconnect(client) {
        try {
            const userId = this.getUserIdBySocketId(client.id);
            if (userId) {
                this.connectedUsers.delete(userId);
                await this.usersService.updateStatus(userId, user_schema_1.UserStatus.OFFLINE);
                client.broadcast.emit('userOffline', { userId });
                console.log(`User ${userId} disconnected`);
            }
        }
        catch (error) {
            console.error('Disconnection error:', error);
        }
    }
    async handleMessage(client, data) {
        try {
            const senderId = client.handshake.auth?.userId;
            if (!senderId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }
            console.log(`🔌 Socket: sendMessage called by ${senderId} to ${data.receiverId}`);
            const createMessageDto = {
                receiverId: data.receiverId,
                content: data.content,
                type: data.type,
            };
            const message = await this.messagesService.create(senderId, createMessageDto);
            console.log(`🔌 Socket: Message created:`, {
                senderId: message.senderId,
                receiverId: message.receiverId,
                content: message.content
            });
            const receiverSocketId = this.connectedUsers.get(data.receiverId);
            if (receiverSocketId) {
                this.server.to(receiverSocketId).emit('newMessage', message);
                console.log(`🔌 Socket: Sent newMessage to receiver ${data.receiverId}`);
            }
            else {
                console.log(`🔌 Socket: Receiver ${data.receiverId} is not online`);
            }
            client.emit('messageSent', message);
            console.log(`🔌 Socket: Sent messageSent confirmation to sender ${senderId}`);
            return message;
        }
        catch (error) {
            console.error('🔌 Socket: Error in sendMessage:', error);
            client.emit('error', { message: error.message });
        }
    }
    async handleMarkAsRead(client, data) {
        try {
            const userId = client.handshake.auth?.userId;
            if (!userId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }
            await this.messagesService.markAsRead(data.messageId, userId);
            client.emit('messageRead', { messageId: data.messageId });
        }
        catch (error) {
            client.emit('error', { message: error.message });
        }
    }
    async handleMarkConversationAsRead(client, data) {
        try {
            const currentUserId = client.handshake.auth?.userId;
            if (!currentUserId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }
            console.log(`🔌 Socket: markConversationAsRead called by ${currentUserId} for conversation with ${data.userId}`);
            await this.messagesService.markConversationAsRead(data.userId, currentUserId);
            client.emit('conversationMarkedAsRead', {
                userId: data.userId,
                timestamp: new Date().toISOString()
            });
            console.log(`🔌 Socket: Emitted conversationMarkedAsRead to ${currentUserId}`);
            const otherUserSocketId = this.connectedUsers.get(data.userId);
            if (otherUserSocketId) {
                this.server.to(otherUserSocketId).emit('conversationRead', {
                    userId: currentUserId,
                    timestamp: new Date().toISOString()
                });
                console.log(`🔌 Socket: Emitted conversationRead to ${data.userId}`);
            }
        }
        catch (error) {
            console.error('🔌 Socket: Error in markConversationAsRead:', error);
            client.emit('error', { message: error.message });
        }
    }
    async handleTyping(client, data) {
        const senderId = client.handshake.auth?.userId;
        const receiverSocketId = this.connectedUsers.get(data.receiverId);
        if (receiverSocketId) {
            this.server.to(receiverSocketId).emit('userTyping', {
                userId: senderId,
                isTyping: data.isTyping,
            });
        }
    }
    getUserIdBySocketId(socketId) {
        for (const [userId, id] of this.connectedUsers.entries()) {
            if (id === socketId) {
                return userId;
            }
        }
        return undefined;
    }
    sendToUser(userId, event, data) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.server.to(socketId).emit(event, data);
        }
    }
    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }
};
exports.MessagesGateway = MessagesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagesGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('markAsRead'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleMarkAsRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('markConversationAsRead'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleMarkConversationAsRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagesGateway.prototype, "handleTyping", null);
exports.MessagesGateway = MessagesGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        users_service_1.UsersService])
], MessagesGateway);
//# sourceMappingURL=messages.gateway.js.map