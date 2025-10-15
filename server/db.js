import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = process.env.DB_FILE || path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(dbFile);

// Apply schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = readFileSync(schemaPath, 'utf8');
db.exec(schema);

export default db;
