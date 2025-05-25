import { Model } from 'mongoose';
import { User, UserDocument, UserStatus } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<UserDocument>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    updateStatus(id: string, status: UserStatus): Promise<User>;
    updateSocketId(id: string, socketId: string): Promise<void>;
    addFcmToken(id: string, fcmToken: string): Promise<void>;
    removeFcmToken(id: string, fcmToken: string): Promise<void>;
    remove(id: string): Promise<void>;
    getOnlineUsers(): Promise<User[]>;
}
