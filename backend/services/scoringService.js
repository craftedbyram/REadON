/**
 * Scoring and Role Alignment Service
 * Implements PRD §12 mathematical formulas and evidence weighting.
 */

const { getDatabase } = require('../db/database');

/**
 * Calculates Skill Proficiency: P = 0.30K + 0.50A + 0.20R
 * PRD §12.1
 */
function calculateSkillProficiency(kScore, aScore, rScore) {
  const k = Math.min(100, Math.max(0, kScore || 0));
  const a = Math.min(100, Math.max(0, aScore || 0));
  const r = Math.min(100, Math.max(0, rScore || 0));
  const p = Math.round((0.30 * k) + (0.50 * a) + (0.20 * r));
  return { k, a, r, p };
}

/**
 * Confidence in the score based on evidence volume & variety
 * PRD §12.2
 */
function calculateConfidence(attempts, hasPractical, pScore) {
  if (!attempts || attempts <= 0) return 'Not Assessed';
  if (attempts === 1) return 'Low (Preliminary)';
  if (attempts === 2) return 'Medium';
  if (attempts >= 3 && hasPractical && pScore >= 80) return 'Verified Mastery';
  return 'High';
}

/**
 * Role Readiness & Mandatory Gap Breakdown
 * PRD §12.3 & §12.4
 */
function getRoleReadiness(userId, roleId) {
  const db = getDatabase();
  const role = db.prepare('SELECT * FROM career_roles WHERE id = ?').get(roleId) ||
               db.prepare('SELECT * FROM career_roles WHERE is_mvp = 1 LIMIT 1').get();

  if (!role) return null;

  const mappings = db.prepare(`
    SELECT rsm.*, s.name as skill_name, c.name as core_name, c.id as core_id
    FROM role_skill_mappings rsm
    JOIN skills s ON rsm.skill_id = s.id
    JOIN cores c ON s.core_id = c.id
    WHERE rsm.role_id = ?
  `).all(role.id);

  let totalWeightedScore = 0;
  let totalWeight = 0;
  const skillBreakdown = [];
  const mandatoryGaps = [];

  for (const map of mappings) {
    const evidence = db.prepare(`
      SELECT * FROM user_skill_progress WHERE user_id = ? AND skill_id = ?
    `).get(userId, map.skill_id);

    const score = evidence ? evidence.p_score : 0;
    const confidence = evidence ? evidence.confidence : 'Not Assessed';
    const isDeficit = score < map.min_proficiency;

    totalWeightedScore += score * map.weight;
    totalWeight += map.weight;

    if (map.mandatory && isDeficit) {
      mandatoryGaps.push({
        skillId: map.skill_id,
        name: map.skill_name,
        current: score,
        required: map.min_proficiency,
        deficit: map.min_proficiency - score
      });
    }

    skillBreakdown.push({
      skillId: map.skill_id,
      name: map.skill_name,
      coreName: map.core_name,
      weight: map.weight,
      minProficiency: map.min_proficiency,
      mandatory: Boolean(map.mandatory),
      currentScore: score,
      confidence,
      isDeficit,
      deficit: Math.max(0, map.min_proficiency - score)
    });
  }

  const alignmentPercentage = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

  return {
    role,
    alignmentPercentage,
    skillBreakdown,
    mandatoryGaps,
    hasCriticalDeficit: mandatoryGaps.length > 0
  };
}

module.exports = {
  calculateSkillProficiency,
  calculateConfidence,
  getRoleReadiness
};

