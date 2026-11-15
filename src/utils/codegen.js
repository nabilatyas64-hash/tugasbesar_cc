const { randomInt } = require('crypto');
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateCode(length = 6) {
  let out = '';
  for (let i = 0; i < length; i++) out += CHARS[randomInt(CHARS.length)];
  return out;
}

module.exports = { generateCode };
