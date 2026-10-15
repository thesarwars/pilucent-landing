import { fromMinutes, hours, hoursDecimal, parsePunchCsv, shiftMonth, toMinutes, weekdayName } from '../defs';

describe('minute arithmetic', () => {
  it('reads HH:MM, and past midnight on request', () => {
    expect(toMinutes('08:00')).toBe(480);
    expect(toMinutes('17:30')).toBe(1050);
    expect(toMinutes('06:00', true)).toBe(1800);
    expect(toMinutes('24:00')).toBeNull();
    expect(toMinutes('8')).toBeNull();
  });

  it('writes minutes back as a clock time, folding the next day', () => {
    expect(fromMinutes(1050)).toBe('17:30');
    expect(fromMinutes(1800)).toBe('06:00');
  });

  it('states hours', () => {
    expect(hours(480)).toBe('8h');
    expect(hours(630)).toBe('10h 30m');
    expect(hours(45)).toBe('45m');
    expect(hoursDecimal(90)).toBe('1.5');
  });
});

describe('months and days', () => {
  it('steps across a year end', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
  });

  it('names the weekday from the date, not the one-letter abbreviation', () => {
    expect(weekdayName('2026-10-01')).toBe('Thursday');
    expect(weekdayName('2026-10-04')).toBe('Sunday');
  });
});

describe('the punch file', () => {
  it('skips the header and blank lines and reads three columns', () => {
    const rows = parsePunchCsv('employeeCode,punchedAt,direction\n\nEMP-0001,2026-10-14 08:02,IN\r\n"EMP-0001";"2026-10-14 17:05";"OUT"\n');
    expect(rows).toEqual([
      { employeeCode: 'EMP-0001', punchedAt: '2026-10-14 08:02', direction: 'IN' },
      { employeeCode: 'EMP-0001', punchedAt: '2026-10-14 17:05', direction: 'OUT' },
    ]);
  });
});
