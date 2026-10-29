import { isJubilee } from './birthday';

/** «Имя Отчество», or «Имя», or the full name when there is no first name. */
export function addressName(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  return words.length === 1 ? words[0] : words.slice(1).join(' ');
}

export function buildGreeting(fullName: string, turningAge: number): string {
  const name = addressName(fullName);
  const occasion = isJubilee(turningAge) ? `с ${turningAge}-летием!` : 'с днём рождения!';
  return `${name}, ${occasion} Желаю здоровья, радости и всего самого доброго в новом году жизни.`;
}
