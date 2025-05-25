"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcryptjs");
const user_schema_1 = require("./schemas/user.schema");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(createUserDto) {
        if (createUserDto.password !== createUserDto.confirmPassword) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        const existingUser = await this.userModel.findOne({ email: createUserDto.email });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
        const { confirmPassword, ...userData } = createUserDto;
        const user = new this.userModel({
            ...userData,
            password: hashedPassword,
        });
        return user.save();
    }
    async findAll() {
        return this.userModel.find({ isActive: true }).select('-password').exec();
    }
    async findOne(id) {
        const user = await this.userModel.findById(id).select('-password').exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email, isActive: true }).exec();
    }
    async update(id, updateUserDto) {
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 12);
        }
        const user = await this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true })
            .select('-password')
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateStatus(id, status) {
        const user = await this.userModel
            .findByIdAndUpdate(id, { status, lastSeen: new Date() }, { new: true })
            .select('-password')
            .exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateSocketId(id, socketId) {
        await this.userModel.findByIdAndUpdate(id, { socketId }).exec();
    }
    async addFcmToken(id, fcmToken) {
        await this.userModel.findByIdAndUpdate(id, { $addToSet: { fcmTokens: fcmToken } }).exec();
    }
    async removeFcmToken(id, fcmToken) {
        await this.userModel.findByIdAndUpdate(id, { $pull: { fcmTokens: fcmToken } }).exec();
    }
    async remove(id) {
        const user = await this.userModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
    }
    async getOnlineUsers() {
        return this.userModel
            .find({ status: { $in: [user_schema_1.UserStatus.ONLINE, user_schema_1.UserStatus.IN_CALL] } })
            .select('-password')
            .exec();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map