
import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

import {
    createUserSchema,
    updateUserSchema,
    idParamSchema,
    paginationQuerySchema
} from '../dto/user.dto';

import { asyncHandler } from '../utils/asyncHandler';

export const userRoutes = Router();

// GET ALL USERS - Protected route
userRoutes.get(
    '/',
    authenticate,
    validate(paginationQuerySchema, 'query'),
    asyncHandler(UserController.getAll)
);

// GET USER BY ID
userRoutes.get(
    '/:id',
    authenticate,
    validate(idParamSchema, 'params'),
    asyncHandler(UserController.getById)
);

// CREATE USER - Protected route
userRoutes.post(
    '/',
    authenticate,
    validate(createUserSchema),
    asyncHandler(UserController.create)
);

// UPDATE USER - Protected route
userRoutes.put(
    '/:id',
    authenticate,
    validate(idParamSchema, 'params'),
    validate(updateUserSchema),
    asyncHandler(UserController.update)
);

// DELETE USER - Protected route
userRoutes.delete(
    '/:id',
    authenticate,
    validate(idParamSchema, 'params'),
    asyncHandler(UserController.delete)
);
