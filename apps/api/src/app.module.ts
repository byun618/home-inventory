import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { mikroOrmConfig } from './mikro-orm.config';
import { AuthModule } from './auth/auth.module';
import { HouseholdModule } from './household/household.module';
import { ItemModule } from './item/item.module';
import { LocationModule } from './location/location.module';
import { InviteModule } from './invite/invite.module';
import { EventModule } from './event/event.module';

@Module({
  imports: [
    MikroOrmModule.forRoot(mikroOrmConfig),
    AuthModule,
    HouseholdModule,
    ItemModule,
    LocationModule,
    InviteModule,
    EventModule,
  ],
})
export class AppModule {}
