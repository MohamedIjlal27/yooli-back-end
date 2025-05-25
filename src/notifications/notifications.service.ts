import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  private firebaseApp: admin.app.App;
  private isFirebaseEnabled = false;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const projectId = this.configService.get('FIREBASE_PROJECT_ID');
      const privateKey = this.configService.get('FIREBASE_PRIVATE_KEY');
      const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL');

      // Check if Firebase credentials are provided
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
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });

      this.isFirebaseEnabled = true;
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization error:', error.message);
      console.warn('⚠️  Push notifications will be logged only.');
      this.isFirebaseEnabled = false;
    }
  }

  async sendMessageNotification(
    userId: string,
    title: string,
    body: string,
    data?: any,
  ): Promise<void> {
    // Log notification for debugging
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

      // Send to each token individually
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
        } catch (error) {
          console.error('Failed to send to token:', token, error);
          return { success: false, token };
        }
      });

      const results = await Promise.all(promises);
      
      // Remove failed tokens
      const failedTokens = results
        .filter(result => !result.success)
        .map(result => result.token);

      for (const token of failedTokens) {
        await this.usersService.removeFcmToken(userId, token);
      }
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  }

  async sendCallNotification(
    userId: string,
    body: string,
    data?: any,
  ): Promise<void> {
    // Log notification for debugging
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

      // Send to each token individually
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
            priority: 'high' as const,
            notification: {
              channelId: 'calls',
              priority: 'high' as const,
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
        } catch (error) {
          console.error('Failed to send call notification to token:', token, error);
          return { success: false, token };
        }
      });

      const results = await Promise.all(promises);
      
      // Remove failed tokens
      const failedTokens = results
        .filter(result => !result.success)
        .map(result => result.token);

      for (const token of failedTokens) {
        await this.usersService.removeFcmToken(userId, token);
      }
    } catch (error) {
      console.error('Error sending call notification:', error);
    }
  }

  async sendBulkNotification(
    userIds: string[],
    title: string,
    body: string,
    data?: any,
  ): Promise<void> {
    // Log notification for debugging
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
      const tokens: string[] = [];
      
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

      // Send to each token individually
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
        } catch (error) {
          console.error('Failed to send bulk notification to token:', token, error);
          return null;
        }
      });

      await Promise.all(promises);
      console.log('Bulk notification sent to', tokens.length, 'tokens');
    } catch (error) {
      console.error('Error sending bulk notification:', error);
    }
  }

  // Method to check if Firebase is properly configured
  isConfigured(): boolean {
    return this.isFirebaseEnabled;
  }

  // Method to get Firebase status
  getStatus(): { enabled: boolean; message: string } {
    if (this.isFirebaseEnabled) {
      return { enabled: true, message: 'Firebase is properly configured' };
    }
    return { 
      enabled: false, 
      message: 'Firebase not configured - notifications will be logged only' 
    };
  }
} 