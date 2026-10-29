import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { FRIEND_STORE } from '../../../friends/application/friend-store.port';
import { FriendsStore } from '../../../friends/application/friends.store';
import { PEOPLE_FILE_STORE } from '../../../people/application/people-file-store.port';
import { createPerson } from '../../../people/domain/person';
import { FriendsCarouselComponent } from '../friends-carousel/friends-carousel.component';
import { HomePage } from './home.page';

const anna = createPerson('Иванова Анна', { year: 1990, month: 3, day: 14 });
const boris = createPerson('Петров Борис', { year: 1985, month: 7, day: 2 });

describe('HomePage «… теперь в друзьях»', () => {
  let fixture: ComponentFixture<HomePage>;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        { provide: FRIEND_STORE, useValue: { load: () => [], save: () => {} } },
        {
          provide: PEOPLE_FILE_STORE,
          useValue: { load: async () => null, save: async () => {}, clear: async () => {} },
        },
      ],
    });
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
  });

  afterEach(() => vi.useRealTimers());

  /** Clicks a person in the carousel; the carousel is shown only while there are no friends. */
  function pick(person = anna): void {
    for (const f of TestBed.inject(FriendsStore).friends())
      TestBed.inject(FriendsStore).remove(f.id);
    fixture.detectChanges();
    fixture.debugElement
      .query(By.directive(FriendsCarouselComponent))
      .componentInstance.picked.emit(person);
    fixture.detectChanges();
  }

  function notice(): string | null {
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('.added')?.textContent ?? null;
  }

  it('shows the added name, then hides it after 4 s', () => {
    pick();
    expect(notice()).toContain('Иванова Анна теперь в друзьях');
    vi.advanceTimersByTime(3999);
    expect(notice()).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(notice()).toBeNull();
  });

  it('restarts the 4 s countdown when another person is added', () => {
    pick();
    vi.advanceTimersByTime(3000);
    pick(boris);
    vi.advanceTimersByTime(3999);
    expect(notice()).toContain('Петров Борис');
    vi.advanceTimersByTime(1);
    expect(notice()).toBeNull();
  });

  it('hides at once on «Скрыть»', () => {
    pick();
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('.added button')!
      .click();
    expect(notice()).toBeNull();
  });

  it('does not fire the timer after the page is destroyed', () => {
    const appTimers = vi.getTimerCount(); // ClockService's midnight tick lives on
    pick();
    fixture.destroy();
    expect(vi.getTimerCount()).toBe(appTimers);
  });
});
