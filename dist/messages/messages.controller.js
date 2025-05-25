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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const messages_service_1 = require("./messages.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let MessagesController = class MessagesController {
    constructor(messagesService) {
        this.messagesService = messagesService;
    }
    create(req, createMessageDto) {
        return this.messagesService.create(req.user.userId, createMessageDto);
    }
    getConversations(req) {
        return this.messagesService.findUserConversations(req.user.userId);
    }
    getConversation(req, userId, page = 1, limit = 50) {
        console.log('getConversation endpoint called with:', {
            currentUserId: req.user.userId,
            targetUserId: userId,
            page,
            limit
        });
        return this.messagesService.findConversation(req.user.userId, userId, +page, +limit);
    }
    getUnreadCount(req) {
        return this.messagesService.getUnreadCount(req.user.userId);
    }
    markAsRead(req, id) {
        return this.messagesService.markAsRead(id, req.user.userId);
    }
    markConversationAsRead(req, userId) {
        return this.messagesService.markConversationAsRead(userId, req.user.userId);
    }
    remove(req, id) {
        return this.messagesService.deleteMessage(id, req.user.userId);
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Send a message' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Message sent successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_message_dto_1.CreateMessageDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user conversations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversations retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversation/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get conversation with specific user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversation retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread messages count' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Unread count retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark message as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message marked as read' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('conversation/:userId/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark conversation as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Conversation marked as read' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "markConversationAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a message' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message deleted successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "remove", null);
exports.MessagesController = MessagesController = __decorate([
    (0, swagger_1.ApiTags)('messages'),
    (0, common_1.Controller)('messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [messages_service_1.MessagesService])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map