import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { PeopleStore } from '../../application/people.store';
import { SkipReason } from '../../domain/parse-people-file';

const REASON_TEXT: Record<SkipReason, string> = {
  format: 'Не удалось распознать строку',
  'invalid-date': 'Такой даты не существует',
  'future-date': 'Дата рождения в будущем',
};

/** Only the first lines are rendered; a broken 100k-line file must not freeze the dialog. */
const MAX_SKIPPED_SHOWN = 200;

@Component({
  selector: 'app-import-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dialog (close)="people.dismissImportSummary()" aria-labelledby="import-title">
      @if (people.lastImport(); as result) {
        <h2 id="import-title">Список загружен</h2>
        <dl class="counts">
          <div>
            <dt>Загружено</dt>
            <dd>{{ result.people.length }}</dd>
          </div>
          <div>
            <dt>Пропущено строк</dt>
            <dd>{{ result.skipped.length }}</dd>
          </div>
          <div>
            <dt>Дубликатов объединено</dt>
            <dd>{{ result.duplicatesMerged }}</dd>
          </div>
        </dl>
        @if (result.skipped.length) {
          <details>
            <summary>Какие строки пропущены</summary>
            <ol class="skipped">
              @for (line of result.skipped.slice(0, maxShown); track line.lineNumber) {
                <li>
                  <span class="mono">Строка {{ line.lineNumber }}:</span>
                  <code>{{ line.text }}</code>
                  <span>{{ reasonText[line.reason] }}</span>
                </li>
              }
            </ol>
            @if (result.skipped.length > maxShown) {
              <p class="muted">Показаны первые {{ maxShown }} строк.</p>
            }
          </details>
        }
        <form method="dialog">
          <button class="btn">Понятно</button>
        </form>
      }
    </dialog>
  `,
  styles: `
    dialog {
      border: 5px solid var(--black);
      padding: var(--sp-4);
      width: min(640px, calc(100vw - 32px));
      max-height: calc(100vh - 32px);
      transition:
        opacity 250ms var(--ease-out),
        transform 250ms var(--ease-out);
    }
    /* The result appears instead of popping in; modals stay centred (specs/002 M4). */
    @starting-style {
      dialog[open] {
        opacity: 0;
        transform: translateY(8px);
      }
    }
    dialog::backdrop {
      background: rgb(255 255 255 / 0.85);
    }
    .counts {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-4);
      margin: var(--sp-4) 0;
    }
    dt {
      font-size: 14px;
    }
    dd {
      margin: 0;
      font: 32px/1 var(--font-head);
    }
    summary {
      cursor: pointer;
      min-height: 44px;
      display: flex;
      align-items: center;
      font-weight: 600;
    }
    .skipped {
      padding-left: var(--sp-4);
      display: grid;
      gap: var(--sp-2);
    }
    .skipped li {
      display: grid;
    }
    code {
      font-family: var(--font-mono);
      background: var(--sunken);
      overflow-wrap: anywhere;
    }
    form {
      margin-top: var(--sp-4);
    }
  `,
})
export class ImportSummaryComponent {
  protected readonly people = inject(PeopleStore);
  protected readonly reasonText = REASON_TEXT;
  protected readonly maxShown = MAX_SKIPPED_SHOWN;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const el = this.dialog().nativeElement;
      if (this.people.lastImport() && !el.open) el.showModal();
    });
  }
}
