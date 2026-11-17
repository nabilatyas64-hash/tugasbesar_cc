const toLink = (row) =>
  row && {
    id: row.id,
    code: row.code,
    original_url: row.original_url,
    owner_id: row.owner_id,
    is_active: Boolean(row.is_active),
    expires_at: row.expires_at ? new Date(row.expires_at) : null,
    created_at: row.created_at,
  };

class KnexLinkRepository {
  constructor(db) {
    this.db = db;
  }

  async createUser(user) {
    await this.db('users').insert(user);
  }

  findUserByApiKey(apiKey) {
    return this.db('users').where({ api_key: apiKey }).first();
  }

  async findByCode(code) {
    return toLink(await this.db('links').where({ code }).first());
  }

  async create(data) {
    try {
      const [id] = await this.db('links').insert(data);
      return toLink(await this.db('links').where({ id }).first());
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        const err = new Error('duplicate code');
        err.code = 'DUPLICATE';
        throw err;
      }
      throw e;
    }
  }

  async listByOwner(ownerId) {
    const rows = await this.db('links').where({ owner_id: ownerId }).orderBy('id', 'desc');
    return rows.map(toLink);
  }

  deactivate(id) {
    return this.db('links').where({ id }).update({ is_active: false });
  }

  // Upsert atomik: aman untuk klik bersamaan (sintaks khusus MySQL)
  incrementClick(linkId, date) {
    return this.db.raw(
      'INSERT INTO click_stats (link_id, `date`, `count`) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE `count` = `count` + 1',
      [linkId, date]
    );
  }

  async getStats(linkId) {
    const rows = await this.db('click_stats').where({ link_id: linkId }).orderBy('date', 'asc');
    return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
  }
}

module.exports = { KnexLinkRepository };
