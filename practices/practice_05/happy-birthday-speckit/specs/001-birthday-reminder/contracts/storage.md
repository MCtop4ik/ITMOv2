# Contract: локальное хранилище

Все данные — только на устройстве пользователя (FR-023). Доступ — только из infrastructure-слоя
через порты application-слоя.

## IndexedDB

- База: `happy-birthday`, версия `1`, object store `files` (без keyPath).
- Ключ `current` → `{ text: string; fileName: string; importedAt: string /* ISO */ }`.
- Порт: `PeopleFileStore { load(): Promise<StoredFile | null>; save(f: StoredFile): Promise<void>; clear(): Promise<void> }`.

## localStorage

- Ключ `happy-birthday.friends.v1` → JSON:

```json
[{ "fullName": "Романова Марина Викторовна", "birthDate": "1972-05-19",
   "addedAt": "2026-10-29T10:00:00.000Z" }]
```

- `id` не хранится: он вычисляется из `fullName` и `birthDate` при чтении (`personId`).
- Порт: `FriendStore { load(): FriendList; save(list: FriendList): void }`.
- Невалидный JSON или элементы с некорректной датой → игнорируются (возвращается то, что удалось
  прочитать), приложение не падает.
- Ключ `happy-birthday.upcoming-window.v1` → `"7" | "30" | "90"` (выбранный период «Ближайшие»).

## Ошибки

Недоступность IndexedDB (приватный режим, квота) → список работает в памяти текущей сессии,
пользователь видит предупреждение «Список не сохранится после закрытия».
