import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { User, Item, Household } from '../common/entities';
import type { Item as ItemType } from '@home-inventory/shared-types';

@Injectable()
export class ItemService {
  constructor(private readonly em: EntityManager) {}

  async findAll(params: {
    household: Household;
    space?: string;
    needToBuy?: boolean;
  }): Promise<ItemType[]> {
    const filter: Record<string, unknown> = { household: params.household };
    if (params.space) filter.space = params.space;
    if (params.needToBuy) filter.quantity = 0;

    const items = await this.em.find(Item, filter, {
      orderBy: { createdAt: 'DESC' },
      populate: ['createdBy'],
    });

    return items.map((item) => this.toDto(item));
  }

  async create(params: {
    household: Household;
    user: User;
    emoji?: string;
    name: string;
    quantity?: number;
    space: string;
    zone?: string;
    details?: string[];
  }): Promise<ItemType> {
    const item = this.em.create(Item, {
      household: params.household,
      emoji: params.emoji ?? '📦',
      name: params.name,
      quantity: params.quantity ?? 1,
      space: params.space,
      zone: params.zone ?? null,
      details: params.details ?? [],
      createdBy: params.user,
    });
    await this.em.persistAndFlush(item);

    return this.toDto(item);
  }

  async update(params: {
    itemId: string;
    household: Household;
    data: {
      emoji?: string;
      name?: string;
      quantity?: number;
      space?: string;
      zone?: string;
      details?: string[];
    };
  }): Promise<ItemType> {
    const item = await this.em.findOne(
      Item,
      { id: params.itemId, household: params.household },
      { populate: ['createdBy'] },
    );
    if (!item) throw new NotFoundException();

    const { data } = params;
    if (data.emoji !== undefined) item.emoji = data.emoji;
    if (data.name !== undefined) item.name = data.name;
    if (data.quantity !== undefined) item.quantity = data.quantity;
    if (data.space !== undefined) item.space = data.space;
    if (data.zone !== undefined) item.zone = data.zone;
    if (data.details !== undefined) item.details = data.details;
    item.updatedAt = new Date();

    await this.em.flush();

    return this.toDto(item);
  }

  async delete(params: { itemId: string; household: Household }): Promise<void> {
    const item = await this.em.findOne(Item, {
      id: params.itemId,
      household: params.household,
    });
    if (!item) throw new NotFoundException();

    await this.em.removeAndFlush(item);
  }

  private toDto(item: Item): ItemType {
    return {
      id: item.id,
      emoji: item.emoji,
      name: item.name,
      quantity: item.quantity,
      space: item.space,
      zone: item.zone,
      details: item.details,
      createdBy: item.createdBy.id,
      updatedAt: item.updatedAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
    };
  }
}
