import { ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ageOn, sortByNextBirthday } from '../../../birthdays/domain/birthday';
import { FriendsStore } from '../../../friends/application/friends.store';
import { ClockService } from '../../../shared/application/clock.service';
import { formatAge, formatFullDate } from '../../../shared/domain/russian-format';
import { PeopleStore } from '../../application/people.store';
import { Person } from '../../domain/person';
import { searchPeople, sortByName } from '../../domain/search-people';

type SortMode = 'name' | 'birthday';

const ROW_HEIGHT = 72;

@Component({
  selector: 'app-people-page',
  imports: [ScrollingModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Все люди</h1>
    <div class="controls">
      <div class="search">
        <label class="label" for="search">Поиск</label>
        <input
          id="search"
          class="input"
          type="search"
          autocomplete="off"
          placeholder="фамилия, имя или отчество"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />
      </div>
      <div class="chips" role="group" aria-label="Сортировка">
        <button type="button" class="chip" [attr.aria-pressed]="sort() === 'name'" (click)="sort.set('name')">
          По алфавиту
        </button>
        <button
          type="button"
          class="chip"
          [attr.aria-pressed]="sort() === 'birthday'"
          (click)="sort.set('birthday')"
        >
          По ближайшему дню рождения
        </button>
      </div>
    </div>
    <p class="mono found" role="status">Найдено: {{ results().length }}</p>

    @if (results().length) {
      <cdk-virtual-scroll-viewport class="viewport" [itemSize]="rowHeight">
        <div *cdkVirtualFor="let person of results(); trackBy: trackById" class="row">
          <div class="who">
            <a class="name" [routerLink]="['/people', person.id]">{{ person.fullName }}</a>
            <span class="mono">{{ fullDate(person) }} · {{ age(person) }}</span>
          </div>
          <button
            type="button"
            class="btn btn-small"
            [class.btn-secondary]="!friends.ids().has(person.id)"
            [attr.aria-pressed]="friends.ids().has(person.id)"
            [attr.aria-label]="(friends.ids().has(person.id) ? 'Убрать из друзей: ' : 'В друзья: ') + person.fullName"
            (click)="friends.toggle(person)"
          >
            {{ friends.ids().has(person.id) ? 'Друг ✓' : 'В друзья' }}
          </button>
        </div>
      </cdk-virtual-scroll-viewport>
    } @else {
      <p class="lead">Никого не найдено.</p>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--sp-4);
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      align-items: end;
      gap: var(--sp-3) var(--sp-5);
    }
    .search {
      flex: 1 1 320px;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-2);
    }
    .found {
      margin: 0;
    }
    .viewport {
      height: min(70vh, 720px);
      border-top: var(--border-heavy);
      border-bottom: var(--border-heavy);
    }
    .row {
      height: 72px; /* = ROW_HEIGHT */
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sp-3);
      border-bottom: var(--border);
      padding-right: var(--sp-2);
    }
    .who {
      display: grid;
      min-width: 0;
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
    .who .mono {
      font-size: 13px;
    }
    .btn-small {
      flex: none;
    }
    .lead {
      font-size: 20px;
    }
  `,
})
export class PeoplePage {
  private readonly people = inject(PeopleStore);
  private readonly clock = inject(ClockService);
  protected readonly friends = inject(FriendsStore);
  protected readonly rowHeight = ROW_HEIGHT;

  protected readonly query = signal('');
  protected readonly sort = signal<SortMode>('name');

  // Sorting 100k is the expensive step, so it runs only when the list, day or mode changes.
  private readonly sorted = computed(() =>
    this.sort() === 'name'
      ? sortByName(this.people.people())
      : sortByNextBirthday(this.people.people(), this.clock.today()),
  );
  protected readonly results = computed(() => searchPeople(this.sorted(), this.query()));

  protected fullDate(person: Person): string {
    return formatFullDate(person.birthDate);
  }

  protected age(person: Person): string {
    return formatAge(ageOn(person.birthDate, this.clock.today()));
  }

  protected trackById(_: number, person: Person): string {
    return person.id;
  }
}
