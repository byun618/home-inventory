import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface HouseholdEvent {
  event: string;
  data: unknown;
  senderId: string;
}

@Injectable()
export class EventService {
  private readonly events$ = new Subject<{
    householdId: string;
    payload: HouseholdEvent;
  }>();

  get stream() {
    return this.events$.asObservable();
  }

  emitToHousehold(householdId: string, payload: HouseholdEvent) {
    this.events$.next({ householdId, payload });
  }
}
