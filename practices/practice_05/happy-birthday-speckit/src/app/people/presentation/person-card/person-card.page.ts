import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ageOn, toUpcoming } from '../../../birthdays/domain/birthday';
import { buildGreeting } from '../../../birthdays/domain/greeting';
import { zodiacSign } from '../../../birthdays/domain/zodiac';
import { FriendsStore } from '../../../friends/application/friends.store';
import { ClockService } from '../../../shared/application/clock.service';
import { dayOfWeek } from '../../../shared/domain/calendar-date';
import {
  formatAge,
  formatDayMonth,
  formatDaysUntil,
  formatFullDate,
  weekdayName,
} from '../../../shared/domain/russian-format';
import { PeopleStore } from '../../application/people.store';

@Component({
  selector: 'app-person-card-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (card(); as c) {
      <article>
        <h1>{{ c.fullName }}</h1>
        <dl class="facts">
          <div><dt>Дата рождения</dt><dd>{{ c.birthDate }}</dd></div>
          <div><dt>Возраст</dt><dd>{{ c.age }}</dd></div>
          <div class="big">
            <dt>Следующий день рождения</dt>
            <dd>{{ c.next }}, {{ c.weekday }}: {{ c.until }}, исполнится {{ c.turning }}</dd>
          </div>
          <div><dt>Знак зодиака</dt><dd>{{ c.zodiac }}</dd></div>
        </dl>
        @if (c.jubilee) {
          <p><span class="tag tag-inverse">Юбилей</span></p>
        }

        <section class="greeting" aria-labelledby="greeting-title">
          <h2 id="greeting-title" class="label">Поздравление</h2>
          <p class="text">{{ c.greeting }}</p>
          <div class="actions">
            <button type="button" class="btn" (click)="copy(c.greeting)">Скопировать поздравление</button>
            @if (inFile()) {
              <button type="button" class="btn btn-secondary" (click)="toggleFriend()">
                {{ isFriend() ? 'Убрать из друзей' : 'В друзья' }}
              </button>
            } @else if (isFriend()) {
              <button type="button" class="btn btn-secondary" (click)="friends.remove(id())">
                Убрать из друзей
              </button>
            }
          </div>
          <p class="status" role="status" [class.error-text]="copyFailed()">{{ copyStatus() }}</p>
        </section>
      </article>
    } @else {
      <h1>Человек не найден</h1>
      <p>Возможно, его нет в текущем файле. <a routerLink="/people">Вернуться к списку</a></p>
    }
  `,
  styles: `
    article {
      display: grid;
      gap: var(--sp-5);
      max-width: 860px;
    }
    .facts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      margin: 0;
      border-top: var(--border-heavy);
    }
    .facts div {
      padding: var(--sp-3) var(--sp-3) var(--sp-3) 0;
      border-bottom: var(--border);
    }
    .facts .big {
      grid-column: 1 / -1;
    }
    dt {
      font: 14px/1.2 var(--font-head);
      text-transform: uppercase;
    }
    dd {
      margin: var(--sp-1) 0 0;
      font-size: 22px;
      line-height: 1.3;
    }
    .greeting {
      display: grid;
      gap: var(--sp-3);
      padding: var(--sp-4);
      border: var(--border-heavy);
    }
    .text {
      margin: 0;
      font-family: var(--font-mono);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
    }
    .status {
      min-height: 1.6em;
      margin: 0;
      font-weight: 600;
    }
  `,
})
export class PersonCardPage {
  /** Route param: PersonId, already decoded by the router. */
  readonly id = input.required<string>();

  private readonly people = inject(PeopleStore);
  protected readonly friends = inject(FriendsStore);
  private readonly clock = inject(ClockService);
  protected readonly copyStatus = signal('');
  protected readonly copyFailed = signal(false);

  private readonly person = computed(() => this.people.find(this.id()));
  protected readonly inFile = computed(() => !!this.person());
  protected readonly isFriend = computed(() => this.friends.ids().has(this.id()));

  /** Falls back to the friend's own copy when the person is missing from the current file. */
  protected readonly card = computed(() => {
    const who = this.person() ?? this.friends.friends().find((f) => f.id === this.id());
    if (!who) return null;
    const today = this.clock.today();
    const next = toUpcoming(who, today);
    return {
      fullName: who.fullName,
      birthDate: formatFullDate(who.birthDate),
      age: formatAge(ageOn(who.birthDate, today)),
      next: formatDayMonth(next.date),
      weekday: weekdayName(dayOfWeek(next.date)),
      until: formatDaysUntil(next.daysUntil),
      turning: formatAge(next.turningAge),
      jubilee: next.isJubilee,
      zodiac: zodiacSign(who.birthDate).name,
      greeting: buildGreeting(who.fullName, next.turningAge),
    };
  });

  protected toggleFriend(): void {
    const person = this.person();
    if (person) this.friends.toggle(person);
  }

  protected async copy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.copyFailed.set(false);
      this.copyStatus.set('Скопировано');
    } catch {
      this.copyFailed.set(true);
      this.copyStatus.set('Не удалось скопировать. Выделите текст и скопируйте вручную.');
    }
  }
}
