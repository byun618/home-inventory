import { Entity, OptionalProps, PrimaryKey, Property, ManyToOne, Unique } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Household } from './household.entity';
import { User } from './user.entity';

@Entity()
@Unique({ properties: ['household', 'user'] })
export class HouseholdMember {
  [OptionalProps]?: 'id' | 'joinedAt';

  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => Household)
  household!: Household;

  @ManyToOne(() => User)
  user!: User;

  @Property()
  role!: 'admin' | 'member';

  @Property()
  joinedAt: Date = new Date();
}
