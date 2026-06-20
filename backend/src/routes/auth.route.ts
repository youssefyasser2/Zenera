/**
 * ────────────────────────────────────────────────────────────
 *  AUTH ROUTES 
 * ────────────────────────────────────────────────────────────
 */

import { Router } from 'express';
import { login, register, refreshToken, logout, deleteAccount } from '../controllers/auth_controller';
import { validateBody } from '../middlewares/validate.middleware';
import { requireAuth } from '../middlewares/auth.middleware';
import { loginSchema, registerSchema } from '../validation/validate_middleware';

const router = Router();

// ───────────────────────────────────────────────
// PUBLIC ROUTES
// ───────────────────────────────────────────────

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);

// ───────────────────────────────────────────────
// AUTHENTICATED ROUTES
// ───────────────────────────────────────────────

router.post('/refresh-token', refreshToken);
router.post('/logout', requireAuth, logout);
router.delete('/delete-account', requireAuth, deleteAccount);

export default router;