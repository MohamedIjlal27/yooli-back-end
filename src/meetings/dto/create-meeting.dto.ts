import { IsString, IsOptional, IsBoolean, IsArray, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMeetingDto {
  @ApiProperty({ example: 'Team Standup Meeting' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Daily standup to discuss progress', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsString()
  date: string;

  @ApiProperty({ example: '10:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '11:00' })
  @IsString()
  endTime: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  videoEnabled?: boolean;

  @ApiProperty({ example: ['507f1f77bcf86cd799439011'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participantIds?: string[];

  @ApiProperty({ example: 'https://meet.yooli.com/meeting-123', required: false })
  @IsOptional()
  @IsString()
  link?: string;
} 