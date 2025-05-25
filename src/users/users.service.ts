import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserStatus } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Validate password confirmation
    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
    
    // Remove confirmPassword from the data before saving
    const { confirmPassword, ...userData } = createUserDto;
    
    const user = new this.userModel({
      ...userData,
      password: hashedPassword,
    });

    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({ isActive: true }).select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email, isActive: true }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { status, lastSeen: new Date() },
        { new: true }
      )
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateSocketId(id: string, socketId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { socketId }).exec();
  }

  async addFcmToken(id: string, fcmToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      id,
      { $addToSet: { fcmTokens: fcmToken } }
    ).exec();
  }

  async removeFcmToken(id: string, fcmToken: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      id,
      { $pull: { fcmTokens: fcmToken } }
    ).exec();
  }

  async remove(id: string): Promise<void> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  async getOnlineUsers(): Promise<User[]> {
    return this.userModel
      .find({ status: { $in: [UserStatus.ONLINE, UserStatus.IN_CALL] } })
      .select('-password')
      .exec();
  }
} 