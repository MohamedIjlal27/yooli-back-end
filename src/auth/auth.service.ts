import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    // Update user status to online
    await this.usersService.updateStatus(user._id, UserStatus.ONLINE);

    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        status: UserStatus.ONLINE,
      },
    };
  }

  async register(createUserDto: any): Promise<any> {
    const user = await this.usersService.create(createUserDto);
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    const { password, ...result } = userObj;
    return this.login(result);
  }

  async logout(userId: string): Promise<void> {
    // Update user status to offline
    await this.usersService.updateStatus(userId, UserStatus.OFFLINE);
  }
} 