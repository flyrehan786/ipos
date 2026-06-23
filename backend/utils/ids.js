/**
 * Normalizes a raw list of ids from a request body into a clean array of
 * positive integers. Invalid entries are dropped, duplicates removed, and any
 * ids in `options.exclude` are omitted.
 *
 * @param {unknown} input - The raw value (expected to be an array).
 * @param {{ exclude?: Array<number|string> }} [options]
 * @returns {number[]} A deduplicated array of valid positive integer ids.
 */
function parseIds(input, options = {}) {
  if (!Array.isArray(input)) {
    return [];
  }

  const exclude = new Set((options.exclude || []).map(Number));
  const seen = new Set();
  const result = [];

  for (const raw of input) {
    const n = Number(raw);
    if (!Number.isInteger(n) || n <= 0) {
      continue;
    }
    if (exclude.has(n) || seen.has(n)) {
      continue;
    }
    seen.add(n);
    result.push(n);
  }

  return result;
}

module.exports = { parseIds };
