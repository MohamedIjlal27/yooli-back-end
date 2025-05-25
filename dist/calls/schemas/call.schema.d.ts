import { Document, Types } from 'mongoose';
export type CallDocument = Call & Document;
export declare enum CallType {
    AUDIO = "audio",
    VIDEO = "video"
}
export declare enum CallStatus {
    INITIATED = "initiated",
    RINGING = "ringing",
    ANSWERED = "answered",
    ENDED = "ended",
    MISSED = "missed",
    DECLINED = "declined"
}
export declare class Call {
    callerId: Types.ObjectId;
    receiverId: Types.ObjectId;
    type: CallType;
    status: CallStatus;
    startTime?: Date;
    endTime?: Date;
    duration: number;
    offer?: string;
    answer?: string;
    iceCandidates: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const CallSchema: import("mongoose").Schema<Call, import("mongoose").Model<Call, any, any, any, Document<unknown, any, Call, any> & Call & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Call, Document<unknown, {}, import("mongoose").FlatRecord<Call>, {}> & import("mongoose").FlatRecord<Call> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
