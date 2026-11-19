import * as dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().allow('').optional(),
  DB_DATABASE: Joi.string().required(),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:4200')
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const env = {
    nodeEnv: envVars.NODE_ENV,
    isDev: envVars.NODE_ENV === 'development',
    port: envVars.PORT,
    db: {
        host: envVars.DB_HOST,
        port: envVars.DB_PORT,
        username: envVars.DB_USERNAME,
        password: envVars.DB_PASSWORD,
        database: envVars.DB_DATABASE,
    },
    frontendUrl: envVars.FRONTEND_URL,
};