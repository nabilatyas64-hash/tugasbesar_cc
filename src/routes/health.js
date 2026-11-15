module.exports = (healthCheck) => async (req, res) => {
  const status = await healthCheck();
  // DB wajib hidup; Redis hanya dilaporkan (aplikasi tetap jalan tanpa cache)
  res.status(status.database === 'up' ? 200 : 503).json({
    status: status.database === 'up' ? 'ok' : 'degraded',
    ...status,
  });
};
