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
exports.CallsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const calls_service_1 = require("./calls.service");
const initiate_call_dto_1 = require("./dto/initiate-call.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let CallsController = class CallsController {
    constructor(callsService) {
        this.callsService = callsService;
    }
    create(req, initiateCallDto) {
        return this.callsService.initiateCall(req.user.userId, initiateCallDto);
    }
    getHistory(req, page = 1, limit = 20) {
        return this.callsService.getCallHistory(req.user.userId, +page, +limit);
    }
    getActiveCall(req) {
        return this.callsService.getActiveCall(req.user.userId);
    }
    findOne(id) {
        return this.callsService.findCall(id);
    }
    answerCall(req, id, answer) {
        return this.callsService.answerCall(id, req.user.userId, answer);
    }
    declineCall(req, id) {
        return this.callsService.declineCall(id, req.user.userId);
    }
    endCall(req, id) {
        return this.callsService.endCall(id, req.user.userId);
    }
};
exports.CallsController = CallsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate a call' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Call initiated successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, initiate_call_dto_1.InitiateCallDto]),
    __metadata("design:returntype", void 0)
], CallsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get call history' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Call history retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], CallsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active call' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Active call retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CallsController.prototype, "getActiveCall", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get call details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Call details retrieved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CallsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/answer'),
    (0, swagger_1.ApiOperation)({ summary: 'Answer a call' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Call answered successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('answer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CallsController.prototype, "answerCall", null);
__decorate([
    (0, common_1.Patch)(':id/decline'),
    (0, swagger_1.ApiOperation)({ summary: 'Decline a call' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Call declined successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CallsController.prototype, "declineCall", null);
__decorate([
    (0, common_1.Patch)(':id/end'),
    (0, swagger_1.ApiOperation)({ summary: 'End a call' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Call ended successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CallsController.prototype, "endCall", null);
exports.CallsController = CallsController = __decorate([
    (0, swagger_1.ApiTags)('calls'),
    (0, common_1.Controller)('calls'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [calls_service_1.CallsService])
], CallsController);
//# sourceMappingURL=calls.controller.js.map