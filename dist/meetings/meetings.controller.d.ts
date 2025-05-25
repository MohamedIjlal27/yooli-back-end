import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
export declare class MeetingsController {
    private readonly meetingsService;
    constructor(meetingsService: MeetingsService);
    create(req: any, createMeetingDto: CreateMeetingDto): Promise<import("./schemas/meeting.schema").Meeting>;
    findAll(req: any): Promise<import("./schemas/meeting.schema").Meeting[]>;
    getUpcoming(req: any): Promise<import("./schemas/meeting.schema").Meeting[]>;
    findOne(id: string): Promise<import("./schemas/meeting.schema").Meeting>;
    update(req: any, id: string, updateMeetingDto: UpdateMeetingDto): Promise<import("./schemas/meeting.schema").Meeting>;
    remove(req: any, id: string): Promise<void>;
    joinMeeting(req: any, id: string): Promise<import("./schemas/meeting.schema").Meeting>;
    leaveMeeting(req: any, id: string): Promise<void>;
}
