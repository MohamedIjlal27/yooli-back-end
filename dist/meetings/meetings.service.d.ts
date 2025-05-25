import { Model } from 'mongoose';
import { Meeting, MeetingDocument } from './schemas/meeting.schema';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
export declare class MeetingsService {
    private meetingModel;
    constructor(meetingModel: Model<MeetingDocument>);
    create(organizerId: string, createMeetingDto: CreateMeetingDto): Promise<Meeting>;
    findAll(userId?: string): Promise<Meeting[]>;
    findOne(id: string): Promise<Meeting>;
    update(id: string, userId: string, updateMeetingDto: UpdateMeetingDto): Promise<Meeting>;
    remove(id: string, userId: string): Promise<void>;
    joinMeeting(meetingId: string, userId: string): Promise<Meeting>;
    leaveMeeting(meetingId: string, userId: string): Promise<void>;
    getUpcomingMeetings(userId: string): Promise<Meeting[]>;
}
