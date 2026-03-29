import { Injectable } from '@nestjs/common';
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
}
