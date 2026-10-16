import { NEXT_STATE, bytes, errorLine, lastFour, range, reasonShort, stepOf } from '../defs';

describe('intake helpers', () => {
  it('a parse error names its row and quotes the raw value (§6.2)', () => {
    expect(errorLine({ row: 47, field: 'date', value: '32/03/2027', message: 'date "32/03/2027" is not a valid date in DD/MM/YYYY' }))
      .toBe('row 47 · date "32/03/2027" is not a valid date in DD/MM/YYYY');
  });
  it('the stepper follows the batch', () => {
    expect([stepOf(undefined), stepOf('UPLOADED'), stepOf('PARSED'), stepOf('VALIDATED'), stepOf('PROCESSED'), stepOf('REVERSED')])
      .toEqual([0, 1, 2, 3, 4, 4]);
  });
  it('the period is a one-way ratchet', () => {
    expect(NEXT_STATE.OPEN).toBe('PROCESSING');
    expect(NEXT_STATE.REVIEW).toBe('LOCKED');
    expect(NEXT_STATE.LOCKED).toBeNull();
  });
  it('suggests by the last four digits, as the server does', () => {
    expect(lastFour('EMP-0217')).toBe('0217');
    expect(lastFour('217')).toBe('0217');
    expect(lastFour('ABC')).toBe('');
  });
  it('formats', () => {
    expect(range({ from: '2027-03-01', to: '2027-03-03' })).toBe('2027-03-01 → 2027-03-03');
    expect(range(null)).toBe('—');
    expect(bytes(13432)).toBe('13.1 KB');
    expect(reasonShort('too short')).toBe(true);
    expect(reasonShort('long enough reason')).toBe(false);
  });
});
