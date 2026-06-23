/**
 * Dependency-free CSV generation with RFC-4180 quoting and basic
 * spreadsheet formula-injection mitigation.
 */

function escapeCell(value) {
  if (value === null || value === undefined) {
    return '';
  }

  let str = value instanceof Date ? value.toISOString() : String(value);

  // Mitigate CSV/formula injection when the file is opened in a spreadsheet app.
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Quote fields containing delimiters, quotes, or newlines.
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * @param {Array<Object>} rows
 * @param {Array<{key: string, header: string}>} [columns] Optional explicit
 *   columns. When omitted, columns are derived from the first row's keys.
 * @returns {string} CSV text (CRLF line endings).
 */
function toCsv(rows, columns) {
  const list = Array.isArray(rows) ? rows : [];

  let cols = columns;
  if (!cols || cols.length === 0) {
    cols = list.length > 0
      ? Object.keys(list[0]).map(k => ({ key: k, header: k }))
      : [];
  }

  const headerLine = cols.map(c => escapeCell(c.header)).join(',');
  const dataLines = list.map(row => cols.map(c => escapeCell(row[c.key])).join(','));

  return [headerLine, ...dataLines].join('\r\n');
}

module.exports = { toCsv, escapeCell };
