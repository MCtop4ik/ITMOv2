import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { PeopleStore } from '../../../people/application/people.store';
import { Person } from '../../../people/domain/person';
import { sampleRandom } from '../../../shared/domain/random';
import { formatDayMonth } from '../../../shared/domain/russian-format';

const SAMPLE_SIZE = 20;

/**
 * Two counter-moving strips of random people above and below the projected «add friends» call.
 * Motion has one job: hint that the list is big and tappable. It pauses on hover/focus
 * and is replaced by a static wrap under prefers-reduced-motion.
 */
@Component({
  selector: 'app-friends-carousel',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #strip let-row let-reverse="reverse">
      <div class="strip" [class.reverse]="reverse">
        <ul class="track">
          @for (copy of [0, 1]; track copy) {
            @for (person of row; track person.id) {
              <li [attr.aria-hidden]="copy === 1 ? 'true' : null">
                <button
                  type="button"
                  class="person"
                  [attr.tabindex]="copy === 1 ? -1 : null"
                  (click)="picked.emit(person)"
                >
                  <span class="name">{{ person.fullName }}</span>
                  <span class="mono date">{{ dayMonth(person) }} · добавить</span>
                </button>
              </li>
            }
          }
        </ul>
      </div>
    </ng-template>

    <ng-container *ngTemplateOutlet="strip; context: { $implicit: rows()[0] }" />
    <ng-content />
    <ng-container *ngTemplateOutlet="strip; context: { $implicit: rows()[1], reverse: true }" />
    <button type="button" class="btn-ghost btn" (click)="reshuffle()">Показать других людей</button>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--sp-3);
    }
    .strip {
      overflow: hidden;
      border-top: var(--border);
      border-bottom: var(--border);
    }
    .track {
      display: flex;
      width: max-content;
      margin: 0;
      padding: 0;
      list-style: none;
      animation: slide 80s linear infinite;
    }
    .reverse .track {
      animation-direction: reverse;
    }
    .strip:hover .track,
    .strip:focus-within .track {
      animation-play-state: paused;
    }
    .person {
      display: grid;
      text-align: left;
      min-height: 64px;
      padding: var(--sp-2) var(--sp-4);
      border: 0;
      border-right: var(--border-thin);
      background: var(--white);
      color: var(--black);
      font: inherit;
      cursor: pointer;
      transition: transform 160ms var(--ease-out);
    }
    .person:active {
      transform: scale(0.97);
    }
    .person:hover,
    .person:focus-visible {
      background: var(--black);
      color: var(--white);
    }
    .person:focus-visible {
      outline-offset: -6px;
      outline-color: var(--white);
    }
    .name {
      font-weight: 600;
      white-space: nowrap;
    }
    .date {
      font-size: 13px;
    }
    @keyframes slide {
      to {
        transform: translateX(-50%);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .track {
        flex-wrap: wrap;
        width: auto;
      }
      .track li[aria-hidden] {
        display: none;
      }
    }
  `,
})
export class FriendsCarouselComponent {
  private readonly people = inject(PeopleStore);
  private readonly seed = signal(0);
  readonly picked = output<Person>();

  protected readonly rows = computed(() => {
    this.seed();
    const sample = sampleRandom(this.people.people(), SAMPLE_SIZE, Math.random);
    const half = Math.ceil(sample.length / 2);
    return [sample.slice(0, half), sample.slice(half)];
  });

  protected dayMonth(person: Person): string {
    return formatDayMonth(person.birthDate);
  }

  protected reshuffle(): void {
    this.seed.update((n) => n + 1);
  }
}
