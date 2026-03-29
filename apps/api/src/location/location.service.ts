import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Item, Household } from '../common/entities';

@Injectable()
export class LocationService {
  constructor(private readonly em: EntityManager) {}

  async getSpaces(household: Household): Promise<string[]> {
    const items = await this.em.find(
      Item,
      { household },
      { fields: ['space'] },
    );
    return [...new Set(items.map((item) => item.space))];
  }

  async getZones(params: {
    household: Household;
    space: string;
  }): Promise<string[]> {
    const items = await this.em.find(
      Item,
      { household: params.household, space: params.space },
      { fields: ['zone'] },
    );
    return [
      ...new Set(
        items.map((item) => item.zone).filter((zone): zone is string => zone !== null),
      ),
    ];
  }

  async getDetails(params: {
    household: Household;
    space: string;
    zone: string;
  }): Promise<string[]> {
    const items = await this.em.find(
      Item,
      {
        household: params.household,
        space: params.space,
        zone: params.zone,
      },
      { fields: ['details'] },
    );
    return [...new Set(items.flatMap((item) => item.details))];
  }

  async renameSpace(params: {
    household: Household;
    oldName: string;
    newName: string;
  }) {
    const items = await this.em.find(Item, {
      household: params.household,
      space: params.oldName,
    });
    if (items.length === 0) throw new NotFoundException('존재하지 않는 공간');

    for (const item of items) {
      item.space = params.newName;
    }
    await this.em.flush();

    return { oldName: params.oldName, newName: params.newName, affectedItems: items.length };
  }

  async deleteSpace(params: { household: Household; name: string }) {
    const items = await this.em.find(Item, {
      household: params.household,
      space: params.name,
    });
    if (items.length === 0) throw new NotFoundException('존재하지 않는 공간');

    for (const item of items) {
      item.space = '';
      item.zone = null;
      item.details = [];
    }
    await this.em.flush();

    return { deletedName: params.name, affectedItems: items.length };
  }

  async renameZone(params: {
    household: Household;
    space: string;
    oldName: string;
    newName: string;
  }) {
    const items = await this.em.find(Item, {
      household: params.household,
      space: params.space,
      zone: params.oldName,
    });
    if (items.length === 0) throw new NotFoundException('존재하지 않는 구역');

    for (const item of items) {
      item.zone = params.newName;
    }
    await this.em.flush();

    return { oldName: params.oldName, newName: params.newName, affectedItems: items.length };
  }

  async deleteZone(params: {
    household: Household;
    space: string;
    name: string;
  }) {
    const items = await this.em.find(Item, {
      household: params.household,
      space: params.space,
      zone: params.name,
    });
    if (items.length === 0) throw new NotFoundException('존재하지 않는 구역');

    for (const item of items) {
      item.zone = null;
      item.details = [];
    }
    await this.em.flush();

    return { deletedName: params.name, affectedItems: items.length };
  }

  async renameDetail(params: {
    household: Household;
    space: string;
    zone: string;
    oldName: string;
    newName: string;
  }) {
    const items = await this.em.find(Item, {
      household: params.household,
      space: params.space,
      zone: params.zone,
    });

    let affected = 0;
    for (const item of items) {
      const idx = item.details.indexOf(params.oldName);
      if (idx !== -1) {
        item.details[idx] = params.newName;
        affected++;
      }
    }
    if (affected === 0) throw new NotFoundException('존재하지 않는 세부위치');

    await this.em.flush();
    return { oldName: params.oldName, newName: params.newName, affectedItems: affected };
  }

  async deleteDetail(params: {
    household: Household;
    space: string;
    zone: string;
    name: string;
  }) {
    const items = await this.em.find(Item, {
      household: params.household,
      space: params.space,
      zone: params.zone,
    });

    let affected = 0;
    for (const item of items) {
      const idx = item.details.indexOf(params.name);
      if (idx !== -1) {
        item.details.splice(idx, 1);
        affected++;
      }
    }
    if (affected === 0) throw new NotFoundException('존재하지 않는 세부위치');

    await this.em.flush();
    return { deletedName: params.name, affectedItems: affected };
  }
}
