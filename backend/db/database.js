/**
 * REadON Database Layer
 * Uses Node.js 22/24 built-in node:sqlite with synchronous ACID transactions.
 * PRD §16.3 Database Entities
 */

let DatabaseSync;
try {
  const sqliteModule = require('node:sqlite');
  DatabaseSync = sqliteModule.DatabaseSync;
} catch (err) {
  if (err.code === 'ERR_UNKNOWN_BUILTIN_MODULE') {
    console.error(`
========================================================================
❌ ERROR: In Node 22, 'node:sqlite' requires the '--experimental-sqlite' flag!
👉 Start command: node --experimental-sqlite server.js
👉 Or set env variable: NODE_OPTIONS="--experimental-sqlite"
========================================================================
`);
  }
  throw err;
}
const path = require('node:path');
const fs = require('node:fs');

const DB_PATH = process.env.DATABASE_FILE || path.join(__dirname, '..', '..', 'readon.sqlite');

let dbInstance = null;

function getDatabase() {
  if (dbInstance) return dbInstance;

  dbInstance = new DatabaseSync(DB_PATH);
  dbInstance.exec(`PRAGMA foreign_keys = ON;`);
  initSchema(dbInstance);
  return dbInstance;
}

function initSchema(db) {
  db.exec(`
    -- Users and Authentication (PRD §14.1 & RBAC Security)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
      experience_level TEXT DEFAULT 'College Student / Fresher',
      target_role_id TEXT DEFAULT 'fs_dev',
      preferred_language TEXT DEFAULT 'JavaScript / TypeScript',
      xp INTEGER DEFAULT 850,
      streak INTEGER DEFAULT 3,
      level INTEGER DEFAULT 2,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Active Auth Sessions
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at DATETIME NOT NULL
    );

    -- 7 Technical Cores (PRD §7)
    CREATE TABLE IF NOT EXISTS cores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      badge TEXT NOT NULL,
      icon TEXT NOT NULL,
      accent_hex TEXT NOT NULL,
      desc TEXT NOT NULL,
      intro TEXT NOT NULL
    );

    -- Standardized Skills (PRD §6.2)
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      core_id TEXT NOT NULL REFERENCES cores(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      desc TEXT NOT NULL
    );

    -- Granular Topics (PRD §6.3)
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      name TEXT NOT NULL
    );

    -- Career Roles (PRD §8)
    CREATE TABLE IF NOT EXISTS career_roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      is_mvp INTEGER DEFAULT 0,
      tagline TEXT NOT NULL,
      desc TEXT NOT NULL,
      salary TEXT NOT NULL,
      hiring_demand TEXT NOT NULL
    );

    -- Dynamic Role-to-Skill Mappings (PRD §8 & §12.3)
    CREATE TABLE IF NOT EXISTS role_skill_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id TEXT NOT NULL REFERENCES career_roles(id) ON DELETE CASCADE,
      skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      weight REAL NOT NULL,
      min_proficiency INTEGER NOT NULL,
      mandatory INTEGER NOT NULL DEFAULT 0
    );

    -- Assessments (Knowledge, Practical, Gamified) (PRD §9 & §10)
    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      type TEXT NOT NULL, -- 'knowledge', 'practical', 'gamified'
      title TEXT NOT NULL,
      scenario TEXT,
      instructions_json TEXT,
      starter_code TEXT,
      tests_json TEXT,
      time_limit INTEGER DEFAULT 180,
      answer_key_json TEXT
    );

    -- Assessment Attempts & Audit Log (PRD §9.1 & §14.3)
    CREATE TABLE IF NOT EXISTS assessment_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      assessment_id TEXT REFERENCES assessments(id),
      skill_id TEXT NOT NULL REFERENCES skills(id),
      type TEXT NOT NULL,
      k_score INTEGER NOT NULL,
      a_score INTEGER NOT NULL,
      r_score INTEGER NOT NULL,
      p_score INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      ai_feedback TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Demonstrated Skill Evidence (PRD §12.1 & §12.2)
    CREATE TABLE IF NOT EXISTS user_skill_progress (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      p_score INTEGER NOT NULL,
      k_score INTEGER NOT NULL,
      a_score INTEGER NOT NULL,
      r_score INTEGER NOT NULL,
      confidence TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 1,
      last_assessed DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, skill_id)
    );

    -- Targeted Learning Resources (PRD §11)
    CREATE TABLE IF NOT EXISTS learning_resources (
      id TEXT PRIMARY KEY,
      skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      duration TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL
    );

    -- Learning Completion (Stored STRICTLY SEPARATE from skill proficiency - PRD §6.7)
    CREATE TABLE IF NOT EXISTS user_learning_progress (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      resource_id TEXT NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
      completed INTEGER NOT NULL DEFAULT 1,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, resource_id)
    );

    -- High-Performance Indexes for Foreign Key Joins & Filtering (PRD §16.3 & Criterion 4)
    CREATE INDEX IF NOT EXISTS idx_skills_core_id ON skills(core_id);
    CREATE INDEX IF NOT EXISTS idx_topics_skill_id ON topics(skill_id);
    CREATE INDEX IF NOT EXISTS idx_role_skill_mappings_role_id ON role_skill_mappings(role_id);
    CREATE INDEX IF NOT EXISTS idx_role_skill_mappings_skill_id ON role_skill_mappings(skill_id);
    CREATE INDEX IF NOT EXISTS idx_assessments_skill_id ON assessments(skill_id);
    CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user_id ON assessment_attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_assessment_attempts_skill_id ON assessment_attempts(skill_id);
    CREATE INDEX IF NOT EXISTS idx_user_skill_progress_user_id ON user_skill_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_learning_resources_skill_id ON learning_resources(skill_id);
    CREATE INDEX IF NOT EXISTS idx_user_learning_progress_user_id ON user_learning_progress(user_id);
  `);

  // Safe schema migration for existing databases (adds role column if missing)
  try {
    db.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';`);
  } catch (e) {
    // Column already exists
  }
}

module.exports = {
  getDatabase
};

