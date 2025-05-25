import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    create(req: any, createMessageDto: CreateMessageDto): Promise<import("./schemas/message.schema").Message>;
    getConversations(req: any): Promise<any[]>;
    getConversation(req: any, userId: string, page?: number, limit?: number): Promise<import("./schemas/message.schema").Message[]>;
    getUnreadCount(req: any): Promise<number>;
    markAsRead(req: any, id: string): Promise<import("./schemas/message.schema").Message>;
    markConversationAsRead(req: any, userId: string): Promise<void>;
    remove(req: any, id: string): Promise<void>;
}
