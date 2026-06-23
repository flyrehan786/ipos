const AuditLog = require('../models/AuditLog');
const { getPaginationParams, buildPaginatedResponse } = require('../utils/pagination');

exports.getAuditLogs = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const search = req.query.search || req.query.q || '';
    const { data, total } = await AuditLog.getPaginated({ limit, offset, search });
    res.json(buildPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
