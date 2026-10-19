import { rowText } from '../TemplatesTab';

const name = (c: string) => ({ BASIC: 'Basic salary', HRA: 'House rent allowance', FOOD: 'Food allowance' } as Record<string, string>)[c] || c;

describe('template rows read as they split', () => {
  it('states each basis', () => {
    expect(rowText({ code: 'BASIC', basis: 'PCT_OF_GROSS', value: '66.6700' }, name)).toBe('Basic salary 66.67% of gross');
    expect(rowText({ code: 'HRA', basis: 'PCT_OF_BASIC', value: '50.0000' }, name)).toBe('House rent allowance 50% of basic');
    expect(rowText({ code: 'FOOD', basis: 'FIXED', value: '1250.0000' }, name)).toBe('Food allowance ৳1,250');
  });
});
