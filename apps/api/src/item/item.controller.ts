import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/entities';
import { HouseholdService } from '../household/household.service';
import { EventService } from '../event/event.service';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly householdService: HouseholdService,
    private readonly eventService: EventService,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('space') space?: string,
    @Query('active') active?: string,
  ) {
    const household = await this.householdService.findHouseholdByUser(user);
    if (!household) throw new NotFoundException('Household 없음');

    return this.itemService.findAll({
      household,
      space,
      active: active !== undefined ? active === 'true' : undefined,
    });
  }

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateItemDto) {
    const household = await this.householdService.findHouseholdByUser(user);
    if (!household) throw new NotFoundException('Household 없음');

    const item = await this.itemService.create({
      household,
      user,
      ...dto,
    });

    this.eventService.emitToHousehold(household.id, {
      event: 'item:created',
      data: item,
      senderId: user.id,
    });

    return item;
  }

  @Patch(':id/toggle')
  async toggle(@CurrentUser() user: User, @Param('id') id: string) {
    const household = await this.householdService.findHouseholdByUser(user);
    if (!household) throw new NotFoundException('Household 없음');

    const result = await this.itemService.toggle({
      itemId: id,
      household,
    });

    this.eventService.emitToHousehold(household.id, {
      event: 'item:toggled',
      data: result,
      senderId: user.id,
    });

    return result;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user: User, @Param('id') id: string) {
    const household = await this.householdService.findHouseholdByUser(user);
    if (!household) throw new NotFoundException('Household 없음');

    await this.itemService.delete({ itemId: id, household });

    this.eventService.emitToHousehold(household.id, {
      event: 'item:deleted',
      data: { id },
      senderId: user.id,
    });
  }
}
