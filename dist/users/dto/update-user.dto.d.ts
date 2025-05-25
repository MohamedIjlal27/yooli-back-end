import { CreateUserDto } from './create-user.dto';
import { UserStatus } from '../schemas/user.schema';
declare const UpdateUserDto_base: import("@nestjs/common").Type<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    status?: UserStatus;
    phoneNumber?: string;
    avatar?: string;
}
export {};
