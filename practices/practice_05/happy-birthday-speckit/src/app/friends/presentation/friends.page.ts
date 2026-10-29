import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toUpcoming } from '../../birthdays/domain/birthday';
import { sortByName } from '../../people/domain/search-people';
import { ClockService } from '../../shared/application/clock.service';
import { formatDaysUntil, formatFullDate } from '../../shared/domain/russian-format';
import { FriendsStore } from '../application/friends.store';

@Component({
  selector: 'app-friends-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>
      Мои друзья <span class="count mono">{{ rows().length }}</span>
    </h1>
    @if (rows().length) {
      <ul class="list">
        @for (row of rows(); track row.friend.id) {
          <li animate.leave="row-leave">
            <div class="row">
              <a class="name" [routerLink]="['/people', row.friend.id]">{{
                row.friend.fullName
              }}</a>
              <span class="mono">{{ fullDate(row.friend.birthDate) }}</span>
              <span class="mono when">{{ until(row.daysUntil) }}</span>
              <button
                type="button"
                class="btn btn-secondary btn-small"
                (click)="store.remove(row.friend.id)"
              >
                Убрать
              </button>
            </div>
          </li>
        }
      </ul>
    } @else {
      <div class="empty">
        <p class="lead">Друзей пока нет. Добавьте их из общего списка или из ленты на главной.</p>
        <a routerLink="/people" class="btn">Найти в списке</a>
      </div>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--sp-5);
    }
    .count {
      font-size: 0.4em;
      vertical-align: middle;
    }
    .list {
      margin: 0;
      padding: 0;
      list-style: none;
      border-top: var(--border-heavy);
    }
    /* Removal collapses the row so the rows below slide up on their own (specs/002 M3). */
    li {
      display: grid;
      grid-template-rows: 1fr;
      transition:
        grid-template-rows 200ms var(--ease-out),
        opacity 200ms var(--ease-out);
    }
    li.row-leave {
      grid-template-rows: 0fr;
      opacity: 0;
    }
    .row {
      min-height: 0;
      overflow: hidden;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto auto auto;
      align-items: center;
      gap: var(--sp-2) var(--sp-4);
      padding: 12px 0;
      border-bottom: var(--border);
      transition:
        padding 200ms var(--ease-out),
        border-bottom-width 200ms var(--ease-out);
    }
    /* Padding and border do not shrink with the 0fr track, so they collapse too. */
    li.row-leave .row {
      padding-block: 0;
      border-bottom-width: 0;
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
    .when {
      min-width: 9em;
    }
    .empty {
      display: grid;
      gap: var(--sp-3);
      justify-items: start;
    }
    .lead {
      font-size: 20px;
      margin: 0;
    }
    @media (max-width: 700px) {
      .row {
        grid-template-columns: 1fr auto;
      }
      .name {
        grid-column: 1 / -1;
      }
    }
  `,
})
export class FriendsPage {
  protected readonly store = inject(FriendsStore);
  private readonly clock = inject(ClockService);
  protected readonly fullDate = formatFullDate;
  protected readonly until = formatDaysUntil;

  protected readonly rows = computed(() =>
    sortByName(this.store.friends()).map((friend) => ({
      friend,
      daysUntil: toUpcoming(friend, this.clock.today()).daysUntil,
    })),
  );
}
