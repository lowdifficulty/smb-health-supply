const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function usePostgres() {
  return !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

function getSql() {
  if (!usePostgres()) return null;
  const { neon } = require("@neondatabase/serverless");
  return neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);
}

let schemaReady = false;

async function ensureSchema() {
  if (!usePostgres() || schemaReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      organization TEXT,
      role TEXT NOT NULL DEFAULT 'md',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'md'`;
  await sql`
    CREATE TABLE IF NOT EXISTS onboarding_progress (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      completed_items JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  schemaReady = true;
}

function readJsonDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], progress: {} }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}

function writeJsonDb(db) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

async function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  if (usePostgres()) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`SELECT * FROM users WHERE email = ${normalized} LIMIT 1`;
    return rows[0] || null;
  }
  const db = readJsonDb();
  return db.users.find(function (u) { return u.email === normalized; }) || null;
}

async function findUserById(id) {
  if (usePostgres()) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`SELECT id, email, name, organization, role, created_at FROM users WHERE id = ${id} LIMIT 1`;
    return rows[0] || null;
  }
  const db = readJsonDb();
  const user = db.users.find(function (u) { return u.id === id; });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    organization: user.organization,
    role: user.role || "md",
    created_at: user.created_at
  };
}

async function createUser({ email, passwordHash, name, organization, role }) {
  if (process.env.VERCEL && !usePostgres()) {
    throw new Error("DATABASE_URL is required in production.");
  }
  const normalized = email.trim().toLowerCase();
  const userRole = ["md", "do", "rn"].includes(role) ? role : "md";
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  if (usePostgres()) {
    await ensureSchema();
    const sql = getSql();
    await sql`
      INSERT INTO users (id, email, password_hash, name, organization, role)
      VALUES (${id}, ${normalized}, ${passwordHash}, ${name}, ${organization}, ${userRole})
    `;
    await sql`
      INSERT INTO onboarding_progress (user_id, completed_items)
      VALUES (${id}, ${JSON.stringify({})}::jsonb)
    `;
    return {
      id,
      email: normalized,
      name,
      organization,
      role: userRole,
      created_at: createdAt
    };
  }

  const db = readJsonDb();
  if (db.users.some(function (u) { return u.email === normalized; })) {
    throw new Error("EMAIL_EXISTS");
  }
  db.users.push({
    id,
    email: normalized,
    password_hash: passwordHash,
    name,
    organization,
    role: userRole,
    created_at: createdAt
  });
  db.progress[id] = {};
  writeJsonDb(db);
  return {
    id,
    email: normalized,
    name,
    organization,
    role: userRole,
    created_at: createdAt
  };
}

async function getProgress(userId) {
  if (usePostgres()) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`
      SELECT completed_items, updated_at
      FROM onboarding_progress
      WHERE user_id = ${userId}
      LIMIT 1
    `;
    if (!rows[0]) return { completedItems: {}, updatedAt: null };
    return {
      completedItems: rows[0].completed_items || {},
      updatedAt: rows[0].updated_at
    };
  }
  const db = readJsonDb();
  return {
    completedItems: db.progress[userId] || {},
    updatedAt: null
  };
}

async function saveProgress(userId, completedItems) {
  const payload = completedItems || {};
  if (usePostgres()) {
    await ensureSchema();
    const sql = getSql();
    await sql`
      INSERT INTO onboarding_progress (user_id, completed_items, updated_at)
      VALUES (${userId}, ${JSON.stringify(payload)}::jsonb, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET completed_items = EXCLUDED.completed_items, updated_at = NOW()
    `;
    return payload;
  }
  const db = readJsonDb();
  db.progress[userId] = payload;
  writeJsonDb(db);
  return payload;
}

async function getUserWithPassword(email) {
  const normalized = email.trim().toLowerCase();
  if (usePostgres()) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`SELECT * FROM users WHERE email = ${normalized} LIMIT 1`;
    return rows[0] || null;
  }
  const db = readJsonDb();
  return db.users.find(function (u) { return u.email === normalized; }) || null;
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  getProgress,
  saveProgress,
  getUserWithPassword,
  usePostgres
};
