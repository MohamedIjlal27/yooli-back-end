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
  controllers: [HealthController, RootController],
  providers: [],
})
export class AppModule {} 