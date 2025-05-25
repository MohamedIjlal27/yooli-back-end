import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
export declare class NotificationsService {
    private configService;
    private usersService;
    private firebaseApp;
    private isFirebaseEnabled;
    constructor(configService: ConfigService, usersService: UsersService);
    private initializeFirebase;
    sendMessageNotification(userId: string, title: string, body: string, data?: any): Promise<void>;
    sendCallNotification(userId: string, body: string, data?: any): Promise<void>;
    sendBulkNotification(userIds: string[], title: string, body: string, data?: any): Promise<void>;
    isConfigured(): boolean;
    getStatus(): {
        enabled: boolean;
        message: string;
    };
}
