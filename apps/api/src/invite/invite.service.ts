import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { User, Household, HouseholdMember, Invite } from '../common/entities';
import type { InviteInfo } from '@home-inventory/shared-types';

@Injectable()
export class InviteService {
  constructor(private readonly em: EntityManager) {}

  async create(params: { user: User; household: Household }) {
    const membership = await this.em.findOne(HouseholdMember, {
      user: params.user,
      household: params.household,
    });
    if (!membership || membership.role !== 'admin') {
      throw new ForbiddenException('admin만 초대 가능');
    }

    // 기존 미사용 초대 재활용
    const existing = await this.em.findOne(Invite, {
      household: params.household,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (existing) {
      return {
        token: existing.token,
        expiresAt: existing.expiresAt.toISOString(),
        inviteUrl: `/invite/${existing.token}`,
      };
    }

    const invite = this.em.create(Invite, {
      household: params.household,
      invitedBy: params.user,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일
    });
    await this.em.persistAndFlush(invite);

    return {
      token: invite.token,
      expiresAt: invite.expiresAt.toISOString(),
      inviteUrl: `/invite/${invite.token}`,
    };
  }

  async getInfo(token: string): Promise<InviteInfo> {
    const invite = await this.em.findOne(
      Invite,
      { token, usedAt: null, expiresAt: { $gt: new Date() } },
      { populate: ['household', 'invitedBy'] },
    );
    if (!invite) {
      throw new NotFoundException('유효하지 않거나 만료된 초대');
    }

    return {
      householdName: invite.household.name,
      invitedByName: invite.invitedBy.name,
      expiresAt: invite.expiresAt.toISOString(),
    };
  }

  async accept(params: { token: string; user: User }) {
    const invite = await this.em.findOne(
      Invite,
      { token: params.token, usedAt: null, expiresAt: { $gt: new Date() } },
      { populate: ['household'] },
    );
    if (!invite) {
      throw new NotFoundException('유효하지 않거나 만료된 초대');
    }

    const existingMembership = await this.em.findOne(HouseholdMember, {
      user: params.user,
    });
    if (existingMembership) {
      throw new ConflictException('이미 Household에 소속됨');
    }

    const member = this.em.create(HouseholdMember, {
      household: invite.household,
      user: params.user,
      role: 'member',
    });

    invite.usedAt = new Date();
    invite.usedBy = params.user;

    await this.em.persistAndFlush([member, invite]);

    return {
      householdId: invite.household.id,
      householdName: invite.household.name,
    };
  }
}
