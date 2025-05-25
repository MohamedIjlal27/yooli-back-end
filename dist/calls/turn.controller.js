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
var TurnController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurnController = void 0;
const common_1 = require("@nestjs/common");
const turn_service_1 = require("../common/services/turn.service");
let TurnController = TurnController_1 = class TurnController {
    constructor(turnService) {
        this.turnService = turnService;
        this.logger = new common_1.Logger(TurnController_1.name);
    }
    async getCredentials() {
        this.logger.log('📡 TURN credentials requested');
        try {
            const credentials = await this.turnService.getIceServers();
            this.logger.log(`✅ Returning ${credentials.iceServers.length} ICE servers`);
            return credentials;
        }
        catch (error) {
            this.logger.error('❌ Failed to get TURN credentials:', error);
            throw error;
        }
    }
    async testConnectivity() {
        this.logger.log('🧪 Testing TURN server connectivity');
        try {
            const isConnected = await this.turnService.testConnectivity();
            if (isConnected) {
                return {
                    success: true,
                    message: 'TURN server connectivity test passed'
                };
            }
            else {
                return {
                    success: false,
                    message: 'TURN server connectivity test failed'
                };
            }
        }
        catch (error) {
            this.logger.error('❌ TURN connectivity test error:', error);
            return {
                success: false,
                message: `TURN connectivity test failed: ${error.message}`
            };
        }
    }
};
exports.TurnController = TurnController;
__decorate([
    (0, common_1.Get)('credentials'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TurnController.prototype, "getCredentials", null);
__decorate([
    (0, common_1.Get)('test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TurnController.prototype, "testConnectivity", null);
exports.TurnController = TurnController = TurnController_1 = __decorate([
    (0, common_1.Controller)('turn'),
    __metadata("design:paramtypes", [turn_service_1.TurnService])
], TurnController);
//# sourceMappingURL=turn.controller.js.map