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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = require("firebase-admin");
const users_service_1 = require("../users/users.service");
let NotificationsService = class NotificationsService {
    constructor(configService, usersService) {
        this.configService = configService;
        this.usersService = usersService;
        this.isFirebaseEnabled = false;
        this.initializeFirebase();
    }
    initializeFirebase() {
        try {
            const projectId = this.configService.get('FIREBASE_PROJECT_ID');
            const privateKey = this.configService.get('FIREBASE_PRIVATE_KEY');
            const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL');
            if (!projectId || !privateKey || !clientEmail) {
                console.warn('⚠️  Firebase credentials not found. Push notifications will be logged only.');
                this.isFirebaseEnabled = false;
                return;
            }
            const serviceAccount = {
                projectId,
                privateKeyId: this.configService.get('FIREBASE_PRIVATE_KEY_ID'),
                privateKey: privateKey.replace(/\\n/g, '\n'),
                clientEmail,
                clientId: this.configService.get('FIREBASE_CLIENT_ID'),
                authUri: this.configService.get('FIREBASE_AUTH_URI'),
                tokenUri: this.configService.get('FIREBASE_TOKEN_URI'),
            };
            this.firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            this.isFirebaseEnabled = true;
            console.log('✅ Firebase initialized successfully');
        }
        catch (error) {
            console.error('❌ Firebase initialization error:', error.message);
            console.warn('⚠️  Push notifications will be logged only.');
            this.isFirebaseEnabled = false;
        }
    }
    async sendMessageNotification(userId, title, body, data) {
        console.log('📱 Message Notification:', {
            userId,
            title,
            body,
            data,
            timestamp: new Date().toISOString(),
        });
        if (!this.isFirebaseEnabled) {
            console.log('⚠️  Firebase not enabled - notification logged only');
            return;
        }
        try {
            const user = await this.usersService.findOne(userId);
            if (!user.fcmTokens || user.fcmTokens.length === 0) {
                console.log(`No FCM tokens found for user ${userId}`);
                return;
            }
            const promises = user.fcmTokens.map(async (token) => {
                const message = {
                    notification: {
                        title,
                        body,
                    },
                    data: {
                        type: 'message',
                        ...data,
                    },
                    token,
                };
                try {
                    const response = await admin.messaging().send(message);
                    console.log('Message notification sent:', response);
                    return { success: true, token };
                }
                catch (error) {
                    console.error('Failed to send to token:', token, error);
                    return { success: false, token };
                }
            });
            const results = await Promise.all(promises);
            const failedTokens = results
                .filter(result => !result.success)
                .map(result => result.token);
            for (const token of failedTokens) {
                await this.usersService.removeFcmToken(userId, token);
            }
        }
        catch (error) {
            console.error('Error sending message notification:', error);
        }
    }
    async sendCallNotification(userId, body, data) {
        console.log('📞 Call Notification:', {
            userId,
            title: 'Incoming Call',
            body,
            data,
            timestamp: new Date().toISOString(),
        });
        if (!this.isFirebaseEnabled) {
            console.log('⚠️  Firebase not enabled - call notification logged only');
            return;
        }
        try {
            const user = await this.usersService.findOne(userId);
            if (!user.fcmTokens || user.fcmTokens.length === 0) {
                console.log(`No FCM tokens found for user ${userId}`);
                return;
            }
            const promises = user.fcmTokens.map(async (token) => {
                const message = {
                    notification: {
                        title: 'Incoming Call',
                        body,
                    },
                    data: {
                        type: 'call',
                        ...data,
                    },
                    android: {
                        priority: 'high',
                        notification: {
                            channelId: 'calls',
                            priority: 'high',
                            defaultSound: true,
                            defaultVibrateTimings: true,
                        },
                    },
                    apns: {
                        payload: {
                            aps: {
                                alert: {
                                    title: 'Incoming Call',
                                    body,
                                },
                                sound: 'default',
                                badge: 1,
                                category: 'CALL_INVITATION',
                            },
                        },
                    },
                    token,
                };
                try {
                    const response = await admin.messaging().send(message);
                    console.log('Call notification sent:', response);
                    return { success: true, token };
                }
                catch (error) {
                    console.error('Failed to send call notification to token:', token, error);
                    return { success: false, token };
                }
            });
            const results = await Promise.all(promises);
            const failedTokens = results
                .filter(result => !result.success)
                .map(result => result.token);
            for (const token of failedTokens) {
                await this.usersService.removeFcmToken(userId, token);
            }
        }
        catch (error) {
            console.error('Error sending call notification:', error);
        }
    }
    async sendBulkNotification(userIds, title, body, data) {
        console.log('📢 Bulk Notification:', {
            userIds,
            title,
            body,
            data,
            timestamp: new Date().toISOString(),
        });
        if (!this.isFirebaseEnabled) {
            console.log('⚠️  Firebase not enabled - bulk notification logged only');
            return;
        }
        try {
            const tokens = [];
            for (const userId of userIds) {
                const user = await this.usersService.findOne(userId);
                if (user.fcmTokens && user.fcmTokens.length > 0) {
                    tokens.push(...user.fcmTokens);
                }
            }
            if (tokens.length === 0) {
                console.log('No FCM tokens found for bulk notification');
                return;
            }
            const promises = tokens.map(async (token) => {
                const message = {
                    notification: {
                        title,
                        body,
                    },
                    data: {
                        type: 'bulk',
                        ...data,
                    },
                    token,
                };
                try {
                    return await admin.messaging().send(message);
                }
                catch (error) {
                    console.error('Failed to send bulk notification to token:', token, error);
                    return null;
                }
            });
            await Promise.all(promises);
            console.log('Bulk notification sent to', tokens.length, 'tokens');
        }
        catch (error) {
            console.error('Error sending bulk notification:', error);
        }
    }
    isConfigured() {
        return this.isFirebaseEnabled;
    }
    getStatus() {
        if (this.isFirebaseEnabled) {
            return { enabled: true, message: 'Firebase is properly configured' };
        }
        return {
            enabled: false,
            message: 'Firebase not configured - notifications will be logged only'
        };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map