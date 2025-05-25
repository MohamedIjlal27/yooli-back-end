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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const users_module_1 = require("./users/users.module");
const notifications_module_1 = require("./notifications/notifications.module");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const messages_module_1 = require("./messages/messages.module");
const calls_module_1 = require("./calls/calls.module");
const meetings_module_1 = require("./meetings/meetings.module");
let HealthController = class HealthController {
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'yooli-backend'
        };
    }
};
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "getHealth", null);
HealthController = __decorate([
    (0, common_1.Controller)()
], HealthController);
let RootController = class RootController {
    getRoot() {
        return {
            message: 'Yooli Backend API',
            version: '1.0.0',
            status: 'running',
            timestamp: new Date().toISOString(),
            endpoints: {
                health: '/api/v1/health',
                docs: '/api/docs',
                auth: '/api/v1/auth',
                users: '/api/v1/users',
                messages: '/api/v1/messages',
                calls: '/api/v1/calls',
                meetings: '/api/v1/meetings',
                turn: '/api/v1/turn'
            }
        };
    }
};
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RootController.prototype, "getRoot", null);
RootController = __decorate([
    (0, common_1.Controller)()
], RootController);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            messages_module_1.MessagesModule,
            calls_module_1.CallsModule,
            meetings_module_1.MeetingsModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [HealthController, RootController],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map