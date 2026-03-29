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
import { UpdateItemDto } from './dto/update-item.dto';
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
    @Query('needToBuy') needToBuy?: string,
  ) {
    const household = await this.householdService.findHouseholdByUser(user);
    if (!household) throw new NotFoundException('Household 없음');

    return this.itemService.findAll({
      household,
      space,
      needToBuy: needToBuy === 'true',
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

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
  ) {
    const household = await this.householdService.findHouseholdByUser(user);
    if (!household) throw new NotFoundException('Household 없음');

    const item = await this.itemService.update({
      itemId: id,
      household,
      data: dto,
    });

    this.eventService.emitToHousehold(household.id, {
      event: 'item:updated',
      data: item,
      senderId: user.id,
    });

    return item;
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
