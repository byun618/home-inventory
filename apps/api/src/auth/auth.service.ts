import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/mysql';
import * as bcrypt from 'bcrypt';
import { User, Household, HouseholdMember } from '../common/entities';
import type { AuthResponse, UserProfile } from '@home-inventory/shared-types';

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
  ) {}

  async signup(params: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const existing = await this.em.findOne(User, { email: params.email });
    if (existing) {
      throw new ConflictException('이미 사용 중인 이메일이에요');
    }

    const user = this.em.create(User, {
      name: params.name,
      email: params.email,
      password: await bcrypt.hash(params.password, 10),
    });
    await this.em.persistAndFlush(user);

    const tokens = this.generateTokens(user);
    const profile = await this.buildProfile(user);

    return { ...tokens, user: profile };
  }

  async login(params: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const user = await this.em.findOne(User, { email: params.email });
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸어요');
    }

    const isValid = await bcrypt.compare(params.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸어요');
    }

    const tokens = this.generateTokens(user);
    const profile = await this.buildProfile(user);

    return { ...tokens, user: profile };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
      });
      const user = await this.em.findOneOrFail(User, { id: payload.sub });
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('만료되었거나 유효하지 않은 토큰');
    }
  }

  async getProfile(user: User): Promise<UserProfile> {
    return this.buildProfile(user);
  }

  private generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: '1h',
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
        expiresIn: '7d',
      }),
    };
  }

  private async buildProfile(user: User): Promise<UserProfile> {
    const membership = await this.em.findOne(
      HouseholdMember,
      { user },
      { populate: ['household'] },
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      profileEmoji: user.profileEmoji,
      household: membership
        ? {
            id: membership.household.id,
            name: membership.household.name,
            role: membership.role,
          }
        : null,
    };
  }
}
