import { Injectable, computed, inject, signal } from '@angular/core';
import { FriendsStore } from '../../friends/application/friends.store';
import { ClockService } from '../../shared/application/clock.service';
import { recentBirthdays, toUpcoming, upcomingBirthdays } from '../domain/birthday';

export const UPCOMING_WINDOWS = [7, 30, 90] as const;
export type UpcomingWindow = (typeof UPCOMING_WINDOWS)[number];

const WINDOW_KEY = 'happy-birthday.upcoming-window.v1';
const RECENT_DAYS = 7;

function loadWindow(): UpcomingWindow {
  const saved = Number(localStorage.getItem(WINDOW_KEY));
  return UPCOMING_WINDOWS.find((w) => w === saved) ?? 30;
}

/** Home-screen view of friends' birthdays relative to today. */
@Injectable({ providedIn: 'root' })
export class BirthdaysFacade {
  private readonly friends = inject(FriendsStore).friends;
  private readonly clock = inject(ClockService);

  readonly window = signal<UpcomingWindow>(loadWindow());

  private readonly all = computed(() => upcomingBirthdays(this.friends(), this.clock.today(), this.window()));
  readonly today = computed(() => this.all().filter((u) => u.daysUntil === 0));
  readonly upcoming = computed(() => this.all().filter((u) => u.daysUntil > 0));
  readonly recent = computed(() => recentBirthdays(this.friends(), this.clock.today(), RECENT_DAYS));
  /** Shown when nobody celebrates today. */
  readonly nearest = computed(() => {
    const today = this.clock.today();
    return this.friends()
      .map((f) => toUpcoming(f, today))
      .sort((a, b) => a.daysUntil - b.daysUntil)[0] ?? null;
  });

  setWindow(window: UpcomingWindow): void {
    this.window.set(window);
    localStorage.setItem(WINDOW_KEY, String(window));
  }
}
