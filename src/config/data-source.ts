import { DataSource } from 'typeorm';
import { env } from '../env';
import { User } from '../entities/User';
import path from 'path';

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: env.db.host,
    port: env.db.port,
    username: env.db.username,
    password: env.db.password,
    database: env.db.database,
    entities: [User],
    synchronize: true,
    migrations: [path.join(__dirname, '../migrations/*.{ts,js}')],
    logging: env.isDev ? ['error', 'warn'] : ['error'],
    extra: {
        connectionLimit: 10,
    },
});