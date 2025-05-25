import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MeetingDocument = Meeting & Document;

export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Meeting {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  date: string; // YYYY-MM-DD format

  @Prop({ required: true })
  startTime: string; // HH:MM format

  @Prop({ required: true })
  endTime: string; // HH:MM format

  @Prop({ default: true })
  videoEnabled: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  organizerId: Types.ObjectId;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  participantIds: Types.ObjectId[];

  @Prop()
  link?: string;

  @Prop({ type: String, enum: MeetingStatus, default: MeetingStatus.SCHEDULED })
  status: MeetingStatus;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting); 