const authService = require('../services/authService');

// POST /api/auth/register
async function register(req, res) {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ user, token });
}

// POST /api/auth/login
async function login(req, res) {
  const { user, token } = await authService.login(req.body);
  res.json({ user, token });
}

module.exports = { register, login };
