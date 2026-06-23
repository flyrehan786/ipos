/** Allowed values for the `status` column across products, clients, and users. */
const VALID_STATUSES = ['active', 'inactive'];

/** Allowed values for the order `status` column (sale and purchase orders). */
const ORDER_STATUSES = ['pending', 'completed', 'cancelled'];

/**
 * @param {unknown} value
 * @returns {boolean} True if `value` is an accepted status string.
 */
function isValidStatus(value) {
  return VALID_STATUSES.includes(value);
}

/**
 * @param {unknown} value
 * @returns {boolean} True if `value` is an accepted order status string.
 */
function isValidOrderStatus(value) {
  return ORDER_STATUSES.includes(value);
}

module.exports = { VALID_STATUSES, ORDER_STATUSES, isValidStatus, isValidOrderStatus };
