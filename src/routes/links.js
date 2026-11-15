const express = require('express');

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = (service) => {
  const router = express.Router();

  const dto = (req, l) => ({
    code: l.code,
    short_url: `${(process.env.BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '')}/${l.code}`,
    original_url: l.original_url,
    is_active: l.is_active,
    expires_at: l.expires_at ? new Date(l.expires_at).toISOString() : null,
  });

  router.post('/', wrap(async (req, res) => {
    const { url, alias, expires_at } = req.body || {};
    const link = await service.createLink({ ownerId: req.user.id, url, alias, expiresAt: expires_at });
    res.status(201).json(dto(req, link));
  }));

  router.get('/', wrap(async (req, res) => {
    const links = await service.listLinks(req.user.id);
    res.json(links.map((l) => dto(req, l)));
  }));

  router.get('/:code/stats', wrap(async (req, res) => {
    res.json(await service.getStats(req.user.id, req.params.code));
  }));

  router.patch('/:code/deactivate', wrap(async (req, res) => {
    res.json(dto(req, await service.deactivate(req.user.id, req.params.code)));
  }));

  return router;
};
