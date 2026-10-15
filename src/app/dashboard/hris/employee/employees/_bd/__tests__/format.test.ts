/**
 * Display formatting and live hints for the BD screens (backend §4, §10).
 * Money is grouped and summed as strings / integer paisa — never through a
 * float — and a year is never grouped.
 */

import {
  addMoney,
  formatBDT,
  formatDate,
  formatMonthYear,
  groupSouthAsian,
  initials,
  parseAmount,
  percentChange,
  plural,
  subtractMoney,
  toBanglaNumerals,
} from '../format';
import { etinValid, mobileValid, nidValid, shareTotal, sharesComplete } from '../validate';

describe('money', () => {
  test('South Asian grouping from decimal strings', () => {
    expect(groupSouthAsian('1234567')).toBe('12,34,567');
    expect(groupSouthAsian('22000.00')).toBe('22,000');
    expect(groupSouthAsian('126.92')).toBe('126.92');
    expect(groupSouthAsian('100000', 2)).toBe('1,00,000.00');
    expect(groupSouthAsian('-4400.5')).toBe('−4,400.50');
    expect(groupSouthAsian(null)).toBe('—');
  });

  test('taka with Bangla numerals applied after formatting', () => {
    expect(formatBDT('22000.00')).toBe('৳ 22,000');
    expect(formatBDT('22000.00', { bangla: true })).toBe('৳ ২২,০০০');
    expect(toBanglaNumerals('EMP-0142')).toBe('EMP-০১৪২');
  });

  test('exact arithmetic in paisa', () => {
    // 0.1 + 0.2 in floats is 0.30000000000000004.
    expect(addMoney('0.10', '0.20')).toBe('0.30');
    expect(addMoney('22000.00', '1056.00', '1100.00', null)).toBe('24156.00');
    expect(subtractMoney('22000.00', '24200.00')).toBe('-2200.00');
    expect(percentChange('22000.00', '24200.00')).toBe('+10.0%');
    expect(percentChange('0', '1')).toBeNull();
  });

  test('typed amounts normalise', () => {
    expect(parseAmount('৳50,000')).toBe('50000');
    expect(parseAmount('1,234.567')).toBe('1234.56');
    expect(parseAmount('abc')).toBe('');
  });
});

describe('dates', () => {
  test('DD/MM/YYYY from the ISO string, no locale parsing', () => {
    expect(formatDate('2027-03-08')).toBe('08/03/2027');
    expect(formatDate('2027-03-08', true)).toBe('০৮/০৩/২০২৭');
    expect(formatDate(null)).toBe('—');
  });

  test('a year is a label, never grouped', () => {
    expect(formatMonthYear('2026-02')).toBe('February 2026');
    expect(formatMonthYear('2026-02-01', 'bn')).toBe('ফেব্রুয়ারি ২০২৬');
  });
});

describe('hints', () => {
  test('NID, mobile and e-TIN', () => {
    expect(nidValid('1990 7812 34')).toBe(true);
    expect(nidValid('12')).toBe(false);
    expect(mobileValid('01711-223344')).toBe(true);
    expect(mobileValid('02711223344')).toBe(false);
    expect(etinValid('412998877661')).toBe(true);
  });

  test('nominee shares to the thousandth', () => {
    expect(shareTotal(['60', '30'])).toBe(90);
    expect(sharesComplete(shareTotal(['33.333', '33.333', '33.334']))).toBe(true);
    expect(sharesComplete(shareTotal(['60', '30']))).toBe(false);
  });

  test('one helper for count and noun', () => {
    expect(plural(1, 'item', 'items')).toBe('1 item');
    expect(plural(3, 'item', 'items')).toBe('3 items');
  });
});

describe('initials', () => {
  it('takes the first and last initial', () => {
    expect(initials('Rahima Akter Khatun')).toBe('RK');
    expect(initials('Sarwar')).toBe('S');
  });

  it('drops a leading honorific, so Md. does not make every avatar MI or MR', () => {
    expect(initials('Md. Rafiqul Islam')).toBe('RI');
    expect(initials('Md Habibur Rahman')).toBe('HR');
    expect(initials('Mohammad Ali Hossain')).toBe('AH');
    expect(initials('Begum Rokeya Sultana')).toBe('RS');
    expect(initials('Mrs. Nasrin Akter')).toBe('NA');
  });

  it('keeps an honorific-like word that is not leading', () => {
    expect(initials('Nurjahan Begum')).toBe('NB');
  });

  it('never returns an empty string', () => {
    expect(initials('')).toBe('?');
  });
});
