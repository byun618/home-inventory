import { Entity, OptionalProps, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Household } from './household.entity';
import { User } from './user.entity';

@Entity()
export class Item {
  [OptionalProps]?: 'id' | 'emoji' | 'quantity' | 'zone' | 'details' | 'updatedAt' | 'createdAt';

  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => Household)
  household!: Household;

  @Property({ default: '📦' })
  emoji: string = '📦';

  @Property()
  name!: string;

  @Property()
  space!: string;

  @Property({ nullable: true })
  zone: string | null = null;

  @Property({ type: 'json', default: '[]' })
  details: string[] = [];

  @Property({ default: 1, unsigned: true })
  quantity: number = 1;

  @ManyToOne(() => User)
  createdBy!: User;

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property()
  createdAt: Date = new Date();
}
