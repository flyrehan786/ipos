const { VALID_STATUSES, isValidStatus } = require('../utils/status');

describe('status util', () => {
  test('VALID_STATUSES contains active and inactive only', () => {
    expect(VALID_STATUSES).toEqual(['active', 'inactive']);
  });

  test('isValidStatus accepts allowed values', () => {
    expect(isValidStatus('active')).toBe(true);
    expect(isValidStatus('inactive')).toBe(true);
  });

  test('isValidStatus rejects anything else', () => {
    expect(isValidStatus('deleted')).toBe(false);
    expect(isValidStatus('Active')).toBe(false);
    expect(isValidStatus('')).toBe(false);
    expect(isValidStatus(null)).toBe(false);
    expect(isValidStatus(undefined)).toBe(false);
    expect(isValidStatus(1)).toBe(false);
  });
});
