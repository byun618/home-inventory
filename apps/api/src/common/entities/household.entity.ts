import {
  Entity,
  OptionalProps,
  PrimaryKey,
  Property,
  ManyToOne,
  Collection,
  OneToMany,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from './user.entity';
import { HouseholdMember } from './household-member.entity';
import { Item } from './item.entity';
import { Invite } from './invite.entity';

@Entity()
export class Household {
  [OptionalProps]?: 'id' | 'name' | 'createdAt' | 'members' | 'items' | 'invites';

  @PrimaryKey()
  id: string = v4();

  @Property({ default: '우리집' })
  name: string = '우리집';

  @ManyToOne(() => User)
  createdBy!: User;

  @OneToMany(() => HouseholdMember, (member) => member.household)
  members = new Collection<HouseholdMember>(this);

  @OneToMany(() => Item, (item) => item.household)
  items = new Collection<Item>(this);

  @OneToMany(() => Invite, (invite) => invite.household)
  invites = new Collection<Invite>(this);

  @Property()
  createdAt: Date = new Date();
}
