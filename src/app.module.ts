import { Module, Controller, Get } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { MessagesModule } from './messages/messages.module';
import { CallsModule } from './calls/calls.module';
import { MeetingsModule } from './meetings/meetings.module';

@Controller()
class HealthController {
  @Get('health')
  getHealth() {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'yooli-backend' 
    };
  }
}

@Controller()
class RootController {
  @Get()
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
}

@Controller('api')
class DocsController {
  @Get('docs')
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
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    MessagesModule,
    CallsModule,
    MeetingsModule,
    NotificationsModule,
  ],
  controllers: [HealthController, RootController, DocsController],
  providers: [],
})
export class AppModule {} 