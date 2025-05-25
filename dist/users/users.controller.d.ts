import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from './schemas/user.schema';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<import("./schemas/user.schema").User>;
    findAll(): Promise<import("./schemas/user.schema").User[]>;
    getOnlineUsers(): Promise<import("./schemas/user.schema").User[]>;
    getProfile(req: any): Promise<import("./schemas/user.schema").User>;
    findOne(id: string): Promise<import("./schemas/user.schema").User>;
    updateProfile(req: any, updateUserDto: UpdateUserDto): Promise<import("./schemas/user.schema").User>;
    updateStatus(req: any, status: UserStatus): Promise<import("./schemas/user.schema").User>;
    addFcmToken(req: any, fcmToken: string): Promise<void>;
    removeFcmToken(req: any, fcmToken: string): Promise<void>;
    remove(req: any): Promise<void>;
}
