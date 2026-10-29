import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PeopleStore } from '../../../people/application/people.store';
import { ClockService } from '../../../shared/application/clock.service';
import { formatAge, monthName } from '../../../shared/domain/russian-format';
import { groupByMonth } from '../../domain/month-calendar';

/** A month of a 100k file holds ~8k people, so the list is virtualised. */
const ROW_HEIGHT = 56;

@Component({
  selector: 'app-calendar-page',
  imports: [RouterLink, ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (selected(); as m) {
      <a routerLink="/calendar" class="back">← Все месяцы</a>
      <h1>{{ m.name }} <span class="mono count">{{ m.people.length }}</span></h1>
      @if (m.people.length) {
        <cdk-virtual-scroll-viewport class="list" [itemSize]="rowHeight">
          <div *cdkVirtualFor="let p of m.people; trackBy: trackById" class="row">
            <span class="day">{{ p.birthDate.day }}</span>
            <a [routerLink]="['/people', p.id]" class="name">{{ p.fullName }}</a>
            <span class="mono">{{ turning(p.birthDate) }}</span>
          </div>
        </cdk-virtual-scroll-viewport>
      } @else {
        <p class="lead">В этом месяце дней рождения нет.</p>
      }
    } @else {
      <h1>Календарь</h1>
      <ul class="months">
        @for (m of months(); track m.index) {
          <li>
            <a [routerLink]="['/calendar', m.index + 1]" class="month" [class.inverted]="m.current">
              <span class="month-name">{{ m.name }}</span>
              <span class="mono">{{ m.count }}</span>
              @if (m.current) {
                <span class="visually-hidden">(текущий месяц)</span>
              }
            </a>
          </li>
        }
      </ul>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--sp-4);
    }
    .back {
      justify-self: start;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
    }
    .count {
      font-size: 0.4em;
      vertical-align: middle;
    }
    .months {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0;
      margin: 0;
      padding: 0;
      list-style: none;
      border-top: var(--border);
      border-left: var(--border);
    }
    .month {
      display: grid;
      gap: var(--sp-2);
      min-height: 120px;
      padding: var(--sp-3);
      border-right: var(--border);
      border-bottom: var(--border);
      color: var(--black);
      text-decoration: none;
    }
    .month:hover {
      background: var(--black);
      color: var(--white);
    }
    .month.inverted {
      color: var(--white);
    }
    .month-name {
      font: 24px/1.1 var(--font-head);
    }
    .list {
      height: min(70vh, 720px);
      border-top: var(--border-heavy);
      border-bottom: var(--border-heavy);
    }
    .row {
      height: 56px; /* = ROW_HEIGHT */
      display: grid;
      grid-template-columns: 3em minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--sp-3);
      border-bottom: var(--border);
      padding-right: var(--sp-2);
    }
    .day {
      font: 24px/1 var(--font-head);
    }
    .name {
      color: var(--black);
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .name:hover {
      text-decoration: underline;
    }
    .lead {
      font-size: 20px;
    }
  `,
})
export class CalendarPage {
  /** Route param 1–12; absent on the overview. */
  readonly month = input<string>();

  private readonly people = inject(PeopleStore);
  private readonly clock = inject(ClockService);
  protected readonly rowHeight = ROW_HEIGHT;

  private readonly grouped = computed(() => groupByMonth(this.people.people()));

  protected readonly months = computed(() =>
    this.grouped().map((list, index) => ({
      index,
      name: monthName(index + 1),
      count: list.length,
      current: index + 1 === this.clock.today().month,
    })),
  );

  protected readonly selected = computed(() => {
    const m = Number(this.month());
    if (!Number.isInteger(m) || m < 1 || m > 12) return null;
    return { name: monthName(m), people: this.grouped()[m - 1] };
  });

  protected trackById(_: number, person: { id: string }): string {
    return person.id;
  }

  protected turning(birth: { year: number; month: number; day: number }): string {
    return `в этом году ${formatAge(this.clock.today().year - birth.year)}`;
  }
}
