// Semua operasi dibungkus try/catch: jika Redis mati, aplikasi fallback ke DB.
class RedisCache {
  constructor(client) {
    this.client = client;
  }

  async get(code) {
    try {
      const raw = await this.client.get(`link:${code}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async set(code, value, ttlSeconds) {
    if (ttlSeconds <= 0) return;
    try {
      await this.client.set(`link:${code}`, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      /* abaikan */
    }
  }

  async del(code) {
    try {
      await this.client.del(`link:${code}`);
    } catch {
      /* abaikan */
    }
  }
}

module.exports = { RedisCache };
