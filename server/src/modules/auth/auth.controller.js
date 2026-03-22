const asyncHandler = require('../../utils/asyncHandler');
const authService = require('./auth.service');

function setTokenCookies(res, accessToken, refreshToken) {
  const secure = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body, req);
  setTokenCookies(res, data.accessToken, data.refreshToken);
  res.status(201).json({ success: true, data: data.user, token: data.accessToken, accessToken: data.accessToken, refreshToken: data.refreshToken });
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body, req);
  setTokenCookies(res, data.accessToken, data.refreshToken);
  res.status(200).json({ success: true, data: data.user, token: data.accessToken, accessToken: data.accessToken, refreshToken: data.refreshToken });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies.refreshToken;
  const data = await authService.refresh(token, req);
  setTokenCookies(res, data.accessToken, data.refreshToken);
  res.status(200).json({ success: true, data: data.user, token: data.accessToken, accessToken: data.accessToken, refreshToken: data.refreshToken });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.user._id);
  res.status(200).json({ success: true, data: user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  res.status(200).json({ success: true, data: user });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies.refreshToken;
  await authService.logout(token, req.user?._id);
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

const adminUsers = asyncHandler(async (req, res) => {
  const users = await authService.adminListUsers();
  res.status(200).json({ success: true, count: users.length, data: users });
});

module.exports = {
  register,
  login,
  refresh,
  me,
  updateProfile,
  logout,
  adminUsers,
};
