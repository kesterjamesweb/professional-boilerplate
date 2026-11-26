import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { UnauthorizedError } from '../utils/errors';
import { config } from '../env';
import { createLogger } from '../utils/logger';

const logger = createLogger('AuthService');

// Get repository when needed
const getUserRepository = () => AppDataSource.getRepository(User);

// Login input
interface LoginInput {
    email: string;
    password: string;
}

// JWT payload
interface TokenPayload extends JwtPayload {
    userId: number;
    email: string;
}

// Authentication response
interface AuthResponse {
    token: string;
    user: {
        id: number;
        email: string;
        name: string;
    };
}

export class AuthService {

    /**
     * Login user and generate JWT token
     */
    static async login(input: LoginInput): Promise<AuthResponse> {
        const { email, password } = input;

        const userRepository = getUserRepository();

        // 1. Find user by email
        // Explicitly include password because User entity has select: false
        const user = await userRepository
            .createQueryBuilder('user')
            .select([
                'user.id',
                'user.email',
                'user.name',
                'user.isActive',
                'user.isVerified',
            ])
            .addSelect('user.password')
            .where('user.email = :email', { email })
            .getOne();

        if (!user) {
            logger.warn('Login attempt with non-existent email', { email });
            throw new UnauthorizedError('Invalid email or password');
        }

        // Check if email is verified
        if (!user.isVerified) {
            logger.warn('Login attempt for unverified account', { email });
            throw new UnauthorizedError(
                'Please verify your email address before logging in. Check your inbox for the verification link.'
            );
        }

        // 2. Check account status
        if (!user.isActive) {
            logger.warn('Login attempt for inactive account', { email });
            throw new UnauthorizedError('Account is deactivated');
        }

        // 3. Verify password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            logger.warn('Login attempt with wrong password', { email });
            throw new UnauthorizedError('Invalid email or password');
        }

        // 4. Generate JWT token
        const tokenPayload: TokenPayload = {
            userId: user.id,
            email: user.email,
        };

        const token = jwt.sign(
            tokenPayload,
            config.jwt.secret,
            {
                expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
            }
        );

        logger.info('User logged in successfully', {
            userId: user.id,
            email,
        });

        // 5. Return token and user information
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        };
    }

    /**
     * Verify JWT token and return decoded payload
     */
    static async verifyToken(token: string): Promise<TokenPayload> {
        try {
            const decoded = jwt.verify(
                token,
                config.jwt.secret
            );

            if (
                typeof decoded === 'string' ||
                typeof decoded.userId !== 'number' ||
                typeof decoded.email !== 'string'
            ) {
                throw new UnauthorizedError('Invalid token payload');
            }

            return {
                userId: decoded.userId,
                email: decoded.email,
            };

        } catch (error: unknown) {

            if (error instanceof UnauthorizedError) {
                throw error;
            }

            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedError('Token has expired');
            }

            if (error instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedError('Invalid token');
            }

            throw new UnauthorizedError('Authentication failed');
        }
    }

    /**
     * Get authenticated user from JWT token
     */
    static async getUserFromToken(token: string): Promise<User> {
        const decoded = await this.verifyToken(token);

        const userRepository = getUserRepository();

        // 1. Find user using JWT payload
        const user = await userRepository
            .createQueryBuilder('user')
            .select([
                'user.id',
                'user.email',
                'user.name',
                'user.isActive',
                'user.createdAt',
            ])
            .where('user.id = :id', { id: decoded.userId })
            .getOne();

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        // 2. Check account status
        if (!user.isActive) {
            throw new UnauthorizedError('Account is deactivated');
        }

        return user;
    }
}