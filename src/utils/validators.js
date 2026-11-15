// Fungsi murni: dites tanpa database.
const ALIAS_RE = /^[A-Za-z0-9-]+$/;
const RESERVED = ['api', 'health'];

function isValidAlias(alias) {
  return (
    typeof alias === 'string' &&
    alias.length >= 3 &&
    alias.length <= 30 &&
    ALIAS_RE.test(alias) &&
    !RESERVED.includes(alias.toLowerCase())
  );
}

function isValidUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const u = new URL(value);
    return ['http:', 'https:'].includes(u.protocol) && Boolean(u.hostname);
  } catch {
    return false;
  }
}

module.exports = { isValidAlias, isValidUrl };
