import { Injectable, computed, inject, signal } from '@angular/core';
import { Person, PersonId } from '../../people/domain/person';
import { FriendList, addFriend, friendFromPerson, removeFriend } from '../domain/friend-list';
import { FRIEND_STORE } from './friend-store.port';

@Injectable({ providedIn: 'root' })
export class FriendsStore {
  private readonly store = inject(FRIEND_STORE);
  private readonly list = signal<FriendList>(this.store.load());

  readonly friends = this.list.asReadonly();
  readonly ids = computed(() => new Set(this.list().map((f) => f.id)));

  has(id: PersonId): boolean {
    return this.ids().has(id);
  }

  add(person: Person): void {
    this.update(addFriend(this.list(), friendFromPerson(person, new Date().toISOString())));
  }

  remove(id: PersonId): void {
    this.update(removeFriend(this.list(), id));
  }

  toggle(person: Person): void {
    if (this.has(person.id)) this.remove(person.id);
    else this.add(person);
  }

  private update(next: FriendList): void {
    this.list.set(next);
    this.store.save(next);
  }
}
