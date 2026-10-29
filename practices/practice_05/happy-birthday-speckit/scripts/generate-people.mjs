// Generates a test people file: node scripts/generate-people.mjs [count] > people.txt
// Includes birthdays today, tomorrow, 3 days ago, 29 Feb, duplicates and a few broken lines.

const count = Number(process.argv[2] ?? 100_000);

const male = {
  last: ['Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов', 'Новиков', 'Фёдоров', 'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семёнов', 'Егоров', 'Павлов', 'Козлов', 'Степанов', 'Николаев', 'Романов'],
  first: ['Александр', 'Сергей', 'Дмитрий', 'Андрей', 'Алексей', 'Максим', 'Евгений', 'Иван', 'Михаил', 'Артём', 'Николай', 'Владимир', 'Пётр', 'Олег'],
  patronymic: ['Александрович', 'Сергеевич', 'Дмитриевич', 'Андреевич', 'Алексеевич', 'Иванович', 'Михайлович', 'Николаевич', 'Владимирович', 'Петрович'],
};
const female = {
  last: male.last.map((name) => `${name}а`),
  first: ['Марина', 'Елена', 'Ольга', 'Наталья', 'Анна', 'Татьяна', 'Ирина', 'Светлана', 'Екатерина', 'Мария', 'Юлия', 'Анастасия', 'Дарья', 'Людмила'],
  patronymic: ['Александровна', 'Сергеевна', 'Дмитриевна', 'Андреевна', 'Алексеевна', 'Ивановна', 'Михайловна', 'Николаевна', 'Владимировна', 'Петровна', 'Викторовна', 'Юрьевна'],
};

let seed = 42;
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = (list) => list[Math.floor(random() * list.length)];
const pad = (n) => String(n).padStart(2, '0');
const line = (name, d, m, y) => `${name} (${pad(d)}.${pad(m)}.${y})|`;

function randomName() {
  const set = random() < 0.5 ? male : female;
  return `${pick(set.last)} ${pick(set.first)} ${pick(set.patronymic)}`;
}

function randomDate() {
  const year = 1935 + Math.floor(random() * 88);
  const month = 1 + Math.floor(random() * 12);
  const day = 1 + Math.floor(random() * new Date(year, month, 0).getDate());
  return [day, month, year];
}

const today = new Date();
const shifted = (days) => {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + days);
  return [d.getDate(), d.getMonth() + 1];
};

const lines = [
  line('Романова Марина Викторовна', ...shifted(0), 1976),
  line('Романова Марина Николаевна', ...shifted(1), 1972),
  line('Романова Марина Сергеевна', ...shifted(-3), 1986),
  line('Романова Марина Юрьевна', 29, 2, 1984),
  line('Романова Марина Викторовна', ...shifted(0), 1976),
  'Строка без даты|',
  'Иванов Иван (31.02.1990)|',
  `Петров Пётр (01.01.${today.getFullYear() + 1})|`,
  '',
];
while (lines.length < count) lines.push(line(randomName(), ...randomDate()));

process.stdout.write(lines.join('\n') + '\n');
