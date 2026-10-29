import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { PeopleStore } from './people/application/people.store';
import { FileDropComponent } from './people/presentation/file-import/file-drop.component';
import { FilePickerService } from './people/presentation/file-import/file-picker.service';
import { ImportSummaryComponent } from './people/presentation/file-import/import-summary.component';

/** Routes that work without a loaded file. */
const FILE_FREE_ROUTES = ['/friends'];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FileDropComponent, ImportSummaryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:dragover)': 'onDragOver($event)',
    '(window:dragleave)': 'onDragLeave($event)',
    '(window:drop)': 'onDrop($event)',
  },
  template: `
    <a class="skip visually-hidden" href="#main">К содержимому</a>
    <header class="header">
      <a routerLink="/" class="brand">Дни рождения</a>
      <nav aria-label="Разделы">
        <ul>
          @for (tab of tabs; track tab.path) {
            <li>
              <a
                [routerLink]="tab.path"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: tab.path === '/' }"
                ariaCurrentWhenActive="page"
                >{{ tab.label }}</a
              >
            </li>
          }
        </ul>
      </nav>
      <button type="button" class="btn btn-secondary btn-small load" (click)="picker.open()">
        {{ people.status() === 'ready' ? 'Заменить файл' : 'Загрузить файл' }}
      </button>
    </header>

    @if (!people.persistent()) {
      <p class="notice" role="status">
        Браузер не разрешил сохранить список: после закрытия вкладки файл придётся загрузить снова.
      </p>
    }
    @if (people.status() === 'ready' && people.error(); as error) {
      <p class="notice error-text" role="alert">{{ error }}</p>
    }

    <main id="main" class="page">
      @if (people.status() === 'ready' || isFileFreeRoute()) {
        <router-outlet />
      } @else {
        <app-file-drop />
      }
    </main>

    @if (dragging()) {
      <div class="drag-overlay inverted" aria-hidden="true">Отпустите файл, чтобы загрузить список</div>
    }
    <app-import-summary />
  `,
  styles: `
    .header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--sp-3) var(--sp-4);
      padding: var(--sp-3) var(--sp-4);
      border-bottom: var(--border-heavy);
    }
    .brand {
      font: 22px/1 var(--font-head);
      color: var(--black);
      text-decoration: none;
      text-transform: uppercase;
    }
    nav ul {
      display: flex;
      flex-wrap: wrap;
      gap: 0 var(--sp-1);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    nav a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      padding: 0 var(--sp-2);
      color: var(--black);
      font-weight: 600;
      text-decoration: none;
    }
    nav a:hover {
      text-decoration: underline;
    }
    nav a.active {
      background: var(--black);
      color: var(--white);
    }
    .load {
      margin-left: auto;
    }
    .notice {
      margin: 0;
      padding: var(--sp-2) var(--sp-4);
      border-bottom: var(--border);
      font-weight: 600;
    }
    .skip:focus {
      position: static;
      width: auto;
      height: auto;
      clip: auto;
      padding: var(--sp-2);
    }
    .drag-overlay {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      padding: var(--sp-4);
      text-align: center;
      font: clamp(28px, 6vw, 48px) / 1.05 var(--font-head);
      z-index: 10;
    }
    @media (max-width: 700px) {
      .header {
        padding: var(--sp-3);
      }
      .load {
        margin-left: 0;
      }
    }
  `,
})
export class App {
  protected readonly people = inject(PeopleStore);
  protected readonly picker = inject(FilePickerService);
  protected readonly dragging = signal(false);

  protected readonly tabs = [
    { path: '/', label: 'Главная' },
    { path: '/friends', label: 'Мои друзья' },
    { path: '/people', label: 'Все люди' },
    { path: '/calendar', label: 'Календарь' },
    { path: '/stats', label: 'Статистика' },
  ];

  private readonly router = inject(Router);
  protected readonly isFileFreeRoute = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => FILE_FREE_ROUTES.some((r) => this.router.url.startsWith(r))),
    ),
    { initialValue: false },
  );

  protected onDragOver(event: DragEvent): void {
    if (!event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    // relatedTarget is null only when the pointer leaves the window.
    if (!event.relatedTarget) this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) void this.people.importFile(file);
  }
}
