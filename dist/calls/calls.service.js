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
exports.CallsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const call_schema_1 = require("./schemas/call.schema");
let CallsService = class CallsService {
    constructor(callModel) {
        this.callModel = callModel;
    }
    async initiateCall(callerId, initiateCallDto) {
        const call = new this.callModel({
            callerId: new mongoose_2.Types.ObjectId(callerId),
            receiverId: new mongoose_2.Types.ObjectId(initiateCallDto.receiverId),
            type: initiateCallDto.type,
            offer: initiateCallDto.offer,
            status: call_schema_1.CallStatus.INITIATED,
        });
        return call.save();
    }
    async answerCall(callId, userId, answer) {
        const call = await this.callModel.findById(callId).exec();
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        if (call.receiverId.toString() !== userId) {
            throw new common_1.BadRequestException('You are not authorized to answer this call');
        }
        if (call.status !== call_schema_1.CallStatus.INITIATED && call.status !== call_schema_1.CallStatus.RINGING) {
            throw new common_1.BadRequestException('Call cannot be answered in current state');
        }
        call.status = call_schema_1.CallStatus.ANSWERED;
        call.answer = answer;
        call.startTime = new Date();
        return call.save();
    }
    async declineCall(callId, userId) {
        const call = await this.callModel.findById(callId).exec();
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        if (call.receiverId.toString() !== userId) {
            throw new common_1.BadRequestException('You are not authorized to decline this call');
        }
        call.status = call_schema_1.CallStatus.DECLINED;
        call.endTime = new Date();
        return call.save();
    }
    async endCall(callId, userId) {
        const call = await this.callModel.findById(callId).exec();
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        if (call.callerId.toString() !== userId && call.receiverId.toString() !== userId) {
            throw new common_1.BadRequestException('You are not authorized to end this call');
        }
        call.status = call_schema_1.CallStatus.ENDED;
        call.endTime = new Date();
        if (call.startTime) {
            call.duration = Math.floor((call.endTime.getTime() - call.startTime.getTime()) / 1000);
        }
        return call.save();
    }
    async addIceCandidate(callId, candidate) {
        const call = await this.callModel.findById(callId).exec();
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        call.iceCandidates.push(candidate);
        return call.save();
    }
    async getCallHistory(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        return this.callModel
            .find({
            $or: [
                { callerId: userId },
                { receiverId: userId },
            ],
        })
            .populate('callerId', 'firstName lastName avatar')
            .populate('receiverId', 'firstName lastName avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }
    async getActiveCall(userId) {
        return this.callModel
            .findOne({
            $or: [
                { callerId: userId },
                { receiverId: userId },
            ],
            status: { $in: [call_schema_1.CallStatus.INITIATED, call_schema_1.CallStatus.RINGING, call_schema_1.CallStatus.ANSWERED] },
        })
            .populate('callerId', 'firstName lastName avatar')
            .populate('receiverId', 'firstName lastName avatar')
            .exec();
    }
    async updateCallStatus(callId, status) {
        const call = await this.callModel
            .findByIdAndUpdate(callId, { status }, { new: true })
            .exec();
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        return call;
    }
    async findCall(callId) {
        const call = await this.callModel
            .findById(callId)
            .populate('callerId', 'firstName lastName avatar')
            .populate('receiverId', 'firstName lastName avatar')
            .exec();
        if (!call) {
            throw new common_1.NotFoundException('Call not found');
        }
        return call;
    }
};
exports.CallsService = CallsService;
exports.CallsService = CallsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(call_schema_1.Call.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CallsService);
//# sourceMappingURL=calls.service.js.map