import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PeopleStore } from '../../application/people.store';
import { FilePickerService } from './file-picker.service';

@Component({
  selector: 'app-file-drop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="landing">
      @if (people.status() === 'loading') {
        <h1>Читаю список…</h1>
        <p class="mono">Большой файл разбирается несколько секунд.</p>
      } @else {
        <h1>Чей сегодня<br />день рождения?</h1>
        <div class="drop">
          <p class="lead">
            Перетащите сюда текстовый файл со списком людей или выберите его на компьютере.
          </p>
          <button type="button" class="btn" (click)="picker.open()">Выбрать файл</button>
          <p class="mono format">Формат строки: Романова Марина Викторовна (19.05.1972)|</p>
          @if (people.error(); as error) {
            <p class="error-text" role="alert">{{ error }}</p>
          }
        </div>
        <p class="muted">Файл никуда не отправляется и хранится только в этом браузере.</p>
      }
    </section>
  `,
  styles: `
    .landing {
      display: grid;
      gap: var(--sp-5);
      max-width: 760px;
    }
    .drop {
      border: 5px dashed var(--black);
      padding: var(--sp-5) var(--sp-4);
      display: grid;
      gap: var(--sp-3);
      justify-items: start;
    }
    .lead {
      font-size: 22px;
      line-height: 1.3;
      margin: 0;
    }
    .format {
      margin: 0;
      overflow-wrap: anywhere;
    }
  `,
})
export class FileDropComponent {
  protected readonly people = inject(PeopleStore);
  protected readonly picker = inject(FilePickerService);
}
