// Idempotent: aman dijalankan berulang kali (tidak menghapus data).
exports.seed = async (knex) => {
  await knex('users')
    .insert([
      { name: 'Budi', api_key: 'demo-key-budi' },
      { name: 'Siti', api_key: 'demo-key-siti' },
    ])
    .onConflict('api_key')
    .ignore();

  const budi = await knex('users').where({ api_key: 'demo-key-budi' }).first();

  await knex('links')
    .insert([
      // dipakai Smoke Test: GET /demo01 harus 302
      { code: 'demo01', original_url: 'https://example.com/katalog', owner_id: budi.id, is_active: true },
      // untuk demo manual: GET /demo410 harus 410
      { code: 'demo410', original_url: 'https://example.com/lama', owner_id: budi.id, is_active: false },
    ])
    .onConflict('code')
    .ignore();
};
