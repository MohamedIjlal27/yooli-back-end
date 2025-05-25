import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CallsService } from './calls.service';
import { CallsController } from './calls.controller';
import { TurnController } from './turn.controller';
import { CallsGateway } from './calls.gateway';
import { Call, CallSchema } from './schemas/call.schema';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TurnService } from '../common/services/turn.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Call.name, schema: CallSchema }]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [CallsController, TurnController],
  providers: [CallsService, CallsGateway, TurnService],
  exports: [CallsService, CallsGateway, TurnService],
})
export class CallsModule {} 