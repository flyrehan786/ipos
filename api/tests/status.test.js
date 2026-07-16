const { VALID_STATUSES, ORDER_STATUSES, isValidStatus, isValidOrderStatus } = require('../utils/status');

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

describe('order status util', () => {
  test('ORDER_STATUSES contains pending, completed, cancelled only', () => {
    expect(ORDER_STATUSES).toEqual(['pending', 'completed', 'cancelled']);
  });

  test('isValidOrderStatus accepts allowed values', () => {
    expect(isValidOrderStatus('pending')).toBe(true);
    expect(isValidOrderStatus('completed')).toBe(true);
    expect(isValidOrderStatus('cancelled')).toBe(true);
  });

  test('isValidOrderStatus rejects anything else', () => {
    expect(isValidOrderStatus('active')).toBe(false);
    expect(isValidOrderStatus('Completed')).toBe(false);
    expect(isValidOrderStatus('')).toBe(false);
    expect(isValidOrderStatus(null)).toBe(false);
    expect(isValidOrderStatus(undefined)).toBe(false);
  });
});
