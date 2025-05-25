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
  controllers: [HealthController],
  providers: [],
})
export class AppModule {} 