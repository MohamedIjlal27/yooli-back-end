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
exports.MeetingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const meeting_schema_1 = require("./schemas/meeting.schema");
let MeetingsService = class MeetingsService {
    constructor(meetingModel) {
        this.meetingModel = meetingModel;
    }
    async create(organizerId, createMeetingDto) {
        try {
            const meeting = new this.meetingModel({
                ...createMeetingDto,
                organizerId: new mongoose_2.Types.ObjectId(organizerId),
                participantIds: createMeetingDto.participantIds?.map(id => new mongoose_2.Types.ObjectId(id)) || [],
            });
            const savedMeeting = await meeting.save();
            return await this.findOne(savedMeeting._id.toString());
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to create meeting');
        }
    }
    async findAll(userId) {
        try {
            const query = userId
                ? {
                    $or: [
                        { organizerId: new mongoose_2.Types.ObjectId(userId) },
                        { participantIds: new mongoose_2.Types.ObjectId(userId) }
                    ]
                }
                : {};
            return await this.meetingModel
                .find(query)
                .populate('organizerId', 'fullName email')
                .populate('participantIds', 'fullName email')
                .sort({ date: 1, startTime: 1 })
                .exec();
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch meetings');
        }
    }
    async findOne(id) {
        try {
            const meeting = await this.meetingModel
                .findById(id)
                .populate('organizerId', 'fullName email')
                .populate('participantIds', 'fullName email')
                .exec();
            if (!meeting) {
                throw new common_1.NotFoundException('Meeting not found');
            }
            return meeting;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to fetch meeting');
        }
    }
    async update(id, userId, updateMeetingDto) {
        try {
            const meeting = await this.meetingModel.findById(id);
            if (!meeting) {
                throw new common_1.NotFoundException('Meeting not found');
            }
            if (meeting.organizerId.toString() !== userId) {
                throw new common_1.BadRequestException('Only the organizer can update the meeting');
            }
            const updatedMeeting = await this.meetingModel
                .findByIdAndUpdate(id, {
                ...updateMeetingDto,
                participantIds: updateMeetingDto.participantIds?.map(id => new mongoose_2.Types.ObjectId(id)),
            }, { new: true })
                .populate('organizerId', 'fullName email')
                .populate('participantIds', 'fullName email')
                .exec();
            return updatedMeeting;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to update meeting');
        }
    }
    async remove(id, userId) {
        try {
            const meeting = await this.meetingModel.findById(id);
            if (!meeting) {
                throw new common_1.NotFoundException('Meeting not found');
            }
            if (meeting.organizerId.toString() !== userId) {
                throw new common_1.BadRequestException('Only the organizer can delete the meeting');
            }
            await this.meetingModel.findByIdAndDelete(id);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to delete meeting');
        }
    }
    async joinMeeting(meetingId, userId) {
        try {
            const meeting = await this.meetingModel.findById(meetingId);
            if (!meeting) {
                throw new common_1.NotFoundException('Meeting not found');
            }
            const isParticipant = meeting.participantIds.some(id => id.toString() === userId);
            const isOrganizer = meeting.organizerId.toString() === userId;
            if (!isParticipant && !isOrganizer) {
                meeting.participantIds.push(new mongoose_2.Types.ObjectId(userId));
                await meeting.save();
            }
            const now = new Date();
            const meetingDateTime = new Date(`${meeting.date} ${meeting.startTime}`);
            if (now >= meetingDateTime && meeting.status === meeting_schema_1.MeetingStatus.SCHEDULED) {
                meeting.status = meeting_schema_1.MeetingStatus.ACTIVE;
                await meeting.save();
            }
            return await this.findOne(meetingId);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to join meeting');
        }
    }
    async leaveMeeting(meetingId, userId) {
        try {
            const meeting = await this.meetingModel.findById(meetingId);
            if (!meeting) {
                throw new common_1.NotFoundException('Meeting not found');
            }
            meeting.participantIds = meeting.participantIds.filter(id => id.toString() !== userId);
            await meeting.save();
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException('Failed to leave meeting');
        }
    }
    async getUpcomingMeetings(userId) {
        try {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            return await this.meetingModel
                .find({
                $and: [
                    {
                        $or: [
                            { organizerId: new mongoose_2.Types.ObjectId(userId) },
                            { participantIds: new mongoose_2.Types.ObjectId(userId) }
                        ]
                    },
                    { status: meeting_schema_1.MeetingStatus.SCHEDULED },
                    {
                        $or: [
                            { date: { $gt: today } },
                            {
                                date: today,
                                startTime: { $gte: now.toTimeString().slice(0, 5) }
                            }
                        ]
                    }
                ]
            })
                .populate('organizerId', 'fullName email')
                .populate('participantIds', 'fullName email')
                .sort({ date: 1, startTime: 1 })
                .exec();
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to fetch upcoming meetings');
        }
    }
};
exports.MeetingsService = MeetingsService;
exports.MeetingsService = MeetingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(meeting_schema_1.Meeting.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], MeetingsService);
//# sourceMappingURL=meetings.service.js.map