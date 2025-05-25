import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CallType } from '../schemas/call.schema';

export class InitiateCallDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  receiverId: string;

  @ApiProperty({ enum: CallType })
  @IsEnum(CallType)
  type: CallType;

  @ApiProperty({ example: 'WebRTC offer SDP', required: false })
  @IsOptional()
  @IsString()
  offer?: string;
} 