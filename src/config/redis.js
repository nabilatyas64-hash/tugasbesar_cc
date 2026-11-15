const Redis = require('ioredis');

const client = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT || 6379),
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
});
client.on('error', () => {}); // status dilaporkan lewat /health

module.exports = client;
