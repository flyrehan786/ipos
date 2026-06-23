const { toCsv, escapeCell } = require('../utils/csv');

describe('escapeCell', () => {
  test('returns empty string for null/undefined', () => {
    expect(escapeCell(null)).toBe('');
    expect(escapeCell(undefined)).toBe('');
  });

  test('leaves plain values untouched', () => {
    expect(escapeCell('hello')).toBe('hello');
    expect(escapeCell(42)).toBe('42');
  });

  test('quotes and escapes values with commas, quotes, or newlines', () => {
    expect(escapeCell('a,b')).toBe('"a,b"');
    expect(escapeCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCell('line1\nline2')).toBe('"line1\nline2"');
  });

  test('neutralizes formula-injection prefixes', () => {
    expect(escapeCell('=SUM(A1:A2)')).toBe("'=SUM(A1:A2)");
    expect(escapeCell('+1')).toBe("'+1");
    expect(escapeCell('-cmd')).toBe("'-cmd");
    expect(escapeCell('@x')).toBe("'@x");
  });

  test('serializes Date as ISO string', () => {
    const d = new Date('2024-01-02T03:04:05.000Z');
    expect(escapeCell(d)).toBe('2024-01-02T03:04:05.000Z');
  });
});

describe('toCsv', () => {
  test('uses explicit columns and headers', () => {
    const rows = [{ id: 1, name: 'Apple' }, { id: 2, name: 'Pear' }];
    const csv = toCsv(rows, [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' }
    ]);
    expect(csv).toBe('ID,Name\r\n1,Apple\r\n2,Pear');
  });

  test('derives columns from the first row when none provided', () => {
    const csv = toCsv([{ a: 1, b: 2 }]);
    expect(csv).toBe('a,b\r\n1,2');
  });

  test('returns only headers when there are no rows but columns given', () => {
    const csv = toCsv([], [{ key: 'id', header: 'ID' }]);
    expect(csv).toBe('ID');
  });

  test('returns empty string for no rows and no columns', () => {
    expect(toCsv([])).toBe('');
  });

  test('handles missing keys as empty cells', () => {
    const csv = toCsv([{ id: 1 }], [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' }
    ]);
    expect(csv).toBe('ID,Name\r\n1,');
  });
});
