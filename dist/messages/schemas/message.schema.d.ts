import { Document, Types } from 'mongoose';
export type MessageDocument = Message & Document;
export declare enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    AUDIO = "audio",
    VIDEO = "video",
    FILE = "file"
}
export declare enum MessageStatus {
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read"
}
export declare class Message {
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    content: string;
    type: MessageType;
    status: MessageStatus;
    mediaUrl?: string;
    fileName?: string;
    fileSize?: number;
    isEdited: boolean;
    editedAt?: Date;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MessageSchema: import("mongoose").Schema<Message, import("mongoose").Model<Message, any, any, any, Document<unknown, any, Message, any> & Message & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Message, Document<unknown, {}, import("mongoose").FlatRecord<Message>, {}> & import("mongoose").FlatRecord<Message> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
