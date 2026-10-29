import { Injectable, computed, inject, signal } from '@angular/core';
import { ClockService } from '../../shared/application/clock.service';
import { ImportResult, parsePeopleFile } from '../domain/parse-people-file';
import { Person, PersonId } from '../domain/person';
import { decodeFileBytes } from '../infrastructure/decode-file';
import { PEOPLE_FILE_STORE, StoredFile } from './people-file-store.port';

export type PeopleStatus = 'empty' | 'loading' | 'ready' | 'error';

@Injectable({ providedIn: 'root' })
export class PeopleStore {
  private readonly fileStore = inject(PEOPLE_FILE_STORE);
  private readonly clock = inject(ClockService);

  readonly status = signal<PeopleStatus>('loading');
  readonly error = signal<string | null>(null);
  readonly fileName = signal<string | null>(null);
  /** Summary of the most recent import made in this session; null after a restore. */
  readonly lastImport = signal<ImportResult | null>(null);
  /** False when the browser refused to persist the file (private mode, quota). */
  readonly persistent = signal(true);

  private readonly result = signal<ImportResult | null>(null);
  readonly people = computed<readonly Person[]>(() => this.result()?.people ?? []);
  readonly byId = computed(() => new Map(this.people().map((p) => [p.id, p])));

  find(id: PersonId): Person | undefined {
    return this.byId().get(id);
  }

  async restore(): Promise<void> {
    try {
      const stored = await this.fileStore.load();
      if (stored) this.apply(stored);
      else this.status.set('empty');
    } catch {
      this.persistent.set(false);
      this.status.set('empty');
    }
  }

  async importFile(file: File): Promise<void> {
    const previous = this.status();
    this.status.set('loading');
    this.error.set(null);
    try {
      const text = decodeFileBytes(await file.arrayBuffer());
      const result = parsePeopleFile(text, this.clock.today());
      if (result.people.length === 0) {
        this.error.set('В файле не нашлось ни одной записи в формате «Фамилия Имя Отчество (ДД.ММ.ГГГГ)|».');
        this.status.set(previous === 'loading' ? 'empty' : previous);
        return;
      }
      const stored: StoredFile = { text, fileName: file.name, importedAt: new Date().toISOString() };
      this.result.set(result);
      this.fileName.set(file.name);
      this.lastImport.set(result);
      this.status.set('ready');
      await this.save(stored);
    } catch {
      this.error.set('Не удалось прочитать файл. Проверьте, что это текстовый файл.');
      this.status.set(previous === 'loading' ? 'empty' : previous);
    }
  }

  async clear(): Promise<void> {
    this.result.set(null);
    this.fileName.set(null);
    this.lastImport.set(null);
    this.status.set('empty');
    await this.fileStore.clear().catch(() => this.persistent.set(false));
  }

  dismissImportSummary(): void {
    this.lastImport.set(null);
  }

  private apply(stored: StoredFile): void {
    this.result.set(parsePeopleFile(stored.text, this.clock.today()));
    this.fileName.set(stored.fileName);
    this.status.set('ready');
  }

  private async save(stored: StoredFile): Promise<void> {
    try {
      await this.fileStore.save(stored);
      this.persistent.set(true);
    } catch {
      this.persistent.set(false);
    }
  }
}
