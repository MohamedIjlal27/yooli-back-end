import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  IN_CALL = 'in_call',
  AWAY = 'away',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop()
  avatar?: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.OFFLINE })
  status: UserStatus;

  @Prop()
  lastSeen?: Date;

  @Prop([String])
  fcmTokens: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  socketId?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User); 