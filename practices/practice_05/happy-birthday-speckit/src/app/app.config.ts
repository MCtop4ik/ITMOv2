import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { FRIEND_STORE } from './friends/application/friend-store.port';
import { LocalStorageFriendStore } from './friends/infrastructure/local-storage-friend-store';
import { PEOPLE_FILE_STORE } from './people/application/people-file-store.port';
import { PeopleStore } from './people/application/people.store';
import { IndexedDbPeopleFileStore } from './people/infrastructure/indexed-db-people-file-store';

registerLocaleData(localeRu);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    { provide: LOCALE_ID, useValue: 'ru' },
    { provide: PEOPLE_FILE_STORE, useClass: IndexedDbPeopleFileStore },
    { provide: FRIEND_STORE, useClass: LocalStorageFriendStore },
    provideAppInitializer(() => {
      // Restore in the background so the shell renders its loading state immediately.
      void inject(PeopleStore).restore();
    }),
  ],
};
