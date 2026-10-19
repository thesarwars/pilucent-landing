import { delta, lakh } from '../fmt';

describe('company-wide figures read by order of magnitude', () => {
  it('shortens at a lakh and a crore', () => {
    expect(lakh('24000000')).toBe('৳ 2.40 crore');
    expect(lakh('331046')).toBe('৳ 3.3 lakh');
    expect(lakh('99999')).toBe('৳ 99,999');
    expect(lakh('-150000')).toBe('৳ −1.5 lakh');
    expect(lakh(null)).toBe('—');
  });
  it('signs a delta', () => {
    expect(delta('331046')).toBe('+ ৳ 3.3 lakh');
    expect(delta('-4200')).toBe('− ৳ 4,200');
    expect(delta('0')).toBe('no change');
  });
});
