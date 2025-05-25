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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const message_schema_1 = require("./schemas/message.schema");
let MessagesService = class MessagesService {
    constructor(messageModel) {
        this.messageModel = messageModel;
    }
    setGateway(gateway) {
        this.messagesGateway = gateway;
    }
    async create(senderId, createMessageDto) {
        const message = new this.messageModel({
            ...createMessageDto,
            senderId: new mongoose_2.Types.ObjectId(senderId),
            receiverId: new mongoose_2.Types.ObjectId(createMessageDto.receiverId),
        });
        return message.save();
    }
    async findConversation(userId1, userId2, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        console.log('findConversation called with:', { userId1, userId2, page, limit });
        const objectId1 = new mongoose_2.Types.ObjectId(userId1);
        const objectId2 = new mongoose_2.Types.ObjectId(userId2);
        console.log('Converted to ObjectIds:', { objectId1, objectId2 });
        const messages = await this.messageModel
            .find({
            $or: [
                { senderId: objectId1, receiverId: objectId2 },
                { senderId: objectId2, receiverId: objectId1 },
            ],
            isDeleted: false,
        })
            .populate('senderId', 'fullName avatar')
            .populate('receiverId', 'fullName avatar')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .exec();
        console.log('Found messages:', messages.length);
        console.log('Messages data:', messages);
        return messages;
    }
    async findUserConversations(userId) {
        console.log(`🔍 findUserConversations called for userId: ${userId}`);
        const conversations = await this.messageModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: new mongoose_2.Types.ObjectId(userId) },
                        { receiverId: new mongoose_2.Types.ObjectId(userId) },
                    ],
                    isDeleted: false,
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$senderId', new mongoose_2.Types.ObjectId(userId)] },
                            '$receiverId',
                            '$senderId',
                        ],
                    },
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$receiverId', new mongoose_2.Types.ObjectId(userId)] },
                                        { $ne: ['$status', message_schema_1.MessageStatus.READ] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $unwind: '$user',
            },
            {
                $project: {
                    user: {
                        _id: 1,
                        fullName: 1,
                        email: 1,
                        phoneNumber: 1,
                        avatar: 1,
                        status: 1,
                    },
                    lastMessage: 1,
                    unreadCount: 1,
                },
            },
            {
                $sort: { 'lastMessage.createdAt': -1 },
            },
        ]);
        console.log(`🔍 Found ${conversations.length} conversations for user ${userId}`);
        conversations.forEach((conv, index) => {
            console.log(`🔍 Conversation ${index}: with user ${conv.user.fullName} (${conv.user._id}), unreadCount: ${conv.unreadCount}`);
        });
        return conversations;
    }
    async markAsRead(messageId, userId) {
        const message = await this.messageModel
            .findOneAndUpdate({ _id: messageId, receiverId: userId }, { status: message_schema_1.MessageStatus.READ }, { new: true })
            .exec();
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        return message;
    }
    async markConversationAsRead(otherUserId, currentUserId) {
        console.log(`🔧 markConversationAsRead called with:`, {
            otherUserId,
            currentUserId
        });
        const existingMessages = await this.messageModel
            .find({
            $or: [
                { senderId: otherUserId, receiverId: currentUserId },
                { senderId: currentUserId, receiverId: otherUserId }
            ],
            isDeleted: false
        })
            .select('senderId receiverId status content createdAt')
            .exec();
        console.log(`🔧 Found ${existingMessages.length} total messages in conversation`);
        existingMessages.forEach((msg, index) => {
            console.log(`🔧 Message ${index}: from ${msg.senderId} to ${msg.receiverId}, status: ${msg.status}, content: "${msg.content}"`);
        });
        const unreadMessages = await this.messageModel
            .find({
            senderId: otherUserId,
            receiverId: currentUserId,
            status: { $ne: message_schema_1.MessageStatus.READ },
            isDeleted: false
        })
            .select('senderId receiverId status content createdAt')
            .exec();
        console.log(`🔧 Found ${unreadMessages.length} unread messages from ${otherUserId} to ${currentUserId}`);
        unreadMessages.forEach((msg, index) => {
            console.log(`🔧 Unread message ${index}: status ${msg.status}, content: "${msg.content}"`);
        });
        const result = await this.messageModel
            .updateMany({
            senderId: otherUserId,
            receiverId: currentUserId,
            status: { $ne: message_schema_1.MessageStatus.READ },
            isDeleted: false
        }, { status: message_schema_1.MessageStatus.READ })
            .exec();
        console.log(`🔧 markConversationAsRead: Updated ${result.modifiedCount} messages from ${otherUserId} to ${currentUserId}`);
        console.log(`🔧 Update result:`, result);
        if (result.modifiedCount > 0) {
            if (this.messagesGateway) {
                this.messagesGateway.sendToUser(currentUserId, 'conversationMarkedAsRead', {
                    userId: otherUserId,
                    markedCount: result.modifiedCount
                });
                this.messagesGateway.sendToUser(otherUserId, 'conversationRead', {
                    userId: currentUserId,
                    markedCount: result.modifiedCount
                });
            }
        }
        else {
            console.log(`🔧 No messages were updated - they might already be marked as read`);
        }
    }
    async deleteMessage(messageId, userId) {
        const message = await this.messageModel
            .findOneAndUpdate({ _id: messageId, senderId: userId }, { isDeleted: true, deletedAt: new Date() }, { new: true })
            .exec();
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
    }
    async getUnreadCount(userId) {
        return this.messageModel
            .countDocuments({
            receiverId: userId,
            status: { $ne: message_schema_1.MessageStatus.READ },
            isDeleted: false,
        })
            .exec();
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], MessagesService);
//# sourceMappingURL=messages.service.js.map