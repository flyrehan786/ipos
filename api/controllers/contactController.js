const ContactMessage = require('../models/ContactMessage');
const { getPaginationParams, buildPaginatedResponse } = require('../utils/pagination');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public endpoint — anyone can submit a contact request from the marketing site.
exports.submitMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }
    if (String(name).length > 100 || String(email).length > 100 || String(subject || '').length > 200 || String(message).length > 5000) {
      return res.status(400).json({ error: 'One or more fields exceed the allowed length' });
    }

    const id = await ContactMessage.create({
      name: String(name).trim(),
      email: String(email).trim(),
      subject: subject ? String(subject).trim() : null,
      message: String(message).trim()
    });

    res.status(201).json({ message: 'Your message has been received. We will get back to you soon.', id });
  } catch (error) {
    console.error('Submit contact message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Super-admin endpoints.
exports.getMessages = async (req, res) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const search = req.query.search || req.query.q || '';
    const status = req.query.status || '';
    const { data, total } = await ContactMessage.getPaginated({ limit, offset, search, status });
    res.json(buildPaginatedResponse({ data, total, page, limit }));
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'read', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'status must be "new", "read", or "archived"' });
    }
    const updated = await ContactMessage.updateStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: 'Message updated' });
  } catch (error) {
    console.error('Update contact message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const deleted = await ContactMessage.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
