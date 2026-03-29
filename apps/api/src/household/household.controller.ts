import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { HouseholdService } from './household.service';
import { CreateHouseholdDto } from './dto/create-household.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/entities';

@Controller('households')
@UseGuards(JwtAuthGuard)
export class HouseholdController {
  constructor(private readonly householdService: HouseholdService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateHouseholdDto) {
    return this.householdService.create({ user, name: dto.name });
  }

  @Get('me')
  getMyHousehold(@CurrentUser() user: User) {
    return this.householdService.getMyHousehold(user);
  }

  @Get('me/members')
  getMembers(@CurrentUser() user: User) {
    return this.householdService.getMembers(user);
  }

  @Delete('me/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @CurrentUser() admin: User,
    @Param('userId') targetUserId: string,
  ) {
    return this.householdService.removeMember({ admin, targetUserId });
  }
}
