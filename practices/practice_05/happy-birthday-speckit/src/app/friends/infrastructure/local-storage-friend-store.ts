import { FriendStore } from '../application/friend-store.port';
import { FriendList, parseStoredFriends, toStoredFriends } from '../domain/friend-list';

const KEY = 'happy-birthday.friends.v1';

export class LocalStorageFriendStore implements FriendStore {
  load(): FriendList {
    try {
      return parseStoredFriends(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
    } catch {
      return [];
    }
  }

  save(list: FriendList): void {
    localStorage.setItem(KEY, JSON.stringify(toStoredFriends(list)));
  }
}
