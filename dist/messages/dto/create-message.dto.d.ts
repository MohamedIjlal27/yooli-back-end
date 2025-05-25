import { MessageType } from '../schemas/message.schema';
export declare class CreateMessageDto {
    receiverId: string;
    content: string;
    type?: MessageType;
    mediaUrl?: string;
    fileName?: string;
    fileSize?: number;
}
