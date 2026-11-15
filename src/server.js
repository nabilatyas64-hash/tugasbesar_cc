require('dotenv').config();
const { createApp } = require('./app');
const db = require('./config/db');
const redis = require('./config/redis');
const { KnexLinkRepository } = require('./repositories/knexLinkRepository');
const { RedisCache } = require('./cache/redisCache');
const { LinkService } = require('./services/linkService');

const service = new LinkService({
  repo: new KnexLinkRepository(db),
  cache: new RedisCache(redis),
  cacheTtl: Number(process.env.CACHE_TTL_SECONDS || 3600),
});

async function healthCheck() {
  const result = { database: 'down', redis: 'down' };
  try { await db.raw('select 1'); result.database = 'up'; } catch { /* down */ }
  try { await redis.ping(); result.redis = 'up'; } catch { /* down */ }
  return result;
}

const port = Number(process.env.PORT || 8000);
const server = createApp({ service, healthCheck }).listen(port, () => {
  console.log(`Pendekin berjalan di port ${port}`);
});

const shutdown = () => server.close(async () => { await db.destroy(); redis.disconnect(); process.exit(0); });
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
