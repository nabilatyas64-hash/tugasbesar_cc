const { AppError } = require('../errors');

module.exports = (service) => async (req, res, next) => {
  try {
    const user = await service.authenticate(req.get('X-API-Key'));
    if (!user) throw new AppError(401, 'X-API-Key tidak valid atau tidak ada');
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
};
