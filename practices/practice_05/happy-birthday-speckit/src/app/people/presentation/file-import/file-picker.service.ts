import { Injectable, inject } from '@angular/core';
import { PeopleStore } from '../../application/people.store';

/** One shared way to open the system file dialog from any screen. */
@Injectable({ providedIn: 'root' })
export class FilePickerService {
  private readonly people = inject(PeopleStore);

  open(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,text/plain';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) void this.people.importFile(file);
    };
    input.click();
  }
}
