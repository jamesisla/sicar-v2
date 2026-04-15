import { DataSource } from 'typeorm';
import { ALL_ENTITIES } from './database.module';
import * as dotenv from 'dotenv';
dotenv.config();

export default new DataSource({
  type: (process.env.DB_TYPE as any) || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'sicar',
  password: process.env.DB_PASSWORD || 'sicar123',
  database: process.env.DB_NAME || 'sicar_v2',
  entities: ALL_ENTITIES,
  migrations: ['src/common/database/migrations/*.ts'],
  synchronize: false,
});
