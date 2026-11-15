const request = require('supertest');
const { createApp } = require('../../src/app');
const { LinkService } = require('../../src/services/linkService');
const { MemoryRepository, MemoryCache } = require('../../src/repositories/memoryLinkRepository');

module.exports = function buildTestApp({ dbUp = true } = {}) {
  const repo = new MemoryRepository();
  const cache = new MemoryCache();
  const clock = { time: new Date('2026-01-01T00:00:00Z') };
  const service = new LinkService({ repo, cache, now: () => new Date(clock.time) });
  const healthCheck = async () => ({ database: dbUp ? 'up' : 'down', redis: 'up' });
  const app = createApp({ service, healthCheck });
  return { api: request(app), repo, cache, clock };
};
