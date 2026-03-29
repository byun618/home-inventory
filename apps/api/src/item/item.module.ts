import { Module } from '@nestjs/common';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { HouseholdModule } from '../household/household.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [HouseholdModule, EventModule],
  controllers: [ItemController],
  providers: [ItemService],
})
export class ItemModule {}
