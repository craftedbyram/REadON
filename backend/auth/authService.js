/**
 * REadON Authentication Service
 * Uses secure scrypt hashing and session token generation via Node.js crypto.
 * PRD §14.1 & §18
 */

const crypto = require('node:crypto');
const { getDatabase } = require('../db/database');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

function createSession(userId) {
  const db = getDatabase();
  const token = 'sq_sess_' + crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  db.prepare(`
    INSERT INTO sessions (token, user_id, expires_at)
    VALUES (?, ?, ?)
  `).run(token, userId, expiresAt);

  return { token, expiresAt };
}

function getUserFromSession(token) {
  if (!token) return null;
  const db = getDatabase();
  const session = db.prepare(`
    SELECT s.user_id, u.id, u.email, u.name, u.experience_level, u.target_role_id, u.xp, u.streak, u.level
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP
  `).get(token);

  return session || null;
}

function deleteSession(token) {
  if (!token) return;
  const db = getDatabase();
  db.prepare(`DELETE FROM sessions WHERE token = ?`).run(token);
}

module.exports = {
  hashPassword,
  verifyPassword,
  createSession,
  getUserFromSession,
  deleteSession
};

