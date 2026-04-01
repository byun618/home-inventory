import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { User, Household, HouseholdMember } from '../common/entities';
import type { HouseholdMember as HouseholdMemberType } from '@home-inventory/shared-types';

@Injectable()
export class HouseholdService {
  constructor(private readonly em: EntityManager) {}

  async create(params: { user: User; name?: string }) {
    const existing = await this.em.findOne(HouseholdMember, { user: params.user });
    if (existing) {
      throw new ConflictException('이미 Household에 소속되어 있어요');
    }

    const household = this.em.create(Household, {
      name: params.name ?? '우리집',
      createdBy: params.user,
    });

    const member = this.em.create(HouseholdMember, {
      household,
      user: params.user,
      role: 'admin',
    });

    await this.em.persistAndFlush([household, member]);

    return {
      id: household.id,
      name: household.name,
      createdAt: household.createdAt.toISOString(),
    };
  }

  async getMyHousehold(user: User) {
    const membership = await this.em.findOne(
      HouseholdMember,
      { user },
      { populate: ['household'] },
    );
    if (!membership) {
      throw new NotFoundException('Household 없음');
    }

    const memberCount = await this.em.count(HouseholdMember, {
      household: membership.household,
    });

    return {
      id: membership.household.id,
      name: membership.household.name,
      createdAt: membership.household.createdAt.toISOString(),
      memberCount,
    };
  }

  async getMembers(user: User): Promise<HouseholdMemberType[]> {
    const membership = await this.em.findOne(
      HouseholdMember,
      { user },
      { populate: ['household'] },
    );
    if (!membership) {
      throw new NotFoundException('Household 없음');
    }

    const members = await this.em.find(
      HouseholdMember,
      { household: membership.household },
      { populate: ['user'] },
    );

    return members.map((member) => ({
      userId: member.user.id,
      name: member.user.name,
      profileEmoji: member.user.profileEmoji,
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
    }));
  }

  async removeMember(params: { admin: User; targetUserId: string }) {
    const adminMembership = await this.em.findOne(
      HouseholdMember,
      { user: params.admin },
      { populate: ['household'] },
    );
    if (!adminMembership || adminMembership.role !== 'admin') {
      throw new ForbiddenException('admin이 아님');
    }

    if (params.admin.id === params.targetUserId) {
      throw new BadRequestException('자기 자신은 제거 불가');
    }

    const targetMembership = await this.em.findOne(HouseholdMember, {
      household: adminMembership.household,
      user: params.targetUserId,
    });
    if (!targetMembership) {
      throw new NotFoundException('멤버를 찾을 수 없음');
    }

    await this.em.removeAndFlush(targetMembership);
  }

  async findHouseholdByUser(user: User): Promise<Household | null> {
    const membership = await this.em.findOne(
      HouseholdMember,
      { user },
      { populate: ['household'] },
    );
    return membership?.household ?? null;
  }
}
