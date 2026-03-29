import { Module } from '@nestjs/common';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';
import { HouseholdModule } from '../household/household.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [HouseholdModule, EventModule],
  controllers: [InviteController],
  providers: [InviteService],
})
export class InviteModule {}
