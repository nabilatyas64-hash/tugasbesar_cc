// Mode dev: tanpa MySQL/Redis. Data disimpan di memori dan hilang saat server mati.
// Jalankan: npm run dev
const { createApp } = require('./app');
const { LinkService } = require('./services/linkService');
const { MemoryRepository, MemoryCache } = require('./repositories/memoryLinkRepository');

const repo = new MemoryRepository();
repo.users[0].api_key = 'demo-key-budi';
repo.users[1].api_key = 'demo-key-siti';

const service = new LinkService({ repo, cache: new MemoryCache() });

(async () => {
  // data demo, sama seperti seeds/01_demo.js
  await repo.create({ code: 'demo01', original_url: 'https://example.com/katalog', owner_id: 1, expires_at: null });
  const off = await repo.create({ code: 'demo410', original_url: 'https://example.com/lama', owner_id: 1, expires_at: null });
  await repo.deactivate(off.id);

  const healthCheck = async () => ({ database: 'up', redis: 'up', mode: 'in-memory' });

  const port = Number(process.env.PORT || 8000);
  createApp({ service, healthCheck }).listen(port, () => {
    console.log(`Pendekin (MODE DEV in-memory) di http://localhost:${port}`);
    console.log('API key: demo-key-budi | demo-key-siti');
  });
})();
