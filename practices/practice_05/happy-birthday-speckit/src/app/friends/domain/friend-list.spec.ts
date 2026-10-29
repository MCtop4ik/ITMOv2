import { createPerson } from '../../people/domain/person';
import {
  addFriend,
  friendFromPerson,
  isFriend,
  parseStoredFriends,
  removeFriend,
  toStoredFriends,
} from './friend-list';

const marina = createPerson('Романова Марина Викторовна', { year: 1972, month: 5, day: 19 });
const ivan = createPerson('Иванов Иван', { year: 1990, month: 1, day: 1 });
const at = '2026-10-30T10:00:00.000Z';

describe('friend-list', () => {
  it('adds friends idempotently and removes them', () => {
    const one = addFriend([], friendFromPerson(marina, at));
    const same = addFriend(one, friendFromPerson(marina, at));
    expect(same).toBe(one);
    const two = addFriend(one, friendFromPerson(ivan, at));
    expect(two.map((f) => f.fullName)).toEqual([marina.fullName, ivan.fullName]);
    expect(isFriend(two, ivan.id)).toBe(true);
    const back = removeFriend(two, ivan.id);
    expect(isFriend(back, ivan.id)).toBe(false);
    expect(back).toHaveLength(1);
  });

  it('round-trips through storage form', () => {
    const list = [friendFromPerson(marina, at)];
    const restored = parseStoredFriends(JSON.parse(JSON.stringify(toStoredFriends(list))));
    expect(restored).toEqual(list);
  });

  it('drops invalid stored entries without failing', () => {
    expect(parseStoredFriends('nope')).toEqual([]);
    const restored = parseStoredFriends([
      null,
      42,
      { fullName: '', birthDate: '1990-01-01' },
      { fullName: 'Иванов', birthDate: '1990-02-30' },
      { fullName: 'Иванов', birthDate: 19900101 },
      { fullName: 'Иванов Иван', birthDate: '1990-01-01' },
      { fullName: 'иванов  иван', birthDate: '1990-01-01', addedAt: at },
    ]);
    expect(restored).toEqual([
      { id: ivan.id, fullName: 'Иванов Иван', birthDate: ivan.birthDate, addedAt: '' },
    ]);
  });
});
