import { Document, Types } from 'mongoose';
export type MeetingDocument = Meeting & Document;
export declare enum MeetingStatus {
    SCHEDULED = "scheduled",
    ACTIVE = "active",
    ENDED = "ended",
    CANCELLED = "cancelled"
}
export declare class Meeting {
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    videoEnabled: boolean;
    organizerId: Types.ObjectId;
    participantIds: Types.ObjectId[];
    link?: string;
    status: MeetingStatus;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MeetingSchema: import("mongoose").Schema<Meeting, import("mongoose").Model<Meeting, any, any, any, Document<unknown, any, Meeting, any> & Meeting & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Meeting, Document<unknown, {}, import("mongoose").FlatRecord<Meeting>, {}> & import("mongoose").FlatRecord<Meeting> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
