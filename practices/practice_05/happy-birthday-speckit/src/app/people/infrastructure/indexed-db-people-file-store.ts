import { PeopleFileStore, StoredFile } from '../application/people-file-store.port';

const DB_NAME = 'happy-birthday';
const STORE = 'files';
const KEY = 'current';

function asPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class IndexedDbPeopleFileStore implements PeopleFileStore {
  private db: Promise<IDBDatabase> | null = null;

  private open(): Promise<IDBDatabase> {
    this.db ??= new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return this.db;
  }

  private async store(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    return (await this.open()).transaction(STORE, mode).objectStore(STORE);
  }

  async load(): Promise<StoredFile | null> {
    return (await asPromise((await this.store('readonly')).get(KEY))) ?? null;
  }

  async save(file: StoredFile): Promise<void> {
    await asPromise((await this.store('readwrite')).put(file, KEY));
  }

  async clear(): Promise<void> {
    await asPromise((await this.store('readwrite')).delete(KEY));
  }
}
