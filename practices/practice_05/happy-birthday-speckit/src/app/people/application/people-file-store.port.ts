import { InjectionToken } from '@angular/core';

export interface StoredFile {
  readonly text: string;
  readonly fileName: string;
  readonly importedAt: string;
}

export interface PeopleFileStore {
  load(): Promise<StoredFile | null>;
  save(file: StoredFile): Promise<void>;
  clear(): Promise<void>;
}

export const PEOPLE_FILE_STORE = new InjectionToken<PeopleFileStore>('PeopleFileStore');
