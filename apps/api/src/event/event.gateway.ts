import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/mysql';
import { HouseholdMember } from '../common/entities';
import { EventService } from './event.service';

@WebSocketGateway({ cors: true })
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly em: EntityManager,
    private readonly eventService: EventService,
  ) {}

  afterInit() {
    this.eventService.stream.subscribe(({ householdId, payload }) => {
      const data =
        typeof payload.data === 'object' && payload.data !== null
          ? payload.data
          : {};
      this.server.to(`household:${householdId}`).emit(payload.event, {
        ...(data as Record<string, unknown>),
        _senderId: payload.senderId,
      });
    });
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const membership = await this.em.findOne(
        HouseholdMember,
        { user: payload.sub },
        { populate: ['household'] },
      );

      if (!membership) {
        client.disconnect();
        return;
      }

      client.data.userId = payload.sub;
      client.data.householdId = membership.household.id;
      client.join(`household:${membership.household.id}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket) {
    // cleanup if needed
  }
}
