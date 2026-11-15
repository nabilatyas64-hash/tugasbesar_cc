const { AppError } = require('../errors');
const { isValidAlias, isValidUrl } = require('../utils/validators');
const { generateCode } = require('../utils/codegen');

class LinkService {
  constructor({ repo, cache, now = () => new Date(), cacheTtl = 3600 }) {
    this.repo = repo;
    this.cache = cache;
    this.now = now;
    this.cacheTtl = cacheTtl;
  }

  authenticate(apiKey) {
    if (!apiKey) return null;
    return this.repo.findUserByApiKey(apiKey);
  }

  async createLink({ ownerId, url, alias, expiresAt }) {
    if (!isValidUrl(url)) throw new AppError(400, 'URL tujuan harus valid dan berskema http/https');

    let expires = null;
    if (expiresAt !== undefined && expiresAt !== null) {
      expires = new Date(expiresAt);
      if (Number.isNaN(expires.getTime())) throw new AppError(400, 'expires_at tidak valid');
      if (expires <= this.now()) throw new AppError(400, 'expires_at harus di masa depan');
    }

    const base = { original_url: url, owner_id: ownerId, expires_at: expires };

    if (alias !== undefined && alias !== null && alias !== '') {
      if (!isValidAlias(alias)) {
        throw new AppError(400, 'Alias hanya boleh huruf, angka, tanda hubung (3-30 karakter)');
      }
      try {
        return await this.repo.create({ ...base, code: alias });
      } catch (e) {
        if (e.code === 'DUPLICATE') throw new AppError(409, 'Alias sudah dipakai');
        throw e;
      }
    }

    // Kode acak 6 karakter: ulangi jika bentrok
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.repo.create({ ...base, code: generateCode(6) });
      } catch (e) {
        if (e.code !== 'DUPLICATE') throw e;
      }
    }
    throw new AppError(500, 'Gagal membuat kode unik');
  }

  listLinks(ownerId) {
    return this.repo.listByOwner(ownerId);
  }

  async #ownedLink(ownerId, code) {
    const link = await this.repo.findByCode(code);
    // 404 (bukan 403) agar keberadaan link milik orang lain tidak terbongkar
    if (!link || link.owner_id !== ownerId) throw new AppError(404, 'Link tidak ditemukan');
    return link;
  }

  async deactivate(ownerId, code) {
    const link = await this.#ownedLink(ownerId, code);
    await this.repo.deactivate(link.id);
    await this.cache.del(code); // WAJIB: kalau tidak, link nonaktif masih redirect dari cache
    return { ...link, is_active: false };
  }

  async getStats(ownerId, code) {
    const link = await this.#ownedLink(ownerId, code);
    const daily = await this.repo.getStats(link.id);
    return { code, total: daily.reduce((sum, d) => sum + d.count, 0), daily };
  }

  // Dipakai GET /:code. Mengembalikan URL tujuan, atau melempar 404/410.
  async resolve(code) {
    const cached = await this.cache.get(code);
    if (cached) {
      if (cached.expiresAt && new Date(cached.expiresAt) <= this.now()) {
        throw new AppError(410, 'Link sudah kedaluwarsa');
      }
      await this.#recordClick(cached.id);
      return cached.url;
    }

    const link = await this.repo.findByCode(code);
    if (!link) throw new AppError(404, 'Link tidak ditemukan');
    if (!link.is_active) throw new AppError(410, 'Link sudah dinonaktifkan');
    if (link.expires_at && new Date(link.expires_at) <= this.now()) {
      throw new AppError(410, 'Link sudah kedaluwarsa');
    }

    let ttl = this.cacheTtl;
    if (link.expires_at) {
      const remaining = Math.floor((new Date(link.expires_at) - this.now()) / 1000);
      ttl = Math.min(ttl, remaining);
    }
    await this.cache.set(
      code,
      { id: link.id, url: link.original_url, expiresAt: link.expires_at ? new Date(link.expires_at).toISOString() : null },
      ttl
    );

    await this.#recordClick(link.id);
    return link.original_url;
  }

  async #recordClick(linkId) {
    try {
      await this.repo.incrementClick(linkId, this.now().toISOString().slice(0, 10));
    } catch (e) {
      console.error('Gagal mencatat klik:', e.message); // redirect tidak boleh gagal karena statistik
    }
  }
}

module.exports = { LinkService };
