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
let DocsController = class DocsController {
    getDocs() {
        return {
            title: 'Yooli API Documentation',
            version: '1.0.0',
            description: 'Backend API for Yooli mobile app with WebRTC, messaging, and push notifications',
            baseUrl: 'https://yooli-back-end.vercel.app/api/v1',
            endpoints: {
                auth: {
                    'POST /auth/register': 'Register a new user',
                    'POST /auth/login': 'Login user',
                    'POST /auth/refresh': 'Refresh JWT token',
                    'POST /auth/logout': 'Logout user'
                },
                users: {
                    'GET /users': 'Get all users',
                    'GET /users/profile': 'Get current user profile',
                    'GET /users/:id': 'Get user by ID',
                    'PUT /users/profile': 'Update user profile',
                    'PATCH /users/status': 'Update user status'
                },
                messages: {
                    'POST /messages': 'Send a message',
                    'GET /messages/conversations': 'Get user conversations',
                    'GET /messages/conversation/:userId': 'Get conversation with user',
                    'GET /messages/unread-count': 'Get unread message count',
                    'PATCH /messages/:id/read': 'Mark message as read'
                },
                calls: {
                    'POST /calls': 'Initiate a call',
                    'GET /calls/history': 'Get call history',
                    'GET /calls/active': 'Get active call',
                    'PATCH /calls/:id/answer': 'Answer a call',
                    'PATCH /calls/:id/decline': 'Decline a call',
                    'PATCH /calls/:id/end': 'End a call'
                },
                meetings: {
                    'GET /meetings': 'Get all meetings',
                    'POST /meetings': 'Create a meeting',
                    'GET /meetings/:id': 'Get meeting by ID',
                    'PATCH /meetings/:id': 'Update meeting',
                    'DELETE /meetings/:id': 'Delete meeting',
                    'POST /meetings/:id/join': 'Join a meeting',
                    'POST /meetings/:id/leave': 'Leave a meeting'
                },
                turn: {
                    'GET /turn/credentials': 'Get TURN server credentials',
                    'GET /turn/test': 'Test TURN server connectivity'
                }
            },
            authentication: {
                type: 'Bearer Token',
                header: 'Authorization: Bearer <jwt_token>',
                note: 'Most endpoints require authentication. Get token from /auth/login'
            }
        };
    }
};
__decorate([
    (0, common_1.Get)('docs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DocsController.prototype, "getDocs", null);
DocsController = __decorate([
    (0, common_1.Controller)('api')
], DocsController);
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
        controllers: [HealthController, RootController, DocsController],
        providers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map