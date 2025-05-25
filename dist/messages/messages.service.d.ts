import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class MessagesService {
    private messageModel;
    private messagesGateway;
    constructor(messageModel: Model<MessageDocument>);
    setGateway(gateway: any): void;
    create(senderId: string, createMessageDto: CreateMessageDto): Promise<Message>;
    findConversation(userId1: string, userId2: string, page?: number, limit?: number): Promise<Message[]>;
    findUserConversations(userId: string): Promise<any[]>;
    markAsRead(messageId: string, userId: string): Promise<Message>;
    markConversationAsRead(otherUserId: string, currentUserId: string): Promise<void>;
    deleteMessage(messageId: string, userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
}
