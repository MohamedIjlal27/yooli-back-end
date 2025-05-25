import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<any>;
    login(req: any, loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            fullName: any;
            avatar: any;
            status: import("../users/schemas/user.schema").UserStatus;
        };
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
}
