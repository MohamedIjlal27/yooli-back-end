import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsPhoneNumber } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UserStatus } from '../schemas/user.schema';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
} 