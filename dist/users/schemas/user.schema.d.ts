import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserStatus {
    ONLINE = "online",
    OFFLINE = "offline",
    IN_CALL = "in_call",
    AWAY = "away"
}
export declare class User {
    email: string;
    password: string;
    fullName: string;
    avatar?: string;
    phoneNumber?: string;
    status: UserStatus;
    lastSeen?: Date;
    fcmTokens: string[];
    isActive: boolean;
    socketId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
