import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Call, CallDocument, CallStatus, CallType } from './schemas/call.schema';
import { InitiateCallDto } from './dto/initiate-call.dto';

@Injectable()
export class CallsService {
  constructor(
    @InjectModel(Call.name) private callModel: Model<CallDocument>,
  ) {}

  async initiateCall(callerId: string, initiateCallDto: InitiateCallDto): Promise<Call> {
    const call = new this.callModel({
      callerId: new Types.ObjectId(callerId),
      receiverId: new Types.ObjectId(initiateCallDto.receiverId),
      type: initiateCallDto.type,
      offer: initiateCallDto.offer,
      status: CallStatus.INITIATED,
    });

    return call.save();
  }

  async answerCall(callId: string, userId: string, answer: string): Promise<Call> {
    const call = await this.callModel.findById(callId).exec();
    
    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.receiverId.toString() !== userId) {
      throw new BadRequestException('You are not authorized to answer this call');
    }

    if (call.status !== CallStatus.INITIATED && call.status !== CallStatus.RINGING) {
      throw new BadRequestException('Call cannot be answered in current state');
    }

    call.status = CallStatus.ANSWERED;
    call.answer = answer;
    call.startTime = new Date();

    return call.save();
  }

  async declineCall(callId: string, userId: string): Promise<Call> {
    const call = await this.callModel.findById(callId).exec();
    
    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.receiverId.toString() !== userId) {
      throw new BadRequestException('You are not authorized to decline this call');
    }

    call.status = CallStatus.DECLINED;
    call.endTime = new Date();

    return call.save();
  }

  async endCall(callId: string, userId: string): Promise<Call> {
    const call = await this.callModel.findById(callId).exec();
    
    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.callerId.toString() !== userId && call.receiverId.toString() !== userId) {
      throw new BadRequestException('You are not authorized to end this call');
    }

    call.status = CallStatus.ENDED;
    call.endTime = new Date();
    
    if (call.startTime) {
      call.duration = Math.floor((call.endTime.getTime() - call.startTime.getTime()) / 1000);
    }

    return call.save();
  }

  async addIceCandidate(callId: string, candidate: string): Promise<Call> {
    const call = await this.callModel.findById(callId).exec();
    
    if (!call) {
      throw new NotFoundException('Call not found');
    }

    call.iceCandidates.push(candidate);
    return call.save();
  }

  async getCallHistory(userId: string, page = 1, limit = 20): Promise<Call[]> {
    const skip = (page - 1) * limit;
    
    return this.callModel
      .find({
        $or: [
          { callerId: userId },
          { receiverId: userId },
        ],
      })
      .populate('callerId', 'firstName lastName avatar')
      .populate('receiverId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async getActiveCall(userId: string): Promise<Call | null> {
    return this.callModel
      .findOne({
        $or: [
          { callerId: userId },
          { receiverId: userId },
        ],
        status: { $in: [CallStatus.INITIATED, CallStatus.RINGING, CallStatus.ANSWERED] },
      })
      .populate('callerId', 'firstName lastName avatar')
      .populate('receiverId', 'firstName lastName avatar')
      .exec();
  }

  async updateCallStatus(callId: string, status: CallStatus): Promise<Call> {
    const call = await this.callModel
      .findByIdAndUpdate(callId, { status }, { new: true })
      .exec();

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    return call;
  }

  async findCall(callId: string): Promise<Call> {
    const call = await this.callModel
      .findById(callId)
      .populate('callerId', 'firstName lastName avatar')
      .populate('receiverId', 'firstName lastName avatar')
      .exec();

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    return call;
  }
} 