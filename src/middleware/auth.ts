import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthService } from '../services/authService';
import { UnauthorizedError } from '../utils/errors';

export const authenticate: RequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.log('AUTHENTICATE MIDDLEWARE REACHED');

    const authHeader = req.headers.authorization;

    // Check if token is provided
    if (!authHeader) {
        next(new UnauthorizedError('No token provided'));
        return;
    }

    // Check Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
        next(new UnauthorizedError('Invalid authorization header'));
        return;
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
        next(new UnauthorizedError('No token provided'));
        return;
    }

    // Verify token and check user account
    AuthService.getUserFromToken(token)
        .then(() => next())
        .catch((error: unknown) => next(error));
};