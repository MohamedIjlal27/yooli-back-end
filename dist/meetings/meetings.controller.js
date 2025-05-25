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
exports.MeetingsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const meetings_service_1 = require("./meetings.service");
const create_meeting_dto_1 = require("./dto/create-meeting.dto");
const update_meeting_dto_1 = require("./dto/update-meeting.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let MeetingsController = class MeetingsController {
    constructor(meetingsService) {
        this.meetingsService = meetingsService;
    }
    create(req, createMeetingDto) {
        return this.meetingsService.create(req.user.userId, createMeetingDto);
    }
    findAll(req) {
        return this.meetingsService.findAll(req.user.userId);
    }
    getUpcoming(req) {
        return this.meetingsService.getUpcomingMeetings(req.user.userId);
    }
    findOne(id) {
        return this.meetingsService.findOne(id);
    }
    update(req, id, updateMeetingDto) {
        return this.meetingsService.update(id, req.user.userId, updateMeetingDto);
    }
    remove(req, id) {
        return this.meetingsService.remove(id, req.user.userId);
    }
    joinMeeting(req, id) {
        return this.meetingsService.joinMeeting(id, req.user.userId);
    }
    leaveMeeting(req, id) {
        return this.meetingsService.leaveMeeting(id, req.user.userId);
    }
};
exports.MeetingsController = MeetingsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new meeting' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Meeting created successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_meeting_dto_1.CreateMeetingDto]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all meetings for the user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Meetings retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('upcoming'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upcoming meetings for the user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Upcoming meetings retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "getUpcoming", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get meeting by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Meeting retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a meeting' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Meeting updated successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_meeting_dto_1.UpdateMeetingDto]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a meeting' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Meeting deleted successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    (0, swagger_1.ApiOperation)({ summary: 'Join a meeting' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Meeting joined successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "joinMeeting", null);
__decorate([
    (0, common_1.Post)(':id/leave'),
    (0, swagger_1.ApiOperation)({ summary: 'Leave a meeting' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Left meeting successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MeetingsController.prototype, "leaveMeeting", null);
exports.MeetingsController = MeetingsController = __decorate([
    (0, swagger_1.ApiTags)('meetings'),
    (0, common_1.Controller)('meetings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [meetings_service_1.MeetingsService])
], MeetingsController);
//# sourceMappingURL=meetings.controller.js.map