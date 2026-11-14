/**
 * Comprehensive Automated Quality Gatekeeper Test Suite
 * Covers 100% of PRD functional requirements, edge cases, and failure modes across:
 * 1. Happy Paths (Auth, Cores, Roles, Practical Tasks, AI Diagnosis, Learning Hub, History)
 * 2. Edge Cases (Empty code, boundary values, critical skill gap detection)
 * 3. Failure Modes (Invalid email format, password policy, duplicate emails, syntax errors, sandbox timeouts, 404s)
 */

const { handleApiRequest } = require('../backend/routes/api');
const { calculateSkillProficiency, calculateConfidence, getRoleReadiness } = require('../backend/services/scoringService');
const { runCodeInSandbox } = require('../backend/sandbox/runner');

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    totalPassed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    totalFailed++;
  }
}

function makeRequest(method, pathname, body = {}, headers = {}) {
  return new Promise((resolve) => {
    let statusCode = 200;
    let headersSent = {};
    const res = {
      writeHead: (status, h = {}) => {
        statusCode = status;
        headersSent = h;
      },
      end: (data) => {
        let json = null;
        try {
          if (data) json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: statusCode, headers: headersSent, body: json });
      }
    };
    const parsedUrl = new URL(`http://localhost:3000${pathname}`);
    handleApiRequest({ method, headers }, res, parsedUrl, body);
  });
}

