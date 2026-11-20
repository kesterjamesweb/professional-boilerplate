
import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { loginSchema } from '../dto/auth.dto';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth';

export const authRoutes = Router();

// POST /api/auth/login - Public endpoint
authRoutes.post(
    '/login',
    validate(loginSchema),
    asyncHandler(AuthController.login)
);

// GET /api/auth/me - Protected endpoint
authRoutes.get(
    '/me',
    authenticate,
    asyncHandler(AuthController.getMe)
);
