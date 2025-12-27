import { expect, test } from '@playwright/test';
import { isFiniteNumber, isEqualNumbers } from '@libc/shared/src/number';

test.describe('number工具函数相关测试', async () => {
  test('isFiniteNumber函数测试', async () => {
    const validNumbers = [0, 123456, -123456, 12345678900000, -12345678900000, 123456.789, -123456.789, +100, -100];
    const validString = validNumbers.map((num) => String.raw`${num}`);
    const validPercent = validNumbers.map((num) => String.raw`${num}%`);
    const validValues = [...validNumbers, ...validString, ...validPercent];

    for (const val of validValues) {
      expect(isFiniteNumber(val)).toBe(true);
    }

    const invalidValues = [NaN, Infinity, -Infinity, 'abc', '', null, undefined, {}, [], '   ', '%50'];
    for (const val of invalidValues) {
      expect(isFiniteNumber(val)).toBeFalsy();
    }
  });

  test('isEqualNumbers函数测试', async () => {
    const numbersPairs: Array<[number | string, number | string]> = [
      [0, '0.0000'],
      ['123456', 123456],
      ['-123456', -123456],
      ['123456.789000', 123456.789],
      ['-123456.789000', -123456.789],
      ['10%', '10.0000%'],
      ['-10%', '-10.0000%'],
      ['0.1%', 0.001],
      ['-0.1%', -0.001]
    ];
    for (const [a, b] of numbersPairs) {
      expect(isEqualNumbers(a, b)).toBe(true);
    }
  });
});
