import { Entity, OptionalProps, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Household } from './household.entity';
import { User } from './user.entity';

@Entity()
export class Invite {
  [OptionalProps]?: 'id' | 'token' | 'usedAt' | 'usedBy';

  @PrimaryKey()
  id: string = v4();

  @ManyToOne(() => Household)
  household!: Household;

  @ManyToOne(() => User)
  invitedBy!: User;

  @Property({ unique: true })
  token: string = v4();

  @Property()
  expiresAt!: Date;

  @Property({ nullable: true })
  usedAt: Date | null = null;

  @ManyToOne(() => User, { nullable: true })
  usedBy: User | null = null;
}