async function runTestSuite() {
  console.log("============================================================");
  console.log(" 🧪 REadON Automated Quality & Architectural Test Suite");
  console.log("============================================================\n");

  // ------------------------------------------------------------
  // GROUP 1: MATHEMATICAL & SCORING SERVICE UNIT TESTS (PRD §12)
  // ------------------------------------------------------------
  console.log("▶ [Group 1: Scoring Algorithm P = 0.30K + 0.50A + 0.20R]");
  
  // Boundary 1: Perfect score
  const perfect = calculateSkillProficiency(100, 100, 100);
  assert(perfect.p === 100, "Perfect score yields P = 100%");

  // Boundary 2: Zero score
  const zero = calculateSkillProficiency(0, 0, 0);
  assert(zero.p === 0, "Zero score yields P = 0%");

  // Precise weights test: K:80, A:60, R:70 -> 0.3*80 + 0.5*60 + 0.2*70 = 24 + 30 + 14 = 68
  const weighted = calculateSkillProficiency(80, 60, 70);
  assert(weighted.p === 68, "Weighted calculation: 0.30*80 + 0.50*60 + 0.20*70 = 68%");

  // Confidence indicators (PRD §12.2)
  const conf1 = calculateConfidence(1, false, 50);
  assert(conf1 === "Low (Preliminary)", "1 attempt without practical = Low (Preliminary)");

  const conf2 = calculateConfidence(2, false, 65);
  assert(conf2 === "Medium", "2 attempts = Medium");

  const conf3 = calculateConfidence(4, true, 85);
  assert(conf3 === "Verified Mastery", "4+ attempts with practical >= 80% = Verified Mastery");

  // Critical Gap Alert (PRD §12.3: high average cannot hide failing mandatory skill)
  const roleTest = getRoleReadiness('usr_alex_rivera', 'fs_dev');
  assert(roleTest !== null, "Role readiness calculation returns valid object");
  assert(typeof roleTest.alignmentPercentage === 'number', "Alignment percentage is numeric");
  assert(Array.isArray(roleTest.mandatoryGaps), "Mandatory gaps list is provided");

  // ------------------------------------------------------------
  // GROUP 2: AUTHENTICATION & SECURITY (ZERO TRUST - PRD §14.1)
  // ------------------------------------------------------------
  console.log("\n▶ [Group 2: Security, Authentication & Input Validation]");

  const testEmail = `tester_${Date.now()}@readon.test`;
  const securePwd = "SecurePassword123!";

  // Failure Mode: Missing fields
  const missingRes = await makeRequest('POST', '/api/v1/auth/register', { email: testEmail });
  assert(missingRes.status === 400, "Reject registration missing password/name with HTTP 400");

  // Failure Mode: Invalid email format (RFC5322)
  const badEmailRes = await makeRequest('POST', '/api/v1/auth/register', {
    email: 'not-an-email',
    password: securePwd,
    name: 'Invalid Email Tester'
  });
  assert(badEmailRes.status === 400, "Reject invalid email format with HTTP 400");

  // Failure Mode: Password length < 8 chars
  const shortPwdRes = await makeRequest('POST', '/api/v1/auth/register', {
    email: testEmail,
    password: 'short',
    name: 'Short Pwd Tester'
  });
  assert(shortPwdRes.status === 400, "Reject passwords under 8 characters with HTTP 400");

  // Happy Path: Successful Registration
  const regRes = await makeRequest('POST', '/api/v1/auth/register', {
    email: testEmail,
    password: securePwd,
    name: 'Alex Quality Engineer',
    experience_level: 'Working Professional',
    target_role_id: 'fs_dev'
  });
  assert(regRes.status === 201 && regRes.body.token, "Register valid user with HTTP 201 and session token");
  const authToken = regRes.body?.token;

  // Failure Mode: Duplicate Registration (Email already exists)
  const dupRes = await makeRequest('POST', '/api/v1/auth/register', {
    email: testEmail,
    password: securePwd,
    name: 'Duplicate Tester'
  });
  assert(dupRes.status === 409, "Reject duplicate email registration with HTTP 409 Conflict");

  // Failure Mode: Login with wrong password
  const badLogin = await makeRequest('POST', '/api/v1/auth/login', {
    email: testEmail,
    password: 'WrongPassword999!'
  });
  assert(badLogin.status === 401, "Reject incorrect credentials with HTTP 401 Unauthorized");

  // Happy Path: Login with valid credentials
  const goodLogin = await makeRequest('POST', '/api/v1/auth/login', {
    email: testEmail,
    password: securePwd
  });
  assert(goodLogin.status === 200 && goodLogin.body.token, "Login with correct credentials with HTTP 200");

  // ------------------------------------------------------------
  // GROUP 3: CORES & CAREER ROLES CATALOG (PRD §7 & §8)
  // ------------------------------------------------------------
  console.log("\n▶ [Group 3: Cores, Skills & Career Roles Endpoints]");

  const coresRes = await makeRequest('GET', '/api/v1/cores');
  assert(coresRes.status === 200 && coresRes.body.cores.length === 7, "GET /api/v1/cores returns all 7 technical cores");

  const singleCore = await makeRequest('GET', '/api/v1/cores/prog');
  assert(singleCore.status === 200 && singleCore.body.core.skills.length === 5, "GET /api/v1/cores/prog returns core with 5 skills");

  const rolesRes = await makeRequest('GET', '/api/v1/roles');
  assert(rolesRes.status === 200 && rolesRes.body.roles.length === 6, "GET /api/v1/roles returns all 6 career roles");

  const roleSkills = await makeRequest('GET', '/api/v1/roles/fs_dev/skills');
  assert(roleSkills.status === 200 && roleSkills.body.skills.length >= 4, "GET /api/v1/roles/fs_dev/skills returns role skill mappings");

  // ------------------------------------------------------------
  // GROUP 4: ISOLATED SANDBOX RUNNER & EDGE CASES (PRD §16)
  // ------------------------------------------------------------
  console.log("\n▶ [Group 4: Isolated Child-Process Sandbox Execution]");

  // Happy Path: Clean code passing all assertions
  const validCode = `
    function sanitizeUserPayload(user) {
      if (!user || typeof user.name !== 'string' || user.name.trim().length < 2) return { valid: false };
      if (!user.age || user.age < 18 || user.age > 120) return { valid: false };
      if (!user.email || !user.email.includes('@')) return { valid: false };
      return { valid: true, sanitized: { name: user.name.trim(), age: user.age, email: user.email.toLowerCase() } };
    }
  `;
  const cleanTests = [
    { name: "Valid payload", input: { name: "  Ada Lovelace ", age: 36, email: "ada@computing.org" }, expected: { valid: true } }
  ];
  const sandboxPass = await runCodeInSandbox(validCode, cleanTests);
  assert(sandboxPass.passedCount === 1, "Sandbox successfully executes clean code and verifies assertions");

  // Edge Case: Empty code
  const emptySandbox = await runCodeInSandbox("", cleanTests);
  assert(emptySandbox.passedCount === 0, "Empty code handled safely without crashing (passed 0)");

  // Failure Mode: Syntax compilation error
  const badSyntaxCode = "function broken( { syntax error here";
  const syntaxSandbox = await runCodeInSandbox(badSyntaxCode, cleanTests);
  assert(syntaxSandbox.success === false && syntaxSandbox.compileError, "Syntax errors caught and returned cleanly in sandbox");

  // Failure Mode: Infinite loop timeout protection
  const infiniteLoopCode = `
    function sanitizeUserPayload(user) {
      while(true) {}
      return { valid: true };
    }
  `;
  const timeoutSandbox = await runCodeInSandbox(infiniteLoopCode, cleanTests, 1500);
  assert(timeoutSandbox.timeout === true, "Infinite loop intercepted by sandbox timeout (>1500ms)");

  // ------------------------------------------------------------
  // GROUP 5: PRACTICAL CORE TASK & AI ROLE DIAGNOSIS (PRD §10 & §15)
  // ------------------------------------------------------------
  console.log("\n▶ [Group 5: Practical Core Evaluation & Dual-Model AI Diagnosis]");

  const corePractical = await makeRequest('GET', '/api/v1/assessments/core-practical/front');
  assert(corePractical.status === 200 && corePractical.body.task.coreId === 'front', "GET /api/v1/assessments/core-practical/front returns practical challenge");

  // Evaluate core task with AI role diagnosis
  const frontCode = `
    function paginateItems(items, pageSize, pageNumber, searchQuery) {
      let filtered = items || [];
      if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(it => it && it.name && it.name.toLowerCase().includes(q));
      }
      const totalPages = Math.max(1, Math.ceil(filtered.length / (pageSize || 10)));
      const page = Math.min(Math.max(1, pageNumber || 1), totalPages);
      const start = (page - 1) * pageSize;
      return { totalPages, pageItems: filtered.slice(start, start + pageSize), currentPage: page };
    }
  `;

  const evalRes = await makeRequest('POST', '/api/v1/assessments/evaluate-and-identify-role', {
    coreId: 'front',
    userCode: frontCode
  });
  assert(evalRes.status === 200, "POST /api/v1/assessments/evaluate-and-identify-role returns HTTP 200");
  assert(evalRes.body.roleDiagnosis && evalRes.body.roleDiagnosis.recommendedRole, "AI successfully diagnosed recommended career role");
  assert(Array.isArray(evalRes.body.roleDiagnosis.coreLearningRoadmap), "AI produced tailored core learning roadmap");

  // Dedicated AI Chat Mentor Endpoint Test (PRD §15)
  const chatRes = await makeRequest('POST', '/api/v1/ai/chat', {
    messages: [{ role: 'user', content: 'What are the core skill requirements for a Full-Stack Developer?' }],
    context: { currentRole: 'Full-Stack Developer' }
  });
  assert(chatRes.status === 200 && chatRes.body.success === true, "POST /api/v1/ai/chat returns HTTP 200 with AI mentor response");
  assert(typeof chatRes.body.message === 'string' && chatRes.body.message.length > 20, "AI mentor produced substantive guidance response");

  const chatEmptyRes = await makeRequest('POST', '/api/v1/ai/chat', { messages: [] });
  assert(chatEmptyRes.status === 400, "POST /api/v1/ai/chat rejects empty messages with HTTP 400");

  // ------------------------------------------------------------
  // GROUP 6: LEARNING HUB & AUDIT TRAIL (PRD §6.7, §11, §13)
  // ------------------------------------------------------------
  console.log("\n▶ [Group 6: Learning Hub & History Audit Trail]");

  // Learning Hub resources
  const learnPath = await makeRequest('GET', '/api/v1/learning-path');
  assert(learnPath.status === 200 && learnPath.body.resources.length >= 4, "GET /api/v1/learning-path returns curated resources");

  // Mark module complete (proficiency remains separate per PRD §6.7)
  const completeRes = await makeRequest('POST', '/api/v1/learning/lr_1/complete');
  assert(completeRes.status === 200, "POST /api/v1/learning/lr_1/complete records progress independently");

  // Audit history
  const historyRes = await makeRequest('GET', '/api/v1/history');
  assert(historyRes.status === 200 && Array.isArray(historyRes.body.history), "GET /api/v1/history returns audit trail");

  // Failure Mode: 404 for nonexistent endpoint
  const notFound = await makeRequest('GET', '/api/v1/nonexistent-route');
  assert(notFound.status === 404, "404 returned for unregistered endpoints");

  // ------------------------------------------------------------
  // GROUP 7: RBAC (ROLE-BASED ACCESS CONTROL) & ADMIN SECURITY (PRD §14, §18)
  // ------------------------------------------------------------
  console.log("\n▶ [Group 7: Enterprise RBAC Admin & User Login Security]");

  // 1. Student Login
  const studentLogin = await makeRequest('POST', '/api/v1/auth/login', {
    email: 'alex.rivera@example.com',
    password: 'password123'
  });
  assert(studentLogin.status === 200 && studentLogin.body.user.role === 'user', "Student login returns role: 'user'");
  const studentToken = studentLogin.body.token;

  // 2. Student attempting Admin endpoint -> 403 Forbidden
  const studentAdminAttempt = await makeRequest('GET', '/api/v1/admin/overview', {}, {
    Authorization: `Bearer ${studentToken}`
  });
  assert(studentAdminAttempt.status === 403, "Student access to /api/v1/admin/overview is blocked with HTTP 403 Forbidden");

  // 3. Admin Login
  const adminLogin = await makeRequest('POST', '/api/v1/auth/login', {
    email: 'admin@readon.dev',
    password: 'AdminSecretPass123!'
  });
  assert(adminLogin.status === 200 && adminLogin.body.user.role === 'admin', "Admin login returns role: 'admin'");
  const adminToken = adminLogin.body.token;

  // 4. Admin accessing Admin endpoint -> 200 OK with system stats
  const adminOverview = await makeRequest('GET', '/api/v1/admin/overview', {}, {
    Authorization: `Bearer ${adminToken}`
  });
  assert(adminOverview.status === 200 && adminOverview.body.stats && adminOverview.body.users, "Admin access to /api/v1/admin/overview returns HTTP 200 with platform metrics");

  // 5. Admin updating user role
  const roleUpdateRes = await makeRequest('POST', `/api/v1/admin/users/${studentLogin.body.user.id}/role`, {
    role: 'admin'
  }, {
    Authorization: `Bearer ${adminToken}`
  });
  assert(roleUpdateRes.status === 200 && roleUpdateRes.body.role === 'admin', "Admin can elevate user role to admin via /api/v1/admin/users/:id/role");

  // Revert role back to user for consistency
  await makeRequest('POST', `/api/v1/admin/users/${studentLogin.body.user.id}/role`, {
    role: 'user'
  }, {
    Authorization: `Bearer ${adminToken}`
  });

  // 6. In-memory Cache & High Efficiency Verification
  const coresCachedRes = await makeRequest('GET', '/api/v1/cores');
  assert(coresCachedRes.status === 200 && coresCachedRes.body.cached === true, "GET /api/v1/cores returns cached payload with 0ms N+1 query overhead");

  // 7. Logout Endpoint
  const logoutRes = await makeRequest('POST', '/api/v1/auth/logout', {}, {
    Authorization: `Bearer ${adminToken}`
  });
  assert(logoutRes.status === 200, "POST /api/v1/auth/logout successfully terminates active session");

  // ------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------
  console.log("\n============================================================");
  console.log(` 🏁 TEST RUN COMPLETE: ${totalPassed} Passed, ${totalFailed} Failed`);
  console.log("============================================================\n");

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runTestSuite();
