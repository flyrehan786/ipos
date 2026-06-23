const { getPaginationParams, buildPaginatedResponse } = require('../utils/pagination');

describe('getPaginationParams', () => {
  test('returns defaults when params are absent', () => {
    const r = getPaginationParams({});
    expect(r.page).toBe(1);
    expect(r.limit).toBe(10);
    expect(r.offset).toBe(0);
  });

  test('computes offset from page and limit', () => {
    const r = getPaginationParams({ page: '3', limit: '20' });
    expect(r.page).toBe(3);
    expect(r.limit).toBe(20);
    expect(r.offset).toBe(40);
  });

  test('clamps invalid page/limit to safe defaults', () => {
    const r = getPaginationParams({ page: '-5', limit: 'abc' });
    expect(r.page).toBe(1);
    expect(r.limit).toBe(10);
    expect(r.offset).toBe(0);
  });

  test('caps limit at the configured maximum', () => {
    const r = getPaginationParams({ page: '1', limit: '5000' });
    expect(r.limit).toBe(100);
  });
});

describe('buildPaginatedResponse', () => {
  test('computes totalPages by ceiling', () => {
    const r = buildPaginatedResponse({ data: [], total: 25, page: 1, limit: 10 });
    expect(r.totalPages).toBe(3);
    expect(r.total).toBe(25);
  });

  test('totalPages is never below 1', () => {
    const r = buildPaginatedResponse({ data: [], total: 0, page: 1, limit: 10 });
    expect(r.totalPages).toBe(1);
  });
});
