import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

config({ path: '.env.local' }); // O .env si usas ese

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);