import {
  Entity,
  OptionalProps,
  PrimaryKey,
  Property,
  Collection,
  OneToMany,
} from '@mikro-orm/core';
import { v4 } from 'uuid';
import { HouseholdMember } from './household-member.entity';

@Entity()
export class User {
  [OptionalProps]?: 'id' | 'profileEmoji' | 'createdAt' | 'householdMembers';

  @PrimaryKey()
  id: string = v4();

  @Property()
  name!: string;

  @Property({ unique: true })
  email!: string;

  @Property({ hidden: true })
  password!: string;

  @Property({ default: '🙋' })
  profileEmoji: string = '🙋';

  @OneToMany(() => HouseholdMember, (member) => member.user)
  householdMembers = new Collection<HouseholdMember>(this);

  @Property()
  createdAt: Date = new Date();
}
