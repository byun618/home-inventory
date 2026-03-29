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
    active?: boolean;
  }): Promise<ItemType[]> {
    const filter: Record<string, unknown> = { household: params.household };
    if (params.space) filter.space = params.space;
    if (params.active !== undefined) filter.active = params.active;

    const items = await this.em.find(Item, filter, {
      orderBy: { createdAt: 'DESC' },
    });

    return items.map((item) => this.toDto(item));
  }

  async create(params: {
    household: Household;
    user: User;
    emoji?: string;
    name: string;
    space: string;
    zone?: string;
    details?: string[];
  }): Promise<ItemType> {
    const item = this.em.create(Item, {
      household: params.household,
      emoji: params.emoji ?? '📦',
      name: params.name,
      space: params.space,
      zone: params.zone ?? null,
      details: params.details ?? [],
      createdBy: params.user,
    });
    await this.em.persistAndFlush(item);

    return this.toDto(item);
  }

  async toggle(params: {
    itemId: string;
    household: Household;
  }): Promise<{ id: string; active: boolean; updatedAt: string }> {
    const item = await this.em.findOne(Item, {
      id: params.itemId,
      household: params.household,
    });
    if (!item) {
      throw new NotFoundException();
    }

    item.active = !item.active;
    item.updatedAt = new Date();
    await this.em.flush();

    return {
      id: item.id,
      active: item.active,
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async delete(params: { itemId: string; household: Household }): Promise<void> {
    const item = await this.em.findOne(Item, {
      id: params.itemId,
      household: params.household,
    });
    if (!item) {
      throw new NotFoundException();
    }

    await this.em.removeAndFlush(item);
  }

  private toDto(item: Item): ItemType {
    return {
      id: item.id,
      emoji: item.emoji,
      name: item.name,
      space: item.space,
      zone: item.zone,
      details: item.details,
      active: item.active,
      createdBy: item.createdBy.id,
      updatedAt: item.updatedAt.toISOString(),
      createdAt: item.createdAt.toISOString(),
    };
  }
}
