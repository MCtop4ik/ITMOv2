import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarDate } from '../../shared/domain/calendar-date';
import { formatDayMonth } from '../../shared/domain/russian-format';
import { Celebrant } from '../domain/birthday';

/**
 * One birthday line. The square date block is the app's identity motif: the day number
 * set large in the headline face, like a tear-off calendar sheet.
 */
@Component({
  selector: 'app-birthday-row',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="date" aria-hidden="true">
      <span class="day">{{ date().day }}</span>
      <span class="month">{{ monthShort() }}</span>
    </div>
    <div class="body">
      <a class="name" [routerLink]="['/people', person().id]">{{ person().fullName }}</a>
      <span class="meta">
        <span class="visually-hidden">{{ dayMonth() }},</span>
        {{ when() }} · {{ age() }}
      </span>
    </div>
    @if (jubilee()) {
      <span class="tag tag-inverse">Юбилей</span>
    }
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: var(--sp-3);
      padding: 12px 0;
      border-bottom: var(--border);
    }
    .date {
      display: grid;
      place-items: center;
      width: 64px;
      height: 64px;
      border: var(--border);
      line-height: 1;
    }
    .day {
      font: 28px/1 var(--font-head);
    }
    .month {
      font: 600 11px/1 var(--font-body);
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .body {
      display: grid;
      min-width: 0;
    }
    .name {
      color: var(--black);
      font-size: 18px;
      font-weight: 600;
      text-decoration: none;
      overflow-wrap: anywhere;
    }
    .name:hover {
      text-decoration: underline;
    }
    .meta {
      font-family: var(--font-mono);
      font-size: 14px;
    }
    :host-context(.inverted) .name {
      color: var(--white);
    }
    :host-context(.inverted) {
      border-bottom-color: var(--white);
    }
    :host-context(.inverted) .date {
      border-color: var(--white);
    }
    @media (max-width: 480px) {
      :host {
        grid-template-columns: auto 1fr;
      }
      .tag {
        grid-column: 2;
        justify-self: start;
      }
    }
  `,
})
export class BirthdayRowComponent {
  readonly person = input.required<Celebrant>();
  readonly date = input.required<CalendarDate>();
  readonly when = input.required<string>();
  readonly age = input.required<string>();
  readonly jubilee = input(false);

  protected readonly dayMonth = computed(() => formatDayMonth(this.date()));
  protected readonly monthShort = computed(() => this.dayMonth().split(' ')[1].slice(0, 3));
}
