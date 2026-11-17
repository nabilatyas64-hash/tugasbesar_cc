// Repository in-memory: dipakai test supaya tidak butuh MySQL/Redis.
class MemoryRepository {
  constructor() {
    this.users = [
      { id: 1, name: 'Budi', api_key: 'key-budi' },
      { id: 2, name: 'Siti', api_key: 'key-siti' },
    ];
    this.links = [];
    this.stats = new Map(); // "linkId|date" -> count
    this.calls = { findByCode: 0 };
  }

  async createUser(user) { this.users.push({ id: this.users.length + 1, ...user }); }

  async findUserByApiKey(key) { return this.users.find((u) => u.api_key === key) || null; }

  async findByCode(code) {
    this.calls.findByCode++;
    return this.links.find((l) => l.code === code) || null;
  }

  async create(data) {
    if (this.links.some((l) => l.code === data.code)) {
      const e = new Error('dup'); e.code = 'DUPLICATE'; throw e;
    }
    const link = { id: this.links.length + 1, is_active: true, ...data };
    this.links.push(link);
    return link;
  }

  async listByOwner(ownerId) { return this.links.filter((l) => l.owner_id === ownerId).reverse(); }

  async deactivate(id) { this.links.find((l) => l.id === id).is_active = false; }

  async incrementClick(linkId, date) {
    const k = `${linkId}|${date}`;
    this.stats.set(k, (this.stats.get(k) || 0) + 1);
  }

  async getStats(linkId) {
    return [...this.stats.entries()]
      .filter(([k]) => k.startsWith(`${linkId}|`))
      .map(([k, count]) => ({ date: k.split('|')[1], count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

class MemoryCache {
  constructor() { this.store = new Map(); }
  async get(code) { return this.store.get(code) || null; }
  async set(code, value) { this.store.set(code, value); }
  async del(code) { this.store.delete(code); }
}

module.exports = { MemoryRepository, MemoryCache };
