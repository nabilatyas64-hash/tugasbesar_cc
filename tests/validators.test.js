const { isValidAlias, isValidUrl } = require('../src/utils/validators');
const { generateCode } = require('../src/utils/codegen');

describe('Aturan bisnis: validasi alias', () => {
  test.each(['promo-2026', 'Katalog', 'abc', 'a-b-c'])('alias "%s" valid', (a) => {
    expect(isValidAlias(a)).toBe(true);
  });
  test.each(['promo!', 'a b', 'ab', 'kata_garis', 'toko/baru', '', null, 'api', 'health'])(
    'alias %p ditolak', (a) => {
      expect(isValidAlias(a)).toBe(false);
    });
});

describe('Aturan bisnis: validasi URL tujuan', () => {
  test.each(['http://a.com', 'https://toko.id/katalog?x=1'])('"%s" valid', (u) => {
    expect(isValidUrl(u)).toBe(true);
  });
  test.each(['ftp://a.com', 'javascript:alert(1)', 'abc', 'www.a.com', '', undefined])(
    '%p ditolak', (u) => {
      expect(isValidUrl(u)).toBe(false);
    });
});

test('generateCode menghasilkan 6 karakter alfanumerik yang lolos validasi alias', () => {
  const code = generateCode(6);
  expect(code).toHaveLength(6);
  expect(isValidAlias(code)).toBe(true);
});
