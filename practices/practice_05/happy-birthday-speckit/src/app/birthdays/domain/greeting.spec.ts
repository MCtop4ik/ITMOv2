import { addressName, buildGreeting } from './greeting';

describe('greeting', () => {
  it('addresses by first name and patronymic', () => {
    expect(addressName('Романова Марина Викторовна')).toBe('Марина Викторовна');
    expect(addressName('Иванов Иван')).toBe('Иван');
    expect(addressName('Иванов')).toBe('Иванов');
  });

  it('builds a regular greeting', () => {
    expect(buildGreeting('Романова Марина Викторовна', 54)).toMatch(
      /^Марина Викторовна, с днём рождения! /,
    );
  });

  it('mentions the jubilee age', () => {
    expect(buildGreeting('Романова Марина Викторовна', 50)).toMatch(/^Марина Викторовна, с 50-летием! /);
  });
});
