/**
 * Parse and sanitize pagination parameters from a request query.
 * Always returns safe integers so the values can be inlined into SQL
 * LIMIT/OFFSET clauses without risk of injection.
 */
function getPaginationParams(query, { defaultLimit = 10, maxLimit = 100 } = {}) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Build a standard paginated envelope returned to API clients.
 */
function buildPaginatedResponse({ data, total, page, limit }) {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit))
  };
}

module.exports = { getPaginationParams, buildPaginatedResponse };
