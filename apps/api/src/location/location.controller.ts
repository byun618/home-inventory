import {
  Controller,
  Get,
  Put,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { RenameLocationDto } from './dto/rename-location.dto';
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

  private async getHousehold(user: User) {
    const household = await this.householdService.findHouseholdByUser(user);
    if (!household) throw new NotFoundException('Household 없음');
    return household;
  }

  // --- GET ---

  @Get('spaces')
  async getSpaces(@CurrentUser() user: User) {
    const household = await this.getHousehold(user);
    return this.locationService.getSpaces(household);
  }

  @Get('zones')
  async getZones(@CurrentUser() user: User, @Query('space') space: string) {
    const household = await this.getHousehold(user);
    return this.locationService.getZones({ household, space });
  }

  @Get('details')
  async getDetails(
    @CurrentUser() user: User,
    @Query('space') space: string,
    @Query('zone') zone: string,
  ) {
    const household = await this.getHousehold(user);
    return this.locationService.getDetails({ household, space, zone });
  }

  // --- PUT (rename) ---

  @Put('spaces/:name')
  async renameSpace(
    @CurrentUser() user: User,
    @Param('name') name: string,
    @Body() dto: RenameLocationDto,
  ) {
    const household = await this.getHousehold(user);
    return this.locationService.renameSpace({
      household,
      oldName: name,
      newName: dto.newName,
    });
  }

  @Put('zones/:name')
  async renameZone(
    @CurrentUser() user: User,
    @Param('name') name: string,
    @Query('space') space: string,
    @Body() dto: RenameLocationDto,
  ) {
    const household = await this.getHousehold(user);
    return this.locationService.renameZone({
      household,
      space,
      oldName: name,
      newName: dto.newName,
    });
  }

  @Put('details/:name')
  async renameDetail(
    @CurrentUser() user: User,
    @Param('name') name: string,
    @Query('space') space: string,
    @Query('zone') zone: string,
    @Body() dto: RenameLocationDto,
  ) {
    const household = await this.getHousehold(user);
    return this.locationService.renameDetail({
      household,
      space,
      zone,
      oldName: name,
      newName: dto.newName,
    });
  }

  // --- DELETE ---

  @Delete('spaces/:name')
  async deleteSpace(@CurrentUser() user: User, @Param('name') name: string) {
    const household = await this.getHousehold(user);
    return this.locationService.deleteSpace({ household, name });
  }

  @Delete('zones/:name')
  async deleteZone(
    @CurrentUser() user: User,
    @Param('name') name: string,
    @Query('space') space: string,
  ) {
    const household = await this.getHousehold(user);
    return this.locationService.deleteZone({ household, space, name });
  }

  @Delete('details/:name')
  async deleteDetail(
    @CurrentUser() user: User,
    @Param('name') name: string,
    @Query('space') space: string,
    @Query('zone') zone: string,
  ) {
    const household = await this.getHousehold(user);
    return this.locationService.deleteDetail({ household, space, zone, name });
  }
}
