import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CallDocument = Call & Document;

export enum CallType {
  AUDIO = 'audio',
  VIDEO = 'video',
}

export enum CallStatus {
  INITIATED = 'initiated',
  RINGING = 'ringing',
  ANSWERED = 'answered',
  ENDED = 'ended',
  MISSED = 'missed',
  DECLINED = 'declined',
}

@Schema({ timestamps: true })
export class Call {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  callerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId: Types.ObjectId;

  @Prop({ type: String, enum: CallType, required: true })
  type: CallType;

  @Prop({ type: String, enum: CallStatus, default: CallStatus.INITIATED })
  status: CallStatus;

  @Prop()
  startTime?: Date;

  @Prop()
  endTime?: Date;

  @Prop({ default: 0 })
  duration: number; // in seconds

  @Prop()
  offer?: string; // WebRTC offer

  @Prop()
  answer?: string; // WebRTC answer

  @Prop([String])
  iceCandidates: string[]; // ICE candidates

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CallSchema = SchemaFactory.createForClass(Call); 