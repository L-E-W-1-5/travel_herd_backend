import * as pg from 'pg'
const { Pool } = pg.default


import { neon } from "@neondatabase/serverless";




export const neonConnection = neon(process.env.NEON_DATABASE);

const databaseUrl = process.env.NEON_DATABASE;

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_URL,
});

export default function query(text, params) {
    return pool.query(text, params);
  }

