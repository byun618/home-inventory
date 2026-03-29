import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/entities';
import { HouseholdService } from '../household/household.service';
import { EventService } from '../event/event.service';

@Controller('invites')
export class InviteController {
  constructor(
    private readonly inviteService: InviteService,
    private readonly householdService: HouseholdService,
    private readonly eventService: EventService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: User) {
    const household = await this.householdService.findHouseholdByUser(user);
    if (!household) throw new NotFoundException('Household 없음');

    return this.inviteService.create({ user, household });
  }

  @Get(':token')
  getInfo(@Param('token') token: string) {
    return this.inviteService.getInfo(token);
  }

  @Post(':token/accept')
  @UseGuards(JwtAuthGuard)
  async accept(
    @CurrentUser() user: User,
    @Param('token') token: string,
  ) {
    const result = await this.inviteService.accept({ token, user });

    this.eventService.emitToHousehold(result.householdId, {
      event: 'member:joined',
      data: {
        userId: user.id,
        name: user.name,
        profileEmoji: user.profileEmoji,
        role: 'member' as const,
      },
      senderId: user.id,
    });

    return result;
  }
}
