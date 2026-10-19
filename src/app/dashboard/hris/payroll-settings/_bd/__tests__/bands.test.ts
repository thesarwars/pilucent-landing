import { bandProblem } from '../ElectionsTab';

const b = (fromMonths: number, toMonths: number, pct: string) => ({ fromMonths, toMonths, pct });

describe('festival bonus bands cover months 0 to 11 contiguously', () => {
  it('accepts the default', () => {
    expect(bandProblem([b(0, 2, '0'), b(3, 5, '25'), b(6, 8, '50'), b(9, 11, '75')])).toBeNull();
  });
  it('names a gap at month six (S8)', () => {
    expect(bandProblem([b(0, 5, '0'), b(7, 11, '50')])).toBe('A gap or overlap at month 7.');
  });
  it('refuses bands that stop short of eleven (S9)', () => {
    expect(bandProblem([b(0, 9, '50')])).toMatch(/last ends at 9/);
  });
  it('refuses a percentage above 100', () => {
    expect(bandProblem([b(0, 11, '120')])).toMatch(/0 to 100/);
  });
});
