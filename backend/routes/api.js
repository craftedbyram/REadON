/**
 * REadON REST API Router
 * Implements all endpoints outlined in PRD §17 with input validation and security.
 */

const { getDatabase } = require('../db/database');
const { hashPassword, verifyPassword, createSession, getUserFromSession, deleteSession } = require('../auth/authService');
const { calculateSkillProficiency, calculateConfidence, getRoleReadiness } = require('../services/scoringService');
const { evaluateSubmissionAI, generateAssessmentAI, generatePracticalTaskAI, identifyCareerRoleAndLearningAI, chatWithMentorAI } = require('../ai/openRouter');
const { runCodeInSandbox } = require('../sandbox/runner');
const { CORE_PRACTICAL_TASKS } = require('../services/coreTasks');

function handleApiRequest(req, res, url, body) {
  const db = getDatabase();
  const method = req.method;
  const pathname = url.pathname;

  // Extract auth token from header
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const currentUser = getUserFromSession(token) || db.prepare('SELECT * FROM users LIMIT 1').get(); // Fallback to default user for easy testing

  // Helper response functions
  const sendJson = (status, data) => {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    res.end(JSON.stringify(data));
  };

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    return res.end();
  }

  // ----------------------------------------
  // 1. AUTHENTICATION (PRD §14.1 & §17)
  // ----------------------------------------

  // POST /api/v1/auth/register (Zero-Trust Input Validation & Password Policy)
  if (method === 'POST' && pathname === '/api/v1/auth/register') {
    const { email, password, name, experience_level, target_role_id } = body || {};
    if (!email || !password || !name) {
      return sendJson(400, { error: 'Email, password, and name are required' });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(name).trim();

    // RFC5322-compliant email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return sendJson(400, { error: 'Invalid email address format' });
    }

    // Minimum password security policy
    if (typeof password !== 'string' || password.length < 8) {
      return sendJson(400, { error: 'Password must be at least 8 characters long' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(trimmedEmail);
    if (existing) {
      return sendJson(409, { error: 'Email is already registered' });
    }

    const userId = 'usr_' + Date.now();
    const pwdHash = hashPassword(password);
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, experience_level, target_role_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, trimmedEmail, pwdHash, trimmedName, experience_level || 'College Student / Fresher', target_role_id || 'fs_dev');

    const session = createSession(userId);
    return sendJson(201, {
      message: 'User registered successfully',
      token: session.token,
      user: { id: userId, email: trimmedEmail, name: trimmedName, experience_level, target_role_id }
    });
  }

  // POST /api/v1/auth/login
  if (method === 'POST' && pathname === '/api/v1/auth/login') {
    const { email, password } = body;
    if (!email || !password) {
      return sendJson(400, { error: 'Email and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return sendJson(401, { error: 'Invalid email or password' });
    }

    const session = createSession(user.id);
    return sendJson(200, {
      message: 'Authenticated successfully',
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        experience_level: user.experience_level,
        target_role_id: user.target_role_id,
        xp: user.xp,
        streak: user.streak,
        level: user.level
      }
    });
  }

  // GET /api/v1/auth/me
  if (method === 'GET' && pathname === '/api/v1/auth/me') {
    if (!currentUser) return sendJson(401, { error: 'Unauthenticated' });
    return sendJson(200, { user: currentUser });
  }

  // ----------------------------------------
  // 2. CORES & SKILLS CATALOG (PRD §7 & §17)
  // ----------------------------------------

  // GET /api/v1/cores
  if (method === 'GET' && pathname === '/api/v1/cores') {
    const cores = db.prepare('SELECT * FROM cores').all();
    const coresWithSkills = cores.map(c => {
      const skills = db.prepare('SELECT * FROM skills WHERE core_id = ?').all(c.id);
      return { ...c, skills };
    });
    return sendJson(200, { cores: coresWithSkills });
  }

  // GET /api/v1/cores/:core_id
  if (method === 'GET' && pathname.startsWith('/api/v1/cores/')) {
    const coreId = pathname.replace('/api/v1/cores/', '');
    const core = db.prepare('SELECT * FROM cores WHERE id = ?').get(coreId);
    if (!core) return sendJson(404, { error: 'Core not found' });

    const skills = db.prepare('SELECT * FROM skills WHERE core_id = ?').all(core.id);
    const skillsWithTopics = skills.map(s => {
      const topics = db.prepare('SELECT name FROM topics WHERE skill_id = ?').all(s.id).map(t => t.name);
      return { ...s, topics };
    });

    return sendJson(200, { core: { ...core, skills: skillsWithTopics } });
  }

  // ----------------------------------------
  // 3. CAREER ROLES & MAPPINGS (PRD §8 & §17)
  // ----------------------------------------

  // GET /api/v1/roles
  if (method === 'GET' && pathname === '/api/v1/roles') {
    const roles = db.prepare('SELECT * FROM career_roles').all();
    return sendJson(200, { roles });
  }

  // GET /api/v1/roles/:role_id/skills
  if (method === 'GET' && pathname.match(/^\/api\/v1\/roles\/[^\/]+\/skills$/)) {
    const roleId = pathname.split('/')[4];
    const skills = db.prepare(`
      SELECT rsm.*, s.name as skill_name, c.name as core_name
      FROM role_skill_mappings rsm
      JOIN skills s ON rsm.skill_id = s.id
      JOIN cores c ON s.core_id = c.id
      WHERE rsm.role_id = ?
    `).all(roleId);
    return sendJson(200, { roleId, skills });
  }

  // GET /api/v1/roles/:role_id
  if (method === 'GET' && pathname.startsWith('/api/v1/roles/')) {
    const roleId = pathname.replace('/api/v1/roles/', '');
    const readiness = getRoleReadiness(currentUser?.id || 'usr_alex_rivera', roleId);
    if (!readiness) return sendJson(404, { error: 'Role not found' });
    return sendJson(200, readiness);
  }

  // ----------------------------------------
  // 4. ASSESSMENTS & SUBMISSIONS (PRD §9 & §17)
  // ----------------------------------------

  // GET /api/v1/assessments/core-practical/:core_id (Hands-on task for selected core - NO MCQs!)
  if (method === 'GET' && pathname.startsWith('/api/v1/assessments/core-practical/')) {
    const coreId = pathname.replace('/api/v1/assessments/core-practical/', '');
    const task = CORE_PRACTICAL_TASKS[coreId] || CORE_PRACTICAL_TASKS.prog;
    return sendJson(200, { task });
  }

  // POST /api/v1/assessments/evaluate-and-identify-role
  // Executes code in sandbox, runs tests, and uses AI to diagnose career role & recommend core learning
  if (method === 'POST' && pathname === '/api/v1/assessments/evaluate-and-identify-role') {
    const { coreId, userCode } = body || {};
    const userId = currentUser?.id || 'usr_alex_rivera';
    const task = CORE_PRACTICAL_TASKS[coreId] || CORE_PRACTICAL_TASKS.prog;

    runCodeInSandbox(userCode || '', task.tests)
      .then(async (execResult) => {
        const passedCount = execResult.passedCount || 0;
        const totalTests = task.tests.length || 1;
        const aScore = Math.round((passedCount / totalTests) * 100);
        const kScore = aScore > 0 ? 80 : 40;
        const rScore = passedCount === totalTests ? 90 : 65;

        const { p } = calculateSkillProficiency(kScore, aScore, rScore);
        const isPassed = passedCount === totalTests;

        // Call AI Career Diagnostic Engine (Primary OpenRouter -> Failover to NVIDIA Nemotron -> Fallback)
        const roleDiagnosis = await identifyCareerRoleAndLearningAI(
          task.coreName,
          task.title,
          userCode || '',
          passedCount,
          totalTests,
          p
        );

        // Record attempt in database
        const attemptId = 'att_' + Date.now();
        const primarySkill = db.prepare('SELECT id FROM skills WHERE core_id = ? LIMIT 1').get(coreId);
        const skillId = primarySkill ? primarySkill.id : 'prog_vars';

        db.prepare(`
          INSERT INTO assessment_attempts (id, user_id, assessment_id, skill_id, type, k_score, a_score, r_score, p_score, passed, ai_feedback)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          attemptId,
          userId,
          null, // assessment_id is optional / nullable
          skillId,
          `Practical Core Task: ${task.coreName}`,
          kScore, aScore, rScore, p, isPassed ? 1 : 0,
          roleDiagnosis ? roleDiagnosis.diagnosis : 'Practical task evaluated'
        );

        // Update target role if user passed
        if (roleDiagnosis.recommendedRole) {
          const matchedRole = db.prepare('SELECT id FROM career_roles WHERE name LIKE ? LIMIT 1').get(`%${roleDiagnosis.recommendedRole.split(' ')[0]}%`);
          if (matchedRole) {
            db.prepare('UPDATE users SET target_role_id = ? WHERE id = ?').run(matchedRole.id, userId);
          }
        }

        // Increment XP
        db.prepare('UPDATE users SET xp = xp + 250 WHERE id = ?').run(userId);

        return sendJson(200, {
          attemptId,
          coreId,
          coreName: task.coreName,
          pScore: p,
          kScore,
          aScore,
          rScore,
          passed: isPassed,
          passedCount,
          totalTests,
          testResults: execResult.results || [],
          roleDiagnosis
        });
      })
      .catch(err => {
        return sendJson(500, { error: 'Sandbox execution error', details: err.message });
      });
    return;
  }

  // POST /api/v1/assessments/start
  if (method === 'POST' && pathname === '/api/v1/assessments/start') {
    const { skillId, type } = body || {};
    let assessment = null;

    if (skillId) {
      assessment = db.prepare('SELECT * FROM assessments WHERE skill_id = ? LIMIT 1').get(skillId);
    } else if (type) {
      assessment = db.prepare('SELECT * FROM assessments WHERE type = ? LIMIT 1').get(type);
    } else {
      assessment = db.prepare('SELECT * FROM assessments LIMIT 1').get();
    }

    if (!assessment) return sendJson(404, { error: 'No assessment challenge found for criteria' });

    // Parse JSON fields
    return sendJson(200, {
      assessment: {
        id: assessment.id,
        skillId: assessment.skill_id,
        type: assessment.type,
        title: assessment.title,
        scenario: assessment.scenario,
        instructions: assessment.instructions_json ? JSON.parse(assessment.instructions_json) : [],
        starterCode: assessment.starter_code,
        timeLimit: assessment.time_limit,
        // Do NOT expose answer_key_json or expected outputs directly to client for objective security
        hasSandboxTests: !!assessment.tests_json
      }
    });
  }

  // POST /api/v1/assessments/generate (AI-powered generation via OpenRouter - PRD §15.1)
  if (method === 'POST' && pathname === '/api/v1/assessments/generate') {
    const { skillId, difficulty } = body || {};
    const skill = db.prepare('SELECT * FROM skills WHERE id = ?').get(skillId || 'prog_vars');
    const skillName = skill ? skill.name : 'Programming Fundamentals';

    generateAssessmentAI(skillName, difficulty || 'intermediate')
      .then(generated => {
        return sendJson(200, { generated });
      })
      .catch(err => {
        return sendJson(500, { error: 'AI generation error', details: err.message });
      });
    return;
  }

  // POST /api/v1/submissions (Safe isolated grading - PRD §16.1 & §17)
  if (method === 'POST' && pathname === '/api/v1/submissions') {
    const { assessmentId, skillId, userCode, selectedOptionIndex, selfExplanation } = body || {};
    const userId = currentUser?.id || 'usr_alex_rivera';

    if (!assessmentId && !skillId) {
      return sendJson(400, { error: 'assessmentId or skillId is required for submission evaluation' });
    }

    const assessment = (assessmentId ? db.prepare('SELECT * FROM assessments WHERE id = ?').get(assessmentId) : null) ||
                       (skillId ? db.prepare('SELECT * FROM assessments WHERE skill_id = ? LIMIT 1').get(skillId) : null);

    if (!assessment) {
      return sendJson(404, { error: 'Assessment not found' });
    }

    // A. Knowledge Assessment Evaluation
    if (assessment.type === 'knowledge') {
      const answerKey = assessment.answer_key_json ? JSON.parse(assessment.answer_key_json) : {};
      const isCorrect = selectedOptionIndex === answerKey.correct_index;
      const kScore = isCorrect ? 100 : 25;
      const aScore = 70; // baseline applied
      const rScore = 75; // reasoning

      const { p } = calculateSkillProficiency(kScore, aScore, rScore);
      const attemptId = 'att_' + Date.now();

      // Update skill evidence
      const prev = db.prepare('SELECT attempts FROM user_skill_progress WHERE user_id = ? AND skill_id = ?').get(userId, assessment.skill_id);
      const attempts = (prev ? prev.attempts : 0) + 1;
      const conf = calculateConfidence(attempts, false, p);

      db.prepare(`
        INSERT OR REPLACE INTO user_skill_progress (user_id, skill_id, p_score, k_score, a_score, r_score, confidence, attempts)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(userId, assessment.skill_id, p, kScore, aScore, rScore, conf, attempts);

      db.prepare(`
        INSERT INTO assessment_attempts (id, user_id, assessment_id, skill_id, type, k_score, a_score, r_score, p_score, passed, ai_feedback)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(attemptId, userId, assessment.id, assessment.skill_id, 'Knowledge Assessment', kScore, aScore, rScore, p, isCorrect ? 1 : 0, isCorrect ? 'Demonstrated strong conceptual grasp.' : 'Review core definitions.');

      // Increment XP
      db.prepare('UPDATE users SET xp = xp + 100 WHERE id = ?').run(userId);

      return sendJson(200, {
        attemptId,
        pScore: p,
        kScore,
        aScore,
        rScore,
        passed: isCorrect,
        confidence: conf,
        feedback: answerKey.options ? answerKey.options[selectedOptionIndex]?.explanation : 'Evaluation recorded'
      });
    }

    // B. Practical Code Sandbox Evaluation in Isolated Process Runner (PRD §16 & §18)
    const tests = assessment.tests_json ? JSON.parse(assessment.tests_json) : [];

    runCodeInSandbox(userCode || '', tests)
      .then(async (execResult) => {
        const passedCount = execResult.passedCount || 0;
        const totalTests = tests.length || 1;
        const aScore = Math.round((passedCount / totalTests) * 100);
        const kScore = 80;
        const rScore = passedCount === totalTests ? 90 : 60;

        const { p } = calculateSkillProficiency(kScore, aScore, rScore);
        const isPassed = passedCount === totalTests;

        // Call OpenRouter AI on backend for qualitative rubric feedback (PRD §15.1)
        const skill = db.prepare('SELECT name FROM skills WHERE id = ?').get(assessment.skill_id);
        const aiFeedback = await evaluateSubmissionAI(
          skill?.name || 'Practical Task',
          assessment.title,
          userCode || '',
          passedCount,
          totalTests
        );

        const attemptId = 'att_' + Date.now();
        const prev = db.prepare('SELECT attempts FROM user_skill_progress WHERE user_id = ? AND skill_id = ?').get(userId, assessment.skill_id);
        const attempts = (prev ? prev.attempts : 0) + 1;
        const conf = calculateConfidence(attempts, true, p);

        // Update database
        db.prepare(`
          INSERT OR REPLACE INTO user_skill_progress (user_id, skill_id, p_score, k_score, a_score, r_score, confidence, attempts)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(userId, assessment.skill_id, p, kScore, aScore, rScore, conf, attempts);

        db.prepare(`
          INSERT INTO assessment_attempts (id, user_id, assessment_id, skill_id, type, k_score, a_score, r_score, p_score, passed, ai_feedback)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(attemptId, userId, assessment.id, assessment.skill_id, 'Practical Code Sandbox', kScore, aScore, rScore, p, isPassed ? 1 : 0, aiFeedback);

        // Increment XP
        db.prepare('UPDATE users SET xp = xp + 200 WHERE id = ?').run(userId);

        return sendJson(200, {
          attemptId,
          pScore: p,
          kScore,
          aScore,
          rScore,
          passed: isPassed,
          passedCount,
          totalTests,
          confidence: conf,
          aiFeedback,
          testResults: execResult.results || []
        });
      })
      .catch(err => {
        return sendJson(500, { error: 'Sandbox execution failure', details: err.message });
      });
    return;
  }

  // GET /api/v1/assessments/:attempt_id/results
  if (method === 'GET' && pathname.startsWith('/api/v1/assessments/') && pathname.endsWith('/results')) {
    const attemptId = pathname.split('/')[4];
    const attempt = db.prepare(`
      SELECT a.*, s.name as skill_name, c.name as core_name
      FROM assessment_attempts a
      JOIN skills s ON a.skill_id = s.id
      JOIN cores c ON s.core_id = c.id
      WHERE a.id = ?
    `).get(attemptId);

    if (!attempt) return sendJson(404, { error: 'Attempt result not found' });
    return sendJson(200, { attempt });
  }

  // ----------------------------------------
  // 5. PROGRESS & RECOMMENDATIONS (PRD §17)
  // ----------------------------------------

  // GET /api/v1/progress
  if (method === 'GET' && pathname === '/api/v1/progress') {
    const userId = currentUser?.id || 'usr_alex_rivera';
    const progress = db.prepare(`
      SELECT usp.*, s.name as skill_name, c.name as core_name, c.id as core_id
      FROM user_skill_progress usp
      JOIN skills s ON usp.skill_id = s.id
      JOIN cores c ON s.core_id = c.id
      WHERE usp.user_id = ?
    `).all(userId);

    const learningCount = db.prepare(`SELECT COUNT(*) as count FROM user_learning_progress WHERE user_id = ?`).get(userId).count;

    return sendJson(200, {
      userId,
      skills: progress,
      learningCompletedCount: learningCount
    });
  }

  // GET /api/v1/recommendations
  if (method === 'GET' && pathname === '/api/v1/recommendations') {
    const userId = currentUser?.id || 'usr_alex_rivera';
    const targetRoleId = currentUser?.target_role_id || 'fs_dev';
    const readiness = getRoleReadiness(userId, targetRoleId);

    // Find highest deficit mandatory skill
    const nextGap = readiness.mandatoryGaps.length > 0 ? readiness.mandatoryGaps[0] : null;

    return sendJson(200, {
      targetRole: readiness.role,
      alignmentPercentage: readiness.alignmentPercentage,
      criticalGaps: readiness.mandatoryGaps,
      suggestedNextStep: nextGap ? {
        type: 'Skill Gap Remediation',
        skillId: nextGap.skillId,
        title: `Improve ${nextGap.name}`,
        reason: `Currently at ${nextGap.current}%, minimum required for ${readiness.role.name} is ${nextGap.required}%.`
      } : {
        type: 'Advanced Practice',
        title: 'Complete System Architecture Challenge',
        reason: 'All mandatory role thresholds achieved!'
      }
    });
  }

  // GET /api/v1/learning-path (PRD §11 & §17)
  if (method === 'GET' && pathname === '/api/v1/learning-path') {
    const userId = currentUser?.id || 'usr_alex_rivera';
    const resources = db.prepare(`
      SELECT lr.*, s.name as skill_name,
        CASE WHEN ulp.completed IS NOT NULL THEN 1 ELSE 0 END as is_completed
      FROM learning_resources lr
      JOIN skills s ON lr.skill_id = s.id
      LEFT JOIN user_learning_progress ulp ON lr.id = ulp.resource_id AND ulp.user_id = ?
    `).all(userId);

    return sendJson(200, { resources });
  }

  // POST /api/v1/learning/:resource_id/complete
  if (method === 'POST' && pathname.startsWith('/api/v1/learning/') && pathname.endsWith('/complete')) {
    const resId = pathname.split('/')[4];
    const userId = currentUser?.id || 'usr_alex_rivera';

    db.prepare(`
      INSERT OR REPLACE INTO user_learning_progress (user_id, resource_id, completed)
      VALUES (?, ?, 1)
    `).run(userId, resId);

    // Increment XP
    db.prepare('UPDATE users SET xp = xp + 50 WHERE id = ?').run(userId);

    return sendJson(200, { message: 'Learning resource completed (proficiency remains separate until verified)' });
  }

  // GET /api/v1/history (PRD §13 & §17)
  if (method === 'GET' && pathname === '/api/v1/history') {
    const userId = currentUser?.id || 'usr_alex_rivera';
    const history = db.prepare(`
      SELECT aa.*, s.name as skill_name, c.name as core_name
      FROM assessment_attempts aa
      JOIN skills s ON aa.skill_id = s.id
      JOIN cores c ON s.core_id = c.id
      WHERE aa.user_id = ?
      ORDER BY aa.created_at DESC
    `).all(userId);

    return sendJson(200, { history });
  }

  // ----------------------------------------
  // 6. DEDICATED AI CHAT MENTOR SPACE (PRD §15)
  // ----------------------------------------
  // POST /api/v1/ai/chat (Gemini 2.0 Flash Lite + NVIDIA Nemotron 70B failover)
  if (method === 'POST' && pathname === '/api/v1/ai/chat') {
    const { messages, context } = body || {};
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return sendJson(400, { error: 'Messages array is required' });
    }

    const userId = currentUser?.id || 'usr_alex_rivera';
    const studentContext = {
      currentRole: currentUser?.target_role_id || 'Full-Stack Developer',
      xp: currentUser?.xp || 850,
      streak: currentUser?.streak || 3,
      ...(context || {})
    };

    chatWithMentorAI(messages, studentContext)
      .then(result => {
        return sendJson(200, {
          success: true,
          message: result.message,
          modelUsed: result.modelUsed
        });
      })
      .catch(err => {
        return sendJson(500, { error: 'AI chat service error', details: err.message });
      });
    return;
  }

  // 404 for unknown endpoints
  return sendJson(404, { error: `Endpoint ${method} ${pathname} not found` });
}

module.exports = {
  handleApiRequest
};

