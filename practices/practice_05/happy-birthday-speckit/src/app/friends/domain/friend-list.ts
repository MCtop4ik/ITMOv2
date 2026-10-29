import { CalendarDate, parseIsoDate, toIsoString } from '../../shared/domain/calendar-date';
import { Person, PersonId, personId } from '../../people/domain/person';

/** A friend keeps its own copy of name and date, so it survives file replacement. */
export interface Friend {
  readonly id: PersonId;
  readonly fullName: string;
  readonly birthDate: CalendarDate;
  readonly addedAt: string;
}

export type FriendList = readonly Friend[];

export function friendFromPerson(person: Person, addedAt: string): Friend {
  return { id: person.id, fullName: person.fullName, birthDate: person.birthDate, addedAt };
}

export function isFriend(list: FriendList, id: PersonId): boolean {
  return list.some((f) => f.id === id);
}

export function addFriend(list: FriendList, friend: Friend): FriendList {
  return isFriend(list, friend.id) ? list : [...list, friend];
}

export function removeFriend(list: FriendList, id: PersonId): FriendList {
  return list.filter((f) => f.id !== id);
}

export interface StoredFriend {
  fullName: string;
  birthDate: string;
  addedAt: string;
}

export function toStoredFriends(list: FriendList): StoredFriend[] {
  return list.map((f) => ({
    fullName: f.fullName,
    birthDate: toIsoString(f.birthDate),
    addedAt: f.addedAt,
  }));
}

/** Parses untrusted JSON-decoded data; invalid entries are dropped, not fatal. */
export function parseStoredFriends(data: unknown): FriendList {
  if (!Array.isArray(data)) return [];
  let list: FriendList = [];
  for (const item of data) {
    if (typeof item !== 'object' || item === null) continue;
    const { fullName, birthDate, addedAt } = item as Record<string, unknown>;
    if (typeof fullName !== 'string' || fullName.trim() === '' || typeof birthDate !== 'string') {
      continue;
    }
    const date = parseIsoDate(birthDate);
    if (!date) continue;
    list = addFriend(list, {
      id: personId(fullName, date),
      fullName: fullName.trim(),
      birthDate: date,
      addedAt: typeof addedAt === 'string' ? addedAt : '',
    });
  }
  return list;
}
