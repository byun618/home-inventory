import { Module } from '@nestjs/common';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { HouseholdModule } from '../household/household.module';

@Module({
  imports: [HouseholdModule],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
