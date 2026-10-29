import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { CalendarDate, fromJsDate } from '../domain/calendar-date';

/** Source of «today» for the UI; ticks over at local midnight while the app stays open. */
@Injectable({ providedIn: 'root' })
export class ClockService {
  private readonly todaySignal = signal<CalendarDate>(fromJsDate(new Date()));
  readonly today = this.todaySignal.asReadonly();
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.scheduleMidnight();
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  private scheduleMidnight(): void {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    // +1s guards against firing a hair early and landing on the old day.
    this.timer = setTimeout(() => {
      this.todaySignal.set(fromJsDate(new Date()));
      this.scheduleMidnight();
    }, midnight.getTime() - now.getTime() + 1000);
  }
}
