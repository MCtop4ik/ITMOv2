import { InjectionToken } from '@angular/core';
import { FriendList } from '../domain/friend-list';

export interface FriendStore {
  load(): FriendList;
  save(list: FriendList): void;
}

export const FRIEND_STORE = new InjectionToken<FriendStore>('FriendStore');
