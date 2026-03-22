const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { authLimiter } = require('../../middlewares/rateLimit.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const controller = require('./auth.controller');
const { registerSchema, loginSchema, refreshSchema, updateProfileSchema } = require('./auth.validation');

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: John Doe }
 *               email: { type: string, example: john@example.com }
 *               password: { type: string, example: Password123 }
 *               currency: { type: string, example: USD }
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', authLimiter, validate(registerSchema), controller.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: john@example.com }
 *               password: { type: string, example: Password123 }
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', authLimiter, validate(loginSchema), controller.login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Tokens rotated successfully
 */
router.post('/refresh', authLimiter, validate(refreshSchema), controller.refresh);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get('/me', authenticate, controller.me);
router.put('/updateprofile', authenticate, validate(updateProfileSchema), controller.updateProfile);
router.post('/logout', authenticate, controller.logout);

router.get('/admin/users', authenticate, authorize('admin'), controller.adminUsers);

module.exports = router;
