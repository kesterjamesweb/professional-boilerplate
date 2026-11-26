import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3000),

  // Database config
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().default('root'),
  DB_USER: Joi.string().optional(),
  DB_PASSWORD: Joi.string().allow('').default(''),
  DB_DATABASE: Joi.string().default('boilerplate_db'),
  DB_NAME: Joi.string().optional(),

  // JWT config
  JWT_SECRET: Joi.string().default('your-secret-key'),
  JWT_EXPIRES_IN: Joi.string().default('1d'),

  // Email configuration
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  EMAIL_FROM: Joi.string().email().required(),
  FRONTEND_URL: Joi.string().default('http://localhost:4200'),
}).unknown();

const { error, value: env } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

export const config = {
  isDev: env.NODE_ENV === 'development',
  env: env.NODE_ENV as string,
  port: env.PORT as number,
  db: {
    host: env.DB_HOST as string,
    port: env.DB_PORT as number,
    username: (env.DB_USERNAME || env.DB_USER) as string,
    user: (env.DB_USERNAME || env.DB_USER) as string,
    password: env.DB_PASSWORD as string,
    database: (env.DB_DATABASE || env.DB_NAME) as string,
  },
  jwt: {
    secret: env.JWT_SECRET as string,
    expiresIn: env.JWT_EXPIRES_IN as string,
  },
  frontendUrl: env.FRONTEND_URL as string,
  email: {
    host: env.SMTP_HOST as string,
    port: env.SMTP_PORT as number,
    user: env.SMTP_USER as string,
    pass: env.SMTP_PASS as string,
    from: env.EMAIL_FROM as string,
  },
};