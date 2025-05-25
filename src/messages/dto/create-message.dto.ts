import { IsString, IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../schemas/message.schema';

export class CreateMessageDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  receiverId: string;

  @ApiProperty({ example: 'Hello, how are you?' })
  @IsString()
  content: string;

  @ApiProperty({ enum: MessageType, default: MessageType.TEXT })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({ example: 'https://example.com/media.jpg', required: false })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiProperty({ example: 'document.pdf', required: false })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiProperty({ example: 1024, required: false })
  @IsOptional()
  fileSize?: number;
} 