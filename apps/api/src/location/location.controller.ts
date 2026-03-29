import {
  Controller,
  Get,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/entities';
import { HouseholdService } from '../household/household.service';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    private readonly householdService: HouseholdService,
  ) {}

  @Get('spaces')
  async getSpaces(@CurrentUser() user: User) {
    const household = await this.householdService.findHouseholdByUser(user);
    if (!household) throw new NotFoundException('Household 없음');

    return this.locationService.getSpaces(household);
  }

  @Get('zones')
  async getZones(
    @CurrentUser() user: User,
    @Query('space') space: string,
  ) {
    const household = await this.householdService.findHouseholdByUser(user);
    if (!household) throw new NotFoundException('Household 없음');

    return this.locationService.getZones({ household, space });
  }

  @Get('details')
  async getDetails(
    @CurrentUser() user: User,
    @Query('space') space: string,
    @Query('zone') zone: string,
  ) {
    const household = await this.householdService.findHouseholdByUser(user);
    if (!household) throw new NotFoundException('Household 없음');

    return this.locationService.getDetails({ household, space, zone });
  }
}
