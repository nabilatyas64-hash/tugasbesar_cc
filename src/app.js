const express = require('express');
const { AppError } = require('./errors');
const healthRoute = require('./routes/health');
const linksRouter = require('./routes/links');
const auth = require('./middleware/auth');

// App dibuat lewat factory supaya mudah dites (tanpa DB/Redis sungguhan).
function createApp({ service, healthCheck }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());

  // URUTAN PENTING: /health dan /api harus sebelum /:code
  app.get('/health', healthRoute(healthCheck));
  app.use('/api/links', auth(service), linksRouter(service));

  app.get('/:code([A-Za-z0-9-]+)', async (req, res, next) => {
    try {
      const url = await service.resolve(req.params.code);
      res.redirect(302, url);
    } catch (e) {
      next(e);
    }
  });

  app.use((req, res) => res.status(404).json({ error: 'Tidak ditemukan' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err instanceof AppError) return res.status(err.status).json({ error: err.message });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON tidak valid' });
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan server' });
  });

  return app;
}

module.exports = { createApp };
