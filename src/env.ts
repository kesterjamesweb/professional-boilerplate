
import * as dotenv from 'dotenv';
import Joi from 'joi';

// Load environment variables
dotenv.config();

// Environment variable validation schema
const envSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('development', 'production', 'test')
        .default('development'),

    PORT: Joi.number()
        .default(3000),

    // Database configuration
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(3306),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),

    // Frontend configuration
    FRONTEND_URL: Joi.string()
        .uri()
        .default('http://localhost:4200'),

    // JWT configuration
    JWT_SECRET: Joi.string()
        .min(32)
        .required(),

    JWT_EXPIRES_IN: Joi.string()
        .default('24h'),

}).unknown(true);

// Validate environment variables
const { value: env, error } = envSchema.validate(process.env, {
    abortEarly: false,
    errors: {
        label: 'key',
    },
});

if (error) {
    throw new Error(
        `Environment validation error: ${error.message}`
    );
}

// Export application configuration
export const config = {
    env: env.NODE_ENV,
    isDev: env.NODE_ENV === 'development',
    isProd: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',

    port: env.PORT,

    // Database settings
    db: {
        host: env.DB_HOST,
        port: env.DB_PORT,
        username: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        database: env.DB_DATABASE,
    },

    // Frontend settings
    frontendUrl: env.FRONTEND_URL,

    // JWT settings
    jwt: {
        secret: env.JWT_SECRET,
        expiresIn: env.JWT_EXPIRES_IN,
    },
};
