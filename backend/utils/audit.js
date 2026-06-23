const AuditLog = require('../models/AuditLog');

/**
 * Records an audit-trail entry for the authenticated request. Failures are
 * swallowed (logged only) so that auditing never breaks the primary operation.
 *
 * @param {object} req - Express request (expects req.user from auth middleware).
 * @param {string} action - e.g. 'create', 'update', 'delete', 'bulk-delete', 'login'.
 * @param {string|null} [entityType] - e.g. 'product', 'client', 'user', 'sale_order'.
 * @param {string|number|null} [entityId] - Affected record id (or summary token).
 * @param {object|string|null} [details] - Extra context; objects are JSON-stringified.
 */
async function recordAudit(req, action, entityType = null, entityId = null, details = null) {
  try {
    await AuditLog.create({
      user_id: req && req.user ? req.user.id : null,
      username: req && req.user ? req.user.username : null,
      action,
      entity_type: entityType,
      entity_id: entityId == null ? null : String(entityId),
      details: details == null ? null : (typeof details === 'string' ? details : JSON.stringify(details))
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

module.exports = { recordAudit };
