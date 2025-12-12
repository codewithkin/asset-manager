const assetModel = require('../models/asset');
const { transformRows, transformRow } = require('../utils/transform');
const logger = require('../utils/logger');

async function getAssets(req, res) {
  try {
    const userId = req.user.role === 'user' ? req.user.id : null;
    logger.info('GET /api/assets', `Fetching assets for org: ${req.user.organizationId}${userId ? `, user: ${userId}` : ''}`);
    const assets = await assetModel.findAll(
      req.user.organizationId,
      userId
    );
    logger.info('GET /api/assets', `Retrieved ${assets.length} assets`);
    res.json(transformRows(assets));
  } catch (error) {
    logger.error('GET /api/assets', `Error fetching assets: ${error.message}`, error);
    res.status(500).json({ error: error.message });
  }
}

async function createAsset(req, res) {
  try {
    logger.info('POST /api/assets', `Creating asset by user: ${req.user.id}, name: ${req.body.name}`);
    const asset = await assetModel.create({
      ...req.body,
      createdBy: req.user.id,
      organizationId: req.user.organizationId,
    });
    logger.info('POST /api/assets', `Asset created: ${asset.id}`);
    res.status(201).json(transformRow(asset));
  } catch (error) {
    logger.error('POST /api/assets', `Error creating asset: ${error.message}`, error);
    res.status(500).json({ error: error.message });
  }
}

async function updateAsset(req, res) {
  try {
    logger.info('PUT /api/assets/:id', `Updating asset: ${req.params.id}`);
    const asset = await assetModel.update(req.params.id, req.body);
    logger.info('PUT /api/assets/:id', `Asset updated: ${req.params.id}`);
    res.json(transformRow(asset));
  } catch (error) {
    logger.error('PUT /api/assets/:id', `Error updating asset ${req.params.id}: ${error.message}`, error);
    res.status(500).json({ error: error.message });
  }
}

async function deleteAsset(req, res) {
  try {
    logger.info('DELETE /api/assets/:id', `Deleting asset: ${req.params.id}`);
    await assetModel.remove(req.params.id);
    logger.info('DELETE /api/assets/:id', `Asset deleted: ${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    logger.error('DELETE /api/assets/:id', `Error deleting asset ${req.params.id}: ${error.message}`, error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getAssets, createAsset, updateAsset, deleteAsset };

