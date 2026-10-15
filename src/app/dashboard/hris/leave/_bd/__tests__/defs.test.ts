import { csv, fmtDays, kindFill, spendableShown } from '../defs';
import type { Position } from '../types';

const pos = (balance: string, held: string, committed: string, spendable: string): Position => ({
  balance,
  held,
  committed,
  spendable,
  eligible: true,
  reason: null,
  cycle: null,
});

describe('figures', () => {
  it('shows days to one place, whole days bare', () => {
    expect(fmtDays('20')).toBe('20');
    expect(fmtDays('20.2222')).toBe('20.2');
    expect(fmtDays('0.5')).toBe('0.5');
    expect(fmtDays(null)).toBe('—');
  });

  it('shows what can be spent with the decomposition beneath', () => {
    expect(spendableShown(pos('7', '0', '5', '2'))).toEqual({ figure: '2', note: '7 less 5 booked ahead' });
    expect(spendableShown(pos('10', '3', '0', '7')).note).toBe('10 less 3 held');
  });

  it('never shows a negative spendable: zero, with the shortfall named', () => {
    expect(spendableShown(pos('2', '5', '0', '-3'))).toEqual({ figure: '0', note: '2 less 5 held · 3 short' });
  });
});

describe('calendar fills', () => {
  it('hatches only what is undecided, and gives statutory leave its own violet', () => {
    expect(kindFill('CASUAL', true, false)).toContain('repeating-linear-gradient');
    expect(kindFill('MATERNITY', false, true)).toBe('#6B3FA0');
    expect(kindFill('SICK', false, false)).toBe('#BE123C');
  });
});

describe('the CSV export', () => {
  it('quotes every field, doubles quotes and ends lines with CRLF', () => {
    const text = csv([{ label: 'Name', get: (r: { n: string }) => r.n }], [{ n: 'Rahima "Ruma" Begum' }, { n: 'রহিমা' }]);
    expect(text).toBe('"Name"\r\n"Rahima ""Ruma"" Begum"\r\n"রহিমা"');
  });
});
