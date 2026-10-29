import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FriendsStore } from '../../friends/application/friends.store';
import { PeopleStore } from '../../people/application/people.store';
import { ClockService } from '../../shared/application/clock.service';
import { formatDayMonth, formatFullDate, monthName } from '../../shared/domain/russian-format';
import { computeStatistics } from '../domain/compute-statistics';

/** Bars are plain bordered blocks scaled to the largest value: RawBlock has no chart chrome. */
@Component({
  selector: 'app-stats-page',
  imports: [RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let s = stats();
    <h1>Статистика</h1>

    <dl class="totals">
      <div class="inverted"><dt>Людей в файле</dt><dd>{{ s.totalPeople }}</dd></div>
      <div><dt>Друзей</dt><dd>{{ s.friendsCount }}</dd></div>
      <div><dt>Именинников сегодня</dt><dd>{{ s.todayCount }}</dd></div>
      <div><dt>Средний возраст</dt><dd>{{ s.averageAge === null ? 'нет' : (s.averageAge | number: '1.1-1') }}</dd></div>
    </dl>

    <div class="grid">
      <section aria-labelledby="months-title">
        <h2 id="months-title">По месяцам</h2>
        <ul class="bars">
          @for (count of s.byMonth; track $index) {
            <li>
              <a [routerLink]="['/calendar', $index + 1]" class="bar-label">{{ month($index + 1) }}</a>
              <span class="bar" [style.width.%]="percent(count, maxMonth())"></span>
              <span class="mono">{{ count }}</span>
            </li>
          }
        </ul>
      </section>

      <section aria-labelledby="ages-title">
        <h2 id="ages-title">По возрасту</h2>
        <ul class="bars">
          @for (g of s.byAgeGroup; track g.label) {
            <li>
              <span class="bar-label">{{ g.label }}</span>
              <span class="bar" [style.width.%]="percent(g.count, maxAge())"></span>
              <span class="mono">{{ g.count }}</span>
            </li>
          }
        </ul>
      </section>

      <section aria-labelledby="first-title">
        <h3 id="first-title">Частые имена</h3>
        <ol class="top">
          @for (n of s.topFirstNames; track n.name) {
            <li><span>{{ n.name }}</span><span class="mono">{{ n.count }}</span></li>
          } @empty {
            <li class="muted">Нет данных</li>
          }
        </ol>
      </section>

      <section aria-labelledby="last-title">
        <h3 id="last-title">Частые фамилии</h3>
        <ol class="top">
          @for (n of s.topLastNames; track n.name) {
            <li><span>{{ n.name }}</span><span class="mono">{{ n.count }}</span></li>
          } @empty {
            <li class="muted">Нет данных</li>
          }
        </ol>
      </section>
    </div>

    <section class="facts" aria-labelledby="facts-title">
      <h2 id="facts-title">Интересные факты</h2>
      <ul>
        @if (s.oldest; as p) {
          <li>
            Самый старший: <a [routerLink]="['/people', p.id]">{{ p.fullName }}</a>,
            {{ fullDate(p.birthDate) }}
          </li>
        }
        @if (s.youngest; as p) {
          <li>
            Самый младший: <a [routerLink]="['/people', p.id]">{{ p.fullName }}</a>,
            {{ fullDate(p.birthDate) }}
          </li>
        }
        <li>Родились 29 февраля: {{ s.leapDayCount }}</li>
        @if (s.mostCommonBirthday; as d) {
          <li>Самый популярный день рождения: {{ dayMonth(d) }} ({{ d.count }})</li>
        }
      </ul>
    </section>

    <section aria-labelledby="zodiac-title">
      <h2 id="zodiac-title">Знаки зодиака</h2>
      <ul class="zodiac">
        @for (z of s.byZodiac; track z.sign.name) {
          <li><span>{{ z.sign.name }}</span><span class="mono">{{ z.count }}</span></li>
        }
      </ul>
    </section>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--sp-6);
    }
    .totals {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      margin: 0;
      border: var(--border-heavy);
    }
    .totals div {
      padding: var(--sp-4);
      border-right: var(--border);
    }
    .totals div:last-child {
      border-right: 0;
    }
    dt {
      font-weight: 600;
    }
    dd {
      margin: 0;
      font: clamp(32px, 6vw, 48px) / 1 var(--font-head);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--sp-6) var(--sp-5);
    }
    h2,
    h3 {
      padding-bottom: var(--sp-2);
      border-bottom: var(--border-heavy);
      margin-bottom: var(--sp-3);
    }
    .bars,
    .top,
    .zodiac,
    .facts ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .bars li {
      display: grid;
      grid-template-columns: 7em 1fr 5em;
      align-items: center;
      gap: var(--sp-2);
      min-height: 32px;
    }
    .bar-label {
      color: var(--black);
    }
    .bar {
      height: 16px;
      background: var(--black);
      min-width: 2px;
    }
    .bars .mono {
      text-align: right;
    }
    .top li,
    .zodiac li {
      display: flex;
      justify-content: space-between;
      gap: var(--sp-3);
      padding: 6px 0;
      border-bottom: var(--border-thin);
    }
    .top {
      counter-reset: rank;
    }
    .top li::before {
      counter-increment: rank;
      content: counter(rank);
      font-family: var(--font-mono);
      width: 2em;
    }
    .top li span:first-of-type {
      flex: 1;
    }
    .zodiac {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      column-gap: var(--sp-5);
    }
    .facts li {
      padding: var(--sp-2) 0;
      border-bottom: var(--border);
      font-size: 18px;
    }
    @media (max-width: 600px) {
      .totals div {
        border-right: 0;
        border-bottom: var(--border);
      }
    }
  `,
})
export class StatsPage {
  private readonly people = inject(PeopleStore);
  private readonly friends = inject(FriendsStore);
  private readonly clock = inject(ClockService);

  protected readonly stats = computed(() =>
    computeStatistics(this.people.people(), this.friends.friends().length, this.clock.today()),
  );
  protected readonly maxMonth = computed(() => Math.max(...this.stats().byMonth));
  protected readonly maxAge = computed(() => Math.max(...this.stats().byAgeGroup.map((g) => g.count)));

  protected readonly month = monthName;
  protected readonly fullDate = formatFullDate;
  protected readonly dayMonth = formatDayMonth;

  protected percent(value: number, max: number): number {
    return max ? (value / max) * 100 : 0;
  }
}
