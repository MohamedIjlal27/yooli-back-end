import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserStatus } from '../users/schemas/user.schema';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            fullName: any;
            avatar: any;
            status: UserStatus;
        };
    }>;
    register(createUserDto: any): Promise<any>;
    logout(userId: string): Promise<void>;
}
