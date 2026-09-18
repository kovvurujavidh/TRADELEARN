// Database Abstraction Layer for TradeLearn
// Supports SQLite (Default - Zero setup) & PostgreSQL (via DATABASE_URL)

const path = require('path');
const fs = require('fs');

let db = null;
let isPostgres = false;

const DATABASE_URL = process.env.DATABASE_URL;

if (DATABASE_URL && (DATABASE_URL.startsWith('postgres://') || DATABASE_URL.startsWith('postgresql://'))) {
  isPostgres = true;
  const { Pool } = require('pg');
  db = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  console.log('📦 Connected to PostgreSQL Database');
} else {
  // Use SQLite
  const sqlite3 = require('sqlite3').verbose();
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch (e) {}
  }
  const dbPath = path.join(dataDir, 'trades.db');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Failed to connect to SQLite database:', err.message);
    } else {
      console.log('📦 Connected to SQLite Database at ' + dbPath);
    }
  });
}

// Promisified Database Helpers
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      // Convert ? placeholders to $1, $2, ... for PostgreSQL
      let pIndex = 1;
      const pgSql = sql.replace(/\?/g, () => '$' + (pIndex++));
      db.query(pgSql, params, (err, res) => {
        if (err) return reject(err);
        resolve({ lastID: null, changes: res.rowCount });
      });
    } else {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    }
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      let pIndex = 1;
      const pgSql = sql.replace(/\?/g, () => '$' + (pIndex++));
      db.query(pgSql, params, (err, res) => {
        if (err) return reject(err);
        resolve(res.rows[0] || null);
      });
    } else {
      db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    }
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      let pIndex = 1;
      const pgSql = sql.replace(/\?/g, () => '$' + (pIndex++));
      db.query(pgSql, params, (err, res) => {
        if (err) return reject(err);
        resolve(res.rows || []);
      });
    } else {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    }
  });
}

// Initialize tables if they do not exist
async function initDb() {
  const createTradesTable = `
    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      bias TEXT,
      liquidity TEXT,
      sweep TEXT,
      mss TEXT,
      displacement TEXT,
      entry TEXT,
      sl TEXT,
      tp TEXT,
      result TEXT,
      description TEXT,
      photos TEXT,
      created_at BIGINT
    );
  `;

  const createLearnsTable = `
    CREATE TABLE IF NOT EXISTS learns (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      category TEXT,
      title TEXT,
      description TEXT,
      rules TEXT,
      photos TEXT,
      created_at BIGINT
    );
  `;

  const createStrategiesTable = `
    CREATE TABLE IF NOT EXISTS strategies (
      id TEXT PRIMARY KEY,
      title TEXT,
      content TEXT,
      date TEXT,
      created_at BIGINT
    );
  `;

  try {
    await run(createTradesTable);
    await run(createLearnsTable);
    await run(createStrategiesTable);
    console.log('✅ Database schema initialized successfully');
  } catch (err) {
    console.error('❌ Error initializing database schema:', err);
  }
}

module.exports = {
  db,
  isPostgres,
  run,
  get,
  all,
  initDb
};
