import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meeting, MeetingDocument, MeetingStatus } from './schemas/meeting.schema';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>,
  ) {}

  async create(organizerId: string, createMeetingDto: CreateMeetingDto): Promise<Meeting> {
    try {
      const meeting = new this.meetingModel({
        ...createMeetingDto,
        organizerId: new Types.ObjectId(organizerId),
        participantIds: createMeetingDto.participantIds?.map(id => new Types.ObjectId(id)) || [],
      });

      const savedMeeting = await meeting.save();
      return await this.findOne(savedMeeting._id.toString());
    } catch (error) {
      throw new BadRequestException('Failed to create meeting');
    }
  }

  async findAll(userId?: string): Promise<Meeting[]> {
    try {
      const query = userId 
        ? {
            $or: [
              { organizerId: new Types.ObjectId(userId) },
              { participantIds: new Types.ObjectId(userId) }
            ]
          }
        : {};

      return await this.meetingModel
        .find(query)
        .populate('organizerId', 'fullName email')
        .populate('participantIds', 'fullName email')
        .sort({ date: 1, startTime: 1 })
        .exec();
    } catch (error) {
      throw new BadRequestException('Failed to fetch meetings');
    }
  }

  async findOne(id: string): Promise<Meeting> {
    try {
      const meeting = await this.meetingModel
        .findById(id)
        .populate('organizerId', 'fullName email')
        .populate('participantIds', 'fullName email')
        .exec();

      if (!meeting) {
        throw new NotFoundException('Meeting not found');
      }

      return meeting;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch meeting');
    }
  }

  async update(id: string, userId: string, updateMeetingDto: UpdateMeetingDto): Promise<Meeting> {
    try {
      const meeting = await this.meetingModel.findById(id);
      
      if (!meeting) {
        throw new NotFoundException('Meeting not found');
      }

      // Check if user is the organizer
      if (meeting.organizerId.toString() !== userId) {
        throw new BadRequestException('Only the organizer can update the meeting');
      }

      const updatedMeeting = await this.meetingModel
        .findByIdAndUpdate(
          id,
          {
            ...updateMeetingDto,
            participantIds: updateMeetingDto.participantIds?.map(id => new Types.ObjectId(id)),
          },
          { new: true }
        )
        .populate('organizerId', 'fullName email')
        .populate('participantIds', 'fullName email')
        .exec();

      return updatedMeeting!;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update meeting');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const meeting = await this.meetingModel.findById(id);
      
      if (!meeting) {
        throw new NotFoundException('Meeting not found');
      }

      // Check if user is the organizer
      if (meeting.organizerId.toString() !== userId) {
        throw new BadRequestException('Only the organizer can delete the meeting');
      }

      await this.meetingModel.findByIdAndDelete(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete meeting');
    }
  }

  async joinMeeting(meetingId: string, userId: string): Promise<Meeting> {
    try {
      const meeting = await this.meetingModel.findById(meetingId);
      
      if (!meeting) {
        throw new NotFoundException('Meeting not found');
      }

      // Check if user is already a participant
      const isParticipant = meeting.participantIds.some(id => id.toString() === userId);
      const isOrganizer = meeting.organizerId.toString() === userId;

      if (!isParticipant && !isOrganizer) {
        meeting.participantIds.push(new Types.ObjectId(userId));
        await meeting.save();
      }

      // Update meeting status to active if it's the start time
      const now = new Date();
      const meetingDateTime = new Date(`${meeting.date} ${meeting.startTime}`);
      
      if (now >= meetingDateTime && meeting.status === MeetingStatus.SCHEDULED) {
        meeting.status = MeetingStatus.ACTIVE;
        await meeting.save();
      }

      return await this.findOne(meetingId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to join meeting');
    }
  }

  async leaveMeeting(meetingId: string, userId: string): Promise<void> {
    try {
      const meeting = await this.meetingModel.findById(meetingId);
      
      if (!meeting) {
        throw new NotFoundException('Meeting not found');
      }

      // Remove user from participants
      meeting.participantIds = meeting.participantIds.filter(id => id.toString() !== userId);
      await meeting.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to leave meeting');
    }
  }

  async getUpcomingMeetings(userId: string): Promise<Meeting[]> {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      return await this.meetingModel
        .find({
          $and: [
            {
              $or: [
                { organizerId: new Types.ObjectId(userId) },
                { participantIds: new Types.ObjectId(userId) }
              ]
            },
            { status: MeetingStatus.SCHEDULED },
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
    } catch (error) {
      throw new BadRequestException('Failed to fetch upcoming meetings');
    }
  }
}