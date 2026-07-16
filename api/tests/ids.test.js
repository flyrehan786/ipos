const { parseIds } = require('../utils/ids');

describe('parseIds', () => {
  test('returns empty array for non-array input', () => {
    expect(parseIds(undefined)).toEqual([]);
    expect(parseIds(null)).toEqual([]);
    expect(parseIds('1,2,3')).toEqual([]);
    expect(parseIds(42)).toEqual([]);
    expect(parseIds({})).toEqual([]);
  });

  test('returns empty array for empty array', () => {
    expect(parseIds([])).toEqual([]);
  });

  test('keeps positive integers and coerces numeric strings', () => {
    expect(parseIds([1, '2', 3])).toEqual([1, 2, 3]);
  });

  test('drops non-integers, zero, and negatives', () => {
    expect(parseIds([0, -1, 1.5, 'abc', NaN, null, undefined, 2])).toEqual([2]);
  });

  test('removes duplicates preserving first occurrence order', () => {
    expect(parseIds([3, 3, 1, '1', 2])).toEqual([3, 1, 2]);
  });

  test('excludes ids listed in options.exclude', () => {
    expect(parseIds([1, 2, 3], { exclude: [2] })).toEqual([1, 3]);
    expect(parseIds([1, 2, 3], { exclude: ['1', '3'] })).toEqual([2]);
  });

  test('returns empty array when everything is excluded or invalid', () => {
    expect(parseIds([5], { exclude: [5] })).toEqual([]);
    expect(parseIds([-1, 0, 'x'])).toEqual([]);
  });
});
