import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FriendsStore } from '../../../friends/application/friends.store';
import { Person } from '../../../people/domain/person';
import {
  formatAge,
  formatDayMonth,
  formatDaysAgo,
  formatDaysUntil,
} from '../../../shared/domain/russian-format';
import { BirthdaysFacade, UPCOMING_WINDOWS } from '../../application/birthdays.facade';
import { BirthdayRowComponent } from '../birthday-row.component';
import { FriendsCarouselComponent } from '../friends-carousel/friends-carousel.component';

/** Long enough to read a full name, short enough not to linger (specs/002 R5). */
const ADDED_NOTICE_MS = 4000;

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, BirthdayRowComponent, FriendsCarouselComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (justAdded(); as name) {
      <p class="added" role="status" animate.leave="added-leave">
        {{ name }} теперь в друзьях.
        <button type="button" class="btn btn-ghost" (click)="justAdded.set(null)">Скрыть</button>
      </p>
    }

    @if (friends.friends().length === 0) {
      <app-friends-carousel class="carousel" (picked)="addFromCarousel($event)">
        <div class="cta">
          <h1>Добавьте друзей</h1>
          <p class="lead">
            Здесь будут дни рождения только ваших друзей. Нажмите на человека в ленте или найдите
            нужного в общем списке.
          </p>
          <a routerLink="/people" class="btn">Найти в списке</a>
        </div>
      </app-friends-carousel>
    } @else {
      <section class="today inverted" aria-labelledby="today-title">
        <h1 id="today-title">Сегодня</h1>
        @for (b of facade.today(); track b.person.id) {
          <app-birthday-row
            [person]="b.person"
            [date]="b.date"
            when="сегодня"
            [age]="'исполняется ' + age(b.turningAge)"
            [jubilee]="b.isJubilee"
          />
        } @empty {
          <p class="lead">Сегодня дней рождения нет.</p>
          @if (facade.nearest(); as next) {
            <p>
              Ближайший: {{ next.person.fullName }}, {{ dayMonth(next.date) }} ({{
                until(next.daysUntil)
              }}).
            </p>
          }
        }
      </section>

      <div class="columns">
        <section aria-labelledby="upcoming-title">
          <div class="section-head">
            <h2 id="upcoming-title">Ближайшие</h2>
            <div class="chips" role="group" aria-label="Период">
              @for (w of windows; track w) {
                <button
                  type="button"
                  class="chip"
                  [attr.aria-pressed]="facade.window() === w"
                  (click)="facade.setWindow(w)"
                >
                  {{ w }} дней
                </button>
              }
            </div>
          </div>
          @for (b of facade.upcoming(); track b.person.id) {
            <app-birthday-row
              [person]="b.person"
              [date]="b.date"
              [when]="until(b.daysUntil)"
              [age]="'исполнится ' + age(b.turningAge)"
              [jubilee]="b.isJubilee"
            />
          } @empty {
            <p class="muted">За {{ facade.window() }} дней у друзей праздников нет.</p>
          }
        </section>

        <section class="recent" aria-labelledby="recent-title">
          <h3 id="recent-title">Недавно были</h3>
          @for (r of facade.recent(); track r.person.id) {
            <app-birthday-row
              [person]="r.person"
              [date]="r.date"
              [when]="ago(r.daysAgo)"
              [age]="'исполнилось ' + age(r.turnedAge)"
            />
          } @empty {
            <p class="muted">За последнюю неделю никого не пропустили.</p>
          }
        </section>
      </div>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--sp-6);
    }
    .added {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--sp-2);
      margin: 0;
      padding: var(--sp-2) var(--sp-3);
      border: 2px solid var(--success);
      color: var(--success);
      font-weight: 600;
      transition:
        opacity 250ms var(--ease-out),
        transform 250ms var(--ease-out);
    }
    /* Enters and leaves along the same path (specs/002 M2). */
    @starting-style {
      .added {
        opacity: 0;
        transform: translateY(-8px);
      }
    }
    .added.added-leave {
      opacity: 0;
      transform: translateY(-8px);
    }
    .carousel .cta {
      display: grid;
      justify-items: center;
      gap: var(--sp-3);
      padding: var(--sp-6) var(--sp-3);
      text-align: center;
    }
    .lead {
      max-width: 34em;
      margin: 0;
      font-size: 20px;
      line-height: 1.4;
    }
    .today {
      display: grid;
      gap: var(--sp-3);
      padding: var(--sp-5) var(--sp-4);
      margin: 0 calc(var(--sp-4) * -1);
    }
    .columns {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
      gap: var(--sp-5) var(--sp-6);
      align-items: start;
    }
    .section-head {
      display: flex;
      flex-wrap: wrap;
      align-items: end;
      justify-content: space-between;
      gap: var(--sp-3);
      padding-bottom: var(--sp-3);
      border-bottom: var(--border-heavy);
    }
    .chips {
      display: flex;
      gap: var(--sp-2);
    }
    .recent {
      padding-top: var(--sp-3);
    }
    .recent h3 {
      padding-bottom: var(--sp-2);
      border-bottom: var(--border-heavy);
    }
    @media (max-width: 800px) {
      .columns {
        grid-template-columns: 1fr;
      }
      .today {
        margin: 0 calc(var(--sp-3) * -1);
        padding: var(--sp-4) var(--sp-3);
      }
    }
  `,
})
export class HomePage {
  protected readonly facade = inject(BirthdaysFacade);
  protected readonly friends = inject(FriendsStore);
  protected readonly windows = UPCOMING_WINDOWS;
  protected readonly justAdded = signal<string | null>(null);

  protected readonly age = formatAge;
  protected readonly until = formatDaysUntil;
  protected readonly ago = formatDaysAgo;
  protected readonly dayMonth = formatDayMonth;
  private hideTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.hideTimer));
  }

  protected addFromCarousel(person: Person): void {
    this.friends.add(person);
    this.justAdded.set(person.fullName);
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.justAdded.set(null), ADDED_NOTICE_MS);
  }
}
