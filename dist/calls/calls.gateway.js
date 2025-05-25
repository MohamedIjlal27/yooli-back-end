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
exports.CallsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const calls_service_1 = require("./calls.service");
const users_service_1 = require("../users/users.service");
const user_schema_1 = require("../users/schemas/user.schema");
const notifications_service_1 = require("../notifications/notifications.service");
let CallsGateway = class CallsGateway {
    constructor(callsService, usersService, notificationsService) {
        this.callsService = callsService;
        this.usersService = usersService;
        this.notificationsService = notificationsService;
        this.connectedUsers = new Map();
        this.activeCalls = new Map();
        this.ringingTimers = new Map();
    }
    async handleConnection(client) {
        try {
            const userId = client.handshake.auth?.userId;
            if (userId) {
                this.connectedUsers.set(userId, client.id);
                await this.usersService.updateStatus(userId, user_schema_1.UserStatus.ONLINE);
                console.log(`📞 User ${userId} connected for calls with socket ${client.id}`);
            }
        }
        catch (error) {
            console.error('📞 Call connection error:', error);
        }
    }
    async handleDisconnect(client) {
        try {
            const userId = this.getUserIdBySocketId(client.id);
            if (userId) {
                this.connectedUsers.delete(userId);
                for (const [callId, callData] of this.activeCalls.entries()) {
                    if (callData.callerId === userId || callData.receiverId === userId) {
                        await this.handleEndCall(client, { callId });
                    }
                }
                await this.usersService.updateStatus(userId, user_schema_1.UserStatus.OFFLINE);
                console.log(`📞 User ${userId} disconnected from calls`);
            }
        }
        catch (error) {
            console.error('📞 Call disconnection error:', error);
        }
    }
    async handleInitiateCall(client, data) {
        try {
            const callerId = client.handshake.auth?.userId;
            if (!callerId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }
            console.log(`📞 Call initiated by ${callerId} to ${data.receiverId}, type: ${data.type}`);
            const receiver = await this.usersService.findOne(data.receiverId);
            if (receiver.status === user_schema_1.UserStatus.IN_CALL) {
                client.emit('callFailed', { reason: 'User is already in a call' });
                return;
            }
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
            const callId = call._id.toString();
            this.activeCalls.set(callId, {
                callId,
                callerId,
                receiverId: data.receiverId,
                type: data.type,
                status: 'ringing',
                startTime: new Date(),
            });
            await this.usersService.updateStatus(callerId, user_schema_1.UserStatus.IN_CALL);
            const caller = await this.usersService.findOne(callerId);
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
            client.emit('callRinging', { callId });
            const ringingTimer = setTimeout(async () => {
                console.log(`📞 Call ${callId} timed out`);
                await this.callsService.declineCall(callId, data.receiverId);
                client.emit('callTimeout', { callId });
                this.server.to(receiverSocketId).emit('callTimeout', { callId });
                this.activeCalls.delete(callId);
                this.ringingTimers.delete(callId);
                await this.usersService.updateStatus(callerId, user_schema_1.UserStatus.ONLINE);
            }, 30000);
            this.ringingTimers.set(callId, ringingTimer);
            client.emit('callInitiated', { callId });
            console.log(`📞 Call ${callId} initiated, ringing started`);
        }
        catch (error) {
            console.error('📞 Error initiating call:', error);
            client.emit('error', { message: error.message });
        }
    }
    async handleAnswerCall(client, data) {
        try {
            const userId = client.handshake.auth?.userId;
            if (!userId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }
            console.log(`📞 Call ${data.callId} answered by ${userId}`);
            const ringingTimer = this.ringingTimers.get(data.callId);
            if (ringingTimer) {
                clearTimeout(ringingTimer);
                this.ringingTimers.delete(data.callId);
            }
            const call = await this.callsService.answerCall(data.callId, userId, data.answer);
            const callData = this.activeCalls.get(data.callId);
            if (callData) {
                callData.status = 'connected';
                callData.connectedTime = new Date();
                this.activeCalls.set(data.callId, callData);
            }
            await this.usersService.updateStatus(userId, user_schema_1.UserStatus.IN_CALL);
            const callerSocketId = this.connectedUsers.get(call.callerId.toString());
            if (callerSocketId) {
                this.server.to(callerSocketId).emit('callAnswered', {
                    callId: data.callId,
                    answer: data.answer,
                });
            }
            client.emit('callConnected', { callId: data.callId });
            console.log(`📞 Call ${data.callId} connected successfully`);
        }
        catch (error) {
            console.error('📞 Error answering call:', error);
            client.emit('error', { message: error.message });
        }
    }
    async handleDeclineCall(client, data) {
        try {
            const userId = client.handshake.auth?.userId;
            if (!userId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }
            console.log(`📞 Call ${data.callId} declined by ${userId}`);
            const ringingTimer = this.ringingTimers.get(data.callId);
            if (ringingTimer) {
                clearTimeout(ringingTimer);
                this.ringingTimers.delete(data.callId);
            }
            const call = await this.callsService.declineCall(data.callId, userId);
            const callerSocketId = this.connectedUsers.get(call.callerId.toString());
            if (callerSocketId) {
                this.server.to(callerSocketId).emit('callDeclined', { callId: data.callId });
            }
            await this.usersService.updateStatus(call.callerId.toString(), user_schema_1.UserStatus.ONLINE);
            this.activeCalls.delete(data.callId);
            client.emit('callEnded', { callId: data.callId });
            console.log(`📞 Call ${data.callId} declined and cleaned up`);
        }
        catch (error) {
            console.error('📞 Error declining call:', error);
            client.emit('error', { message: error.message });
        }
    }
    async handleEndCall(client, data) {
        try {
            const userId = client.handshake.auth?.userId;
            if (!userId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }
            console.log(`📞 Call ${data.callId} ended by ${userId}`);
            const ringingTimer = this.ringingTimers.get(data.callId);
            if (ringingTimer) {
                clearTimeout(ringingTimer);
                this.ringingTimers.delete(data.callId);
            }
            const call = await this.callsService.endCall(data.callId, userId);
            const otherUserId = call.callerId.toString() === userId
                ? call.receiverId.toString()
                : call.callerId.toString();
            const otherUserSocketId = this.connectedUsers.get(otherUserId);
            if (otherUserSocketId) {
                this.server.to(otherUserSocketId).emit('callEnded', { callId: data.callId });
            }
            await this.usersService.updateStatus(call.callerId.toString(), user_schema_1.UserStatus.ONLINE);
            await this.usersService.updateStatus(call.receiverId.toString(), user_schema_1.UserStatus.ONLINE);
            this.activeCalls.delete(data.callId);
            client.emit('callEnded', { callId: data.callId });
            console.log(`📞 Call ${data.callId} ended and cleaned up`);
        }
        catch (error) {
            console.error('📞 Error ending call:', error);
            client.emit('error', { message: error.message });
        }
    }
    async handleIceCandidate(client, data) {
        try {
            console.log(`📞 ICE candidate received for call ${data.callId}`);
            await this.callsService.addIceCandidate(data.callId, data.candidate);
            const targetSocketId = this.connectedUsers.get(data.targetUserId);
            if (targetSocketId) {
                this.server.to(targetSocketId).emit('iceCandidate', {
                    callId: data.callId,
                    candidate: data.candidate,
                });
                console.log(`📞 ICE candidate forwarded to ${data.targetUserId}`);
            }
        }
        catch (error) {
            console.error('📞 Error handling ICE candidate:', error);
            client.emit('error', { message: error.message });
        }
    }
    async handleWebRTCOffer(client, data) {
        try {
            console.log(`📞 WebRTC offer received for call ${data.callId}`);
            const targetSocketId = this.connectedUsers.get(data.targetUserId);
            if (targetSocketId) {
                this.server.to(targetSocketId).emit('webrtcOffer', {
                    callId: data.callId,
                    offer: data.offer,
                });
                console.log(`📞 WebRTC offer forwarded to ${data.targetUserId}`);
            }
        }
        catch (error) {
            console.error('📞 Error handling WebRTC offer:', error);
            client.emit('error', { message: error.message });
        }
    }
    async handleWebRTCAnswer(client, data) {
        try {
            console.log(`📞 WebRTC answer received for call ${data.callId}`);
            const targetSocketId = this.connectedUsers.get(data.targetUserId);
            if (targetSocketId) {
                this.server.to(targetSocketId).emit('webrtcAnswer', {
                    callId: data.callId,
                    answer: data.answer,
                });
                console.log(`📞 WebRTC answer forwarded to ${data.targetUserId}`);
            }
        }
        catch (error) {
            console.error('📞 Error handling WebRTC answer:', error);
            client.emit('error', { message: error.message });
        }
    }
    registerUser(userId, socketId) {
        this.connectedUsers.set(userId, socketId);
    }
    unregisterUser(userId) {
        this.connectedUsers.delete(userId);
    }
    getUserIdBySocketId(socketId) {
        for (const [userId, id] of this.connectedUsers.entries()) {
            if (id === socketId) {
                return userId;
            }
        }
        return undefined;
    }
};
exports.CallsGateway = CallsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], CallsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('initiateCall'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], CallsGateway.prototype, "handleInitiateCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('answerCall'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], CallsGateway.prototype, "handleAnswerCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('declineCall'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], CallsGateway.prototype, "handleDeclineCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('endCall'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], CallsGateway.prototype, "handleEndCall", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('iceCandidate'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], CallsGateway.prototype, "handleIceCandidate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtcOffer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], CallsGateway.prototype, "handleWebRTCOffer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtcAnswer'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], CallsGateway.prototype, "handleWebRTCAnswer", null);
exports.CallsGateway = CallsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [calls_service_1.CallsService,
        users_service_1.UsersService,
        notifications_service_1.NotificationsService])
], CallsGateway);
//# sourceMappingURL=calls.gateway.js.map