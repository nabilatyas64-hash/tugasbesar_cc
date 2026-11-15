const buildTestApp = require('./helpers/buildTestApp');

const KEY = { 'X-API-Key': 'key-budi' };
const KEY2 = { 'X-API-Key': 'key-siti' };

describe('GET /health', () => {
  test('200 dan status database up', async () => {
    const { api } = buildTestApp();
    const res = await api.get('/health');
    expect(res.status).toBe(200);
    expect(res.body.database).toBe('up');
  });
  test('503 jika database mati (smoke test harus gagal)', async () => {
    const { api } = buildTestApp({ dbUp: false });
    expect((await api.get('/health')).status).toBe(503);
  });
});

describe('Aturan bisnis: pembuatan link', () => {
  test('alias valid diterima', async () => {
    const { api } = buildTestApp();
    const res = await api.post('/api/links').set(KEY).send({ url: 'https://toko.id', alias: 'promo-2026' });
    expect(res.status).toBe(201);
    expect(res.body.code).toBe('promo-2026');
  });

  test('alias berisi simbol/spasi ditolak 400', async () => {
    const { api } = buildTestApp();
    for (const alias of ['promo!', 'a b']) {
      const res = await api.post('/api/links').set(KEY).send({ url: 'https://toko.id', alias });
      expect(res.status).toBe(400);
    }
  });

  test('alias duplikat ditolak 409', async () => {
    const { api } = buildTestApp();
    await api.post('/api/links').set(KEY).send({ url: 'https://a.com', alias: 'sama' });
    const res = await api.post('/api/links').set(KEY2).send({ url: 'https://b.com', alias: 'sama' });
    expect(res.status).toBe(409);
  });

  test('URL non-http/https ditolak 400', async () => {
    const { api } = buildTestApp();
    for (const url of ['ftp://a.com', 'javascript:alert(1)', 'abc']) {
      const res = await api.post('/api/links').set(KEY).send({ url });
      expect(res.status).toBe(400);
    }
  });

  test('tanpa alias menghasilkan kode acak 6 karakter', async () => {
    const { api } = buildTestApp();
    const res = await api.post('/api/links').set(KEY).send({ url: 'https://toko.id' });
    expect(res.status).toBe(201);
    expect(res.body.code).toHaveLength(6);
  });

  test('tanpa API key ditolak 401', async () => {
    const { api } = buildTestApp();
    expect((await api.post('/api/links').send({ url: 'https://a.com' })).status).toBe(401);
  });
});

describe('Aturan bisnis: redirect', () => {
  test('link aktif -> 302 dengan header Location benar', async () => {
    const { api } = buildTestApp();
    await api.post('/api/links').set(KEY).send({ url: 'https://toko.id/katalog', alias: 'katalog' });
    const res = await api.get('/katalog');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('https://toko.id/katalog');
  });

  test('link dinonaktifkan -> 410, termasuk saat sudah ada di cache', async () => {
    const { api } = buildTestApp();
    await api.post('/api/links').set(KEY).send({ url: 'https://toko.id', alias: 'cache-uji' });
    expect((await api.get('/cache-uji')).status).toBe(302); // memanaskan cache
    await api.patch('/api/links/cache-uji/deactivate').set(KEY).expect(200);
    expect((await api.get('/cache-uji')).status).toBe(410);
  });

  test('link melewati expires_at -> 410', async () => {
    const { api, clock } = buildTestApp();
    await api.post('/api/links').set(KEY)
      .send({ url: 'https://toko.id', alias: 'flash', expires_at: '2026-01-02T00:00:00Z' });
    expect((await api.get('/flash')).status).toBe(302);
    clock.time = new Date('2026-01-03T00:00:00Z');
    expect((await api.get('/flash')).status).toBe(410);
  });

  test('kode tidak dikenal -> 404', async () => {
    const { api } = buildTestApp();
    expect((await api.get('/tidak-ada')).status).toBe(404);
  });

  test('redirect kedua dilayani dari cache (DB hanya dibaca sekali)', async () => {
    const { api, repo } = buildTestApp();
    await api.post('/api/links').set(KEY).send({ url: 'https://toko.id', alias: 'hemat' });
    repo.calls.findByCode = 0;
    await api.get('/hemat');
    await api.get('/hemat');
    expect(repo.calls.findByCode).toBe(1);
  });
});

describe('Statistik & kepemilikan', () => {
  test('klik tercatat per hari', async () => {
    const { api } = buildTestApp();
    await api.post('/api/links').set(KEY).send({ url: 'https://toko.id', alias: 'statistik' });
    await api.get('/statistik');
    await api.get('/statistik');
    const res = await api.get('/api/links/statistik/stats').set(KEY);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.daily).toEqual([{ date: '2026-01-01', count: 2 }]);
  });

  test('daftar link hanya milik user sendiri', async () => {
    const { api } = buildTestApp();
    await api.post('/api/links').set(KEY).send({ url: 'https://a.com', alias: 'milik-budi' });
    await api.post('/api/links').set(KEY2).send({ url: 'https://b.com', alias: 'milik-siti' });
    const res = await api.get('/api/links').set(KEY);
    expect(res.body.map((l) => l.code)).toEqual(['milik-budi']);
  });

  test('user lain tidak bisa menonaktifkan link orang lain (404)', async () => {
    const { api } = buildTestApp();
    await api.post('/api/links').set(KEY).send({ url: 'https://a.com', alias: 'privat' });
    expect((await api.patch('/api/links/privat/deactivate').set(KEY2)).status).toBe(404);
  });
});
