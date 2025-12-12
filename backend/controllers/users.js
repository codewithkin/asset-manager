const userModel = require('../models/user');
const { transformRows, transformRow } = require('../utils/transform');
const logger = require('../utils/logger');

async function getUsers(req, res) {
  try {
    logger.info('GET /api/users', `Fetching users for org: ${req.user.organizationId}`);
    const users = await userModel.findAll(req.user.organizationId);
    logger.info('GET /api/users', `Retrieved ${users.length} users`);
    res.json(transformRows(users));
  } catch (error) {
    logger.error('GET /api/users', `Error fetching users: ${error.message}`, error);
    res.status(500).json({ error: error.message });
  }
}

async function approveUser(req, res) {
  try {
    const { id } = req.params;
    logger.info('PUT /api/users/:id/approve', `Approving user: ${id}`);
    const user = await userModel.updateStatus(id, 'approved');
    logger.info('PUT /api/users/:id/approve', `User approved: ${id}`);
    res.json(transformRow(user));
  } catch (error) {
    logger.error('PUT /api/users/:id/approve', `Error approving user ${req.params.id}: ${error.message}`, error);
    res.status(500).json({ error: error.message });
  }
}

async function rejectUser(req, res) {
  try {
    const { id } = req.params;
    logger.info('PUT /api/users/:id/reject', `Rejecting user: ${id}`);
    const user = await userModel.updateStatus(id, 'rejected');
    logger.info('PUT /api/users/:id/reject', `User rejected: ${id}`);
    res.json(transformRow(user));
  } catch (error) {
    logger.error('PUT /api/users/:id/reject', `Error rejecting user ${req.params.id}: ${error.message}`, error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getUsers, approveUser, rejectUser };

