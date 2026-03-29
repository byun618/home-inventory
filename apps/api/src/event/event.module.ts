import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventGateway } from './event.gateway';
import { EventService } from './event.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    }),
  ],
  providers: [EventGateway, EventService],
  exports: [EventService],
})
export class EventModule {}
