/**
 * Database Seed Script for REadON
 * Populates all 7 cores, 35 skills, career roles, assessments, and learning resources.
 */

const { getDatabase } = require('./database');
const { hashPassword } = require('../auth/authService');

function seed() {
  const db = getDatabase();
  console.log("Seeding REadON database...");

  // 1. Seed Demo User
  const userId = 'usr_alex_rivera';
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('alex.rivera@example.com');
  
  if (!existingUser) {
    const pwdHash = hashPassword('password123');
    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, experience_level, target_role_id, xp, streak, level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      'alex.rivera@example.com',
      pwdHash,
      'Alex Rivera',
      'College Student / Fresher',
      'fs_dev',
      850,
      3,
      2
    );
    console.log("✓ Default user created: alex.rivera@example.com / password123");
  }

  // 2. Seed 7 Cores (PRD §7)
  const cores = [
    {
      id: "prog",
      name: "Programming Fundamentals",
      badge: "Core #1",
      icon: "code",
      accent_hex: "#a855f7",
      desc: "Build the logic behind every application, software system, and script.",
      intro: "The universal foundations of computational thinking, algorithms, and clean code."
    },
    {
      id: "front",
      name: "Frontend Development",
      badge: "Core #2",
      icon: "layout",
      accent_hex: "#06b6d4",
      desc: "Create responsive, accessible, interactive web interfaces that users love.",
      intro: "Everything users see and touch in modern web applications."
    },
    {
      id: "back",
      name: "Backend Development",
      badge: "Core #3",
      icon: "server",
      accent_hex: "#10b981",
      desc: "Architect scalable server-side systems, RESTful APIs, and business services.",
      intro: "The services, security pipelines, and logic that run behind every request."
    },
    {
      id: "db",
      name: "Databases & SQL",
      badge: "Core #4",
      icon: "database",
      accent_hex: "#f59e0b",
      desc: "Model, query, index, and safeguard relational and non-relational data.",
      intro: "How data is structured, retrieved, aggregated, and kept trustworthy."
    },
    {
      id: "ai",
      name: "Data Analytics & AI",
      badge: "Core #5",
      icon: "brain",
      accent_hex: "#ec4899",
      desc: "Extract actionable intelligence, train models, and integrate LLM applications.",
      intro: "From raw datasets to machine learning models, visualization, and generative AI."
    },
    {
      id: "cloud",
      name: "Cloud & DevOps",
      badge: "Core #6",
      icon: "cloud",
      accent_hex: "#0284c7",
      desc: "Deploy, containerize, automate, and monitor production infrastructure.",
      intro: "Getting software live, automated, scalable, and resilient in cloud environments."
    },
    {
      id: "sec",
      name: "Cybersecurity",
      badge: "Core #7",
      icon: "shield",
      accent_hex: "#f97316",
      desc: "Identify threats, defend application surfaces, and enforce zero trust.",
      intro: "Spotting risks, protecting critical systems, and preventing data breaches."
    }
  ];

  const insertCore = db.prepare(`
    INSERT OR REPLACE INTO cores (id, name, badge, icon, accent_hex, desc, intro)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of cores) {
    insertCore.run(c.id, c.name, c.badge, c.icon, c.accent_hex, c.desc, c.intro);
  }
  console.log(`✓ Seeded ${cores.length} technical cores.`);

  // 3. Seed Skills & Topics
  const skillsData = [
    // Programming Fundamentals
    { id: "prog_vars", core_id: "prog", name: "Variables, Data Types & Operators", desc: "Store, transform, and evaluate values with appropriate data types.", topics: ["Primitives & References", "Type Coercion", "Logical Operators"] },
    { id: "prog_logic", core_id: "prog", name: "Conditionals & Loops", desc: "Control execution flow, make decisions, and repeat tasks cleanly.", topics: ["Branching Logic", "Iteration Patterns", "Loop Optimization"] },
    { id: "prog_funcs", core_id: "prog", name: "Functions & Scope", desc: "Package logic into reusable, modular units with well-defined boundaries.", topics: ["Closures", "Lexical Scoping", "Pure Functions & Call Stack"] },
    { id: "prog_structs", core_id: "prog", name: "Arrays, Strings & Data Structures", desc: "Organize collections of data so it is fast to search, insert, and update.", topics: ["Array Methods", "Hash Maps & Sets", "Stacks & Queues"] },
    { id: "prog_debug", core_id: "prog", name: "Debugging & Error Handling", desc: "Identify root causes of unexpected states and handle failures gracefully.", topics: ["Try-Catch & Custom Errors", "Call Stack Traces", "Edge Case Defense"] },

    // Frontend Development
    { id: "front_html", core_id: "front", name: "Semantic HTML & Accessibility", desc: "Structure web applications with accessible, meaningful markup.", topics: ["ARIA Landmarks", "Document Hierarchy", "Screen Reader Standards"] },
    { id: "front_css", core_id: "front", name: "CSS Layouts & Responsive Design", desc: "Design fluid interfaces that adapt smoothly to every device.", topics: ["Flexbox & Grid", "Media Queries & Mobile-First", "CSS Variables"] },
    { id: "front_dom", core_id: "front", name: "DOM Manipulation & Event Loop", desc: "Handle user input, keyboard navigation, and dynamic rendering performantly.", topics: ["Event Delegation", "Debounce & Throttle", "Browser Lifecycle"] },
    { id: "front_react", core_id: "front", name: "React Components, Props & State", desc: "Build modular user interfaces from stateful, declarative components.", topics: ["Hook Lifecycle", "State Management", "Component Composition"] },
    { id: "front_async", core_id: "front", name: "API Integration & Async JavaScript", desc: "Communicate with backend servers smoothly without freezing the UI.", topics: ["Promises & Async/Await", "Fetch API", "Optimistic Updates & Errors"] },

    // Backend Development
    { id: "back_rest", core_id: "back", name: "HTTP & REST API Design", desc: "Engineer standardized endpoints following REST principles.", topics: ["Idempotency", "Status Codes & Headers", "Resource URI Design"] },
    { id: "back_routing", core_id: "back", name: "Routing & Request Handling", desc: "Direct incoming traffic through validation and handler pipelines.", topics: ["Middleware Pipelines", "Payload Parsing", "CORS & Headers"] },
    { id: "back_auth", core_id: "back", name: "Authentication & Authorization", desc: "Safeguard endpoints and govern user permissions securely.", topics: ["JWT & Sessions", "OAuth2 & Tokens", "RBAC Permissions"] },
    { id: "back_val", core_id: "back", name: "Input Validation & Error Responses", desc: "Reject malicious payloads and return clear, actionable error structures.", topics: ["Schema Validation", "Sanitization", "Standardized RFC7807 Errors"] },
    { id: "back_test", core_id: "back", name: "Automated API Testing", desc: "Verify endpoint contracts and business logic deterministically.", topics: ["Unit Tests", "Integration Testing", "Mocking & Fixtures"] },

    // Databases and SQL
    { id: "db_rel", core_id: "db", name: "Tables, Keys & Relationships", desc: "Design relational schemas that prevent redundancy and maintain integrity.", topics: ["Primary & Foreign Keys", "1:N and M:N Models", "Normalization 3NF"] },
    { id: "db_crud", core_id: "db", name: "CRUD Operations", desc: "Perform database mutations and retrievals with accuracy.", topics: ["INSERT & Batch", "SELECT with Predicates", "Safe UPDATE & DELETE"] },
    { id: "db_filter", core_id: "db", name: "Filtering, Sorting & Aggregation", desc: "Slice, group, and calculate statistical summaries across datasets.", topics: ["GROUP BY & HAVING", "Window Functions", "Aggregate Functions"] },
    { id: "db_joins", core_id: "db", name: "Joins & Subqueries", desc: "Assemble complex queries joining normalized tables efficiently.", topics: ["INNER vs LEFT JOIN", "Correlated Subqueries", "CTE Common Table Exp."] },
    { id: "db_tx", core_id: "db", name: "Transactions & Data Integrity", desc: "Guarantee consistency even across unexpected system crashes.", topics: ["ACID Properties", "Deadlocks & Isolation Levels", "Foreign Key Cascades"] },

    // Data Analytics and AI
    { id: "ai_clean", core_id: "ai", name: "Data Cleaning & Preprocessing", desc: "Transform noisy raw data into validated, structured datasets.", topics: ["Missing Values", "Outliers", "Feature Encoding"] },
    { id: "ai_viz", core_id: "ai", name: "Exploratory Analysis & Visualization", desc: "Discover hidden patterns and communicate trends visually.", topics: ["Distribution Plots", "Correlation Matrices", "Dashboarding"] },
    { id: "ai_stats", core_id: "ai", name: "Statistics & Interpretation", desc: "Formulate mathematically sound inferences from sample data.", topics: ["Hypothesis Testing", "p-values & Confidence Intervals", "Sampling Bias"] },
    { id: "ai_ml", core_id: "ai", name: "Machine Learning & Evaluation", desc: "Train predictive models and evaluate generalizability.", topics: ["Precision, Recall & F1", "Cross-Validation", "Supervised Classifiers"] },
    { id: "ai_llm", core_id: "ai", name: "LLM Applications & Prompt Evaluation", desc: "Build robust software powered by large language models.", topics: ["Few-Shot Prompting", "RAG Architecture", "Hallucination & Guardrails"] },

    // Cloud and DevOps
    { id: "cloud_linux", core_id: "cloud", name: "Linux Command Line & Shell", desc: "Operate high-performance headless servers and system daemons.", topics: ["File Permissions & chmod", "Pipes, Grep & Awk", "Process Monitoring"] },
    { id: "cloud_net", core_id: "cloud", name: "Networking & DNS", desc: "Direct network traffic securely between clients and distributed nodes.", topics: ["TCP/IP & Ports", "DNS Records (A, CNAME)", "Reverse Proxies & TLS"] },
    { id: "cloud_deploy", core_id: "cloud", name: "Cloud Deployment & Infrastructure", desc: "Provision and configure cloud compute and storage resources.", topics: ["Virtual Machines", "Object Storage & S3", "IAM Security Roles"] },
    { id: "cloud_docker", core_id: "cloud", name: "Containers & Docker", desc: "Package applications with dependencies to run consistently anywhere.", topics: ["Dockerfile Multi-Stage", "Port Forwarding", "Docker Compose"] },
    { id: "cloud_cicd", core_id: "cloud", name: "CI/CD & Monitoring", desc: "Automate test-and-deploy pipelines with real-time observability.", topics: ["GitHub Actions Pipelines", "Healthchecks & Metrics", "Alerting & Logs"] },

    // Cybersecurity
    { id: "sec_threat", core_id: "sec", name: "Threat Recognition & OWASP Top 10", desc: "Identify common vectors and vulnerability patterns in systems.", topics: ["Injection & XSS", "CSRF & Broken Auth", "Threat Modeling"] },
    { id: "sec_iam", core_id: "sec", name: "Identity & Least Privilege", desc: "Ensure humans and services receive only essential permissions.", topics: ["Role Boundaries", "MFA Enforcement", "Principle of Least Privilege"] },
    { id: "sec_web", core_id: "sec", name: "Web Application Security", desc: "Harden browser and API boundaries against exploits.", topics: ["CSP Headers", "CORS Whitelisting", "Input Sanitization"] },
    { id: "sec_logs", core_id: "sec", name: "Log Analysis & Incident Triage", desc: "Detect unauthorized breaches from server and access logs.", topics: ["Audit Log Parsing", "Anomaly Detection", "Incident Runbooks"] },
    { id: "sec_secrets", core_id: "sec", name: "Secrets & Secure Configuration", desc: "Prevent credentials and private certificates from leaking.", topics: ["Environment Variables", "Key Rotation", "Secret Managers"] }
  ];

  const insertSkill = db.prepare(`
    INSERT OR REPLACE INTO skills (id, core_id, name, desc)
    VALUES (?, ?, ?, ?)
  `);

  const insertTopic = db.prepare(`
    INSERT INTO topics (skill_id, name) VALUES (?, ?)
  `);

  db.exec('DELETE FROM topics;');

  for (const s of skillsData) {
    insertSkill.run(s.id, s.core_id, s.name, s.desc);
    for (const t of s.topics) {
      insertTopic.run(s.id, t);
    }
  }
  console.log(`✓ Seeded ${skillsData.length} skills with topics.`);

  // 4. Seed Career Roles & Dynamic Mappings (PRD §8)
  const roles = [
    {
      id: "fe_dev",
      name: "Frontend Developer",
      status: "MVP Priority",
      is_mvp: 1,
      tagline: "Build responsive, accessible, interactive web applications.",
      desc: "Specializes in turning design wireframes into high-performance web experiences with React, semantic HTML, modern CSS, and async API integration.",
      salary: "$75,000 - $115,000",
      hiring_demand: "Very High",
      skills: [
        { skill_id: "prog_vars", name: "Programming Fundamentals", weight: 0.25, min_proficiency: 60, mandatory: 1 },
        { skill_id: "front_react", name: "Frontend Development (React & State)", weight: 0.45, min_proficiency: 70, mandatory: 1 },
        { skill_id: "front_async", name: "API Integration & Async JS", weight: 0.15, min_proficiency: 65, mandatory: 0 },
        { skill_id: "prog_debug", name: "Debugging & Error Handling", weight: 0.15, min_proficiency: 55, mandatory: 0 }
      ]
    },
    {
      id: "be_dev",
      name: "Backend Developer",
      status: "MVP Priority",
      is_mvp: 1,
      tagline: "Architect dependable APIs, databases, and microservices.",
      desc: "Specializes in server-side logic, RESTful architecture, relational database schemas, query optimization, and resilient authentication.",
      salary: "$85,000 - $125,000",
      hiring_demand: "High",
      skills: [
        { skill_id: "prog_funcs", name: "Programming Fundamentals (Logic & Data)", weight: 0.25, min_proficiency: 65, mandatory: 1 },
        { skill_id: "back_rest", name: "Backend Development (REST & Auth)", weight: 0.35, min_proficiency: 70, mandatory: 1 },
        { skill_id: "db_rel", name: "Databases & SQL (CRUD & Joins)", weight: 0.25, min_proficiency: 65, mandatory: 1 },
        { skill_id: "back_test", name: "Automated API Testing", weight: 0.15, min_proficiency: 60, mandatory: 0 }
      ]
    },
    {
      id: "fs_dev",
      name: "Full-Stack Developer",
      status: "MVP Priority",
      is_mvp: 1,
      tagline: "End-to-end engineering from frontend UI to database tables.",
      desc: "Versatile developer who builds responsive user interfaces, connects them to robust backend microservices, and models efficient database schemas.",
      salary: "$90,000 - $135,000",
      hiring_demand: "Very High",
      skills: [
        { skill_id: "prog_vars", name: "Programming Fundamentals", weight: 0.20, min_proficiency: 65, mandatory: 1 },
        { skill_id: "front_react", name: "Frontend Development", weight: 0.30, min_proficiency: 65, mandatory: 1 },
        { skill_id: "back_rest", name: "Backend Development", weight: 0.30, min_proficiency: 65, mandatory: 1 },
        { skill_id: "db_rel", name: "Databases & SQL", weight: 0.20, min_proficiency: 60, mandatory: 1 }
      ]
    },
    {
      id: "py_dev",
      name: "Python Developer",
      status: "Roadmap",
      is_mvp: 0,
      tagline: "Data processing, backend automation, and algorithmic scripting.",
      desc: "Leverages Python for data pipelines, scripting, automation, and backend development.",
      salary: "$80,000 - $120,000",
      hiring_demand: "Steady",
      skills: [
        { skill_id: "prog_structs", name: "Programming Fundamentals", weight: 0.40, min_proficiency: 70, mandatory: 1 },
        { skill_id: "back_rest", name: "Backend Services", weight: 0.35, min_proficiency: 60, mandatory: 1 },
        { skill_id: "db_crud", name: "Databases & SQL", weight: 0.25, min_proficiency: 60, mandatory: 0 }
      ]
    },
    {
      id: "da_dev",
      name: "Data Analyst",
      status: "Roadmap",
      is_mvp: 0,
      tagline: "Translate complex business numbers into visual insights.",
      desc: "Extracts data using advanced SQL, cleans messy records, and visualizes trends for stakeholders.",
      salary: "$70,000 - $105,000",
      hiring_demand: "High",
      skills: [
        { skill_id: "db_filter", name: "Databases & SQL Aggregations", weight: 0.50, min_proficiency: 75, mandatory: 1 },
        { skill_id: "ai_viz", name: "Exploratory Data Analysis", weight: 0.35, min_proficiency: 65, mandatory: 1 },
        { skill_id: "ai_stats", name: "Statistical Reasoning", weight: 0.15, min_proficiency: 55, mandatory: 0 }
      ]
    },
    {
      id: "ai_dev",
      name: "AI Application Developer",
      status: "Roadmap",
      is_mvp: 0,
      tagline: "Build next-generation applications powered by LLMs and RAG.",
      desc: "Integrates frontier LLMs, handles vector embeddings, manages prompts, and prevents hallucinations.",
      salary: "$95,000 - $150,000",
      hiring_demand: "Surging",
      skills: [
        { skill_id: "ai_llm", name: "LLM Applications & Prompting", weight: 0.40, min_proficiency: 75, mandatory: 1 },
        { skill_id: "back_rest", name: "Backend API Pipelines", weight: 0.35, min_proficiency: 65, mandatory: 1 },
        { skill_id: "db_rel", name: "Relational & Vector Data", weight: 0.25, min_proficiency: 60, mandatory: 0 }
      ]
    }
  ];

  const insertRole = db.prepare(`
    INSERT OR REPLACE INTO career_roles (id, name, status, is_mvp, tagline, desc, salary, hiring_demand)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMapping = db.prepare(`
    INSERT INTO role_skill_mappings (role_id, skill_id, name, weight, min_proficiency, mandatory)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  db.exec('DELETE FROM role_skill_mappings;');

  for (const r of roles) {
    insertRole.run(r.id, r.name, r.status, r.is_mvp, r.tagline, r.desc, r.salary, r.hiring_demand);
    for (const m of r.skills) {
      insertMapping.run(r.id, m.skill_id, m.name, m.weight, m.min_proficiency, m.mandatory);
    }
  }
  console.log(`✓ Seeded ${roles.length} career roles with relational skill weights.`);

  // 5. Seed Assessments (Knowledge, Practical, Gamified)
  const assessments = [
    {
      id: "ass_k_prog_1",
      skill_id: "prog_vars",
      type: "knowledge",
      title: "JavaScript Reference vs Primitive Equality",
      scenario: "What is the evaluated output of the following JavaScript expression?\n\nconst a = [1, 2];\nconst b = [1, 2];\nconsole.log(a == b, a === b);",
      instructions_json: JSON.stringify([
        "Evaluate memory address comparison for reference objects."
      ]),
      starter_code: null,
      tests_json: null,
      time_limit: 120,
      answer_key_json: JSON.stringify({
        correct_index: 1,
        options: [
          { text: "true true", isCorrect: false, explanation: "Arrays are reference types stored at distinct memory addresses." },
          { text: "false false", isCorrect: true, explanation: "Correct! Distinct objects hold distinct memory references." },
          { text: "true false", isCorrect: false, explanation: "Loose equality (==) does not deep-compare arrays." },
          { text: "TypeError", isCorrect: false, explanation: "Valid syntax returning boolean." }
        ]
      })
    },
    {
      id: "ass_k_front_1",
      skill_id: "front_react",
      type: "knowledge",
      title: "React useEffect Dependency Management",
      scenario: "Why should you avoid omitting state variables used inside a useEffect dependency array?",
      instructions_json: JSON.stringify(["Explain stale closure behavior."]),
      starter_code: null,
      tests_json: null,
      time_limit: 120,
      answer_key_json: JSON.stringify({
        correct_index: 1,
        options: [
          { text: "It causes an immediate compile-time syntax error", isCorrect: false, explanation: "Compiles without error, though linter warns." },
          { text: "The effect closure will capture stale state values across renders", isCorrect: true, explanation: "Correct! Omitted dependencies cause stale-closure bugs." },
          { text: "React will automatically unmount the component", isCorrect: false, explanation: "Component keeps rendering with outdated state." },
          { text: "It doubles memory consumption", isCorrect: false, explanation: "Memory is unaffected; data staleness is the defect." }
        ]
      })
    },
    {
      id: "ass_p_prog_1",
      skill_id: "prog_vars",
      type: "practical",
      title: "Input Validation & Data Sanitizer",
      scenario: "Write a function sanitizeUserPayload(user) that validates and normalizes an incoming user profile.",
      instructions_json: JSON.stringify([
        "Return: { valid: boolean, sanitized: object | null, errors: string[] }",
        "Field 'name' must be trimmed string with length >= 2.",
        "Field 'age' must be integer between 18 and 120. If invalid, add 'Invalid age' to errors.",
        "Field 'email' must contain '@' and '.' and be lowercased."
      ]),
      starter_code: `function sanitizeUserPayload(user) {
  const errors = [];
  
  if (!user || typeof user.name !== 'string' || user.name.trim().length < 2) {
    errors.push('Invalid name');
  }
  
  const age = Number(user.age);
  if (!Number.isInteger(age) || age < 18 || age > 120) {
    errors.push('Invalid age');
  }
  
  if (!user.email || !user.email.includes('@') || !user.email.includes('.')) {
    errors.push('Invalid email');
  }

  if (errors.length > 0) {
    return { valid: false, sanitized: null, errors };
  }
  
  return {
    valid: true,
    sanitized: {
      name: user.name.trim(),
      age: age,
      email: user.email.trim().toLowerCase()
    },
    errors: []
  };
}`,
      tests_json: JSON.stringify([
        {
          name: "Valid user object",
          input: { name: "  alice dev  ", age: 24, email: "Alice@Example.COM" },
          expected: { valid: true, sanitized: { name: "alice dev", age: 24, email: "alice@example.com" } }
        },
        {
          name: "Rejects underage user",
          input: { name: "Bob", age: 16, email: "bob@test.com" },
          expected: { valid: false }
        },
        {
          name: "Rejects malformed email",
          input: { name: "Charlie", age: 30, email: "invalid-email" },
          expected: { valid: false }
        }
      ]),
      time_limit: 300,
      answer_key_json: null
    },
    {
      id: "ass_g_bug_1",
      skill_id: "prog_logic",
      type: "gamified",
      title: "Bug Hunter: The Off-By-One Tax Glitch",
      scenario: "An e-commerce customer reported that the cart calculates tax on all items EXCEPT the last one in the cart. Fix the loop condition!",
      instructions_json: JSON.stringify(["Repair the terminating condition so all items are summed."]),
      starter_code: `function calculateCartTax(cartItems, taxRate) {
  let subtotal = 0;
  // BUG: Inspect this loop condition carefully!
  for (let i = 0; i < cartItems.length - 1; i++) {
    subtotal += cartItems[i].price * cartItems[i].qty;
  }
  const tax = Number((subtotal * taxRate).toFixed(2));
  return { subtotal, tax, total: subtotal + tax };
}`,
      tests_json: JSON.stringify([
        {
          name: "3 items tax calculation",
          input: [[{ price: 10, qty: 1 }, { price: 20, qty: 2 }, { price: 15, qty: 1 }], 0.10],
          expected: { subtotal: 65, tax: 6.5, total: 71.5 }
        }
      ]),
      time_limit: 180,
      answer_key_json: null
    }
  ];

  const insertAssessment = db.prepare(`
    INSERT OR REPLACE INTO assessments (
      id, skill_id, type, title, scenario, instructions_json, starter_code, tests_json, time_limit, answer_key_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const a of assessments) {
    insertAssessment.run(
      a.id, a.skill_id, a.type, a.title, a.scenario,
      a.instructions_json, a.starter_code, a.tests_json, a.time_limit, a.answer_key_json
    );
  }
  console.log(`✓ Seeded ${assessments.length} challenge templates.`);

  // 6. Seed Targeted Learning Resources (PRD §11)
  const resources = [
    {
      id: "lr_1",
      skill_id: "front_react",
      title: "Mastering React Component State & Side Effects",
      type: "Interactive Guide",
      duration: "12 min",
      difficulty: "Intermediate",
      summary: "Deep dive into useState, useEffect cleanup routines, and state lifting patterns to prevent re-render loops.",
      content: "When state changes in React, the component re-executes. Learn how lifting state up and using proper dependency arrays in useEffect prevents infinite fetches and synchronization bugs."
    },
    {
      id: "lr_2",
      skill_id: "back_rest",
      title: "Designing Predictable & Idempotent REST APIs",
      type: "Architecture Document",
      duration: "15 min",
      difficulty: "Intermediate",
      summary: "Understanding safe HTTP methods (GET, HEAD), idempotency in PUT and DELETE, and standardized RFC 7807 problem details.",
      content: "An idempotent HTTP method can be executed multiple times with identical results on the server. POST is generally non-idempotent, whereas PUT replaces the target entity entirely."
    },
    {
      id: "lr_3",
      skill_id: "db_rel",
      title: "Relational Modeling, Foreign Keys & Cascading",
      type: "Code Walkthrough",
      duration: "10 min",
      difficulty: "Foundational",
      summary: "How 1-to-many and many-to-many relationship tables prevent duplicate data and guarantee referential integrity.",
      content: "Foreign key constraints stop orphaned records from polluting your database. When designing join tables for many-to-many relations, use composite primary keys or unique index pairs."
    },
    {
      id: "lr_4",
      skill_id: "prog_vars",
      title: "Deep Equality vs Reference Equality in JavaScript",
      type: "Coding Exercise",
      duration: "8 min",
      difficulty: "Foundational",
      summary: "Why `[] === []` is false, how object pointers behave in memory, and techniques for immutability.",
      content: "Primitives are compared by value; objects, arrays, and functions are compared by memory reference pointer. Creating a new copy ensures clean state flow in modern frameworks."
    }
  ];

  const insertResource = db.prepare(`
    INSERT OR REPLACE INTO learning_resources (
      id, skill_id, title, type, duration, difficulty, summary, content
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const res of resources) {
    insertResource.run(res.id, res.skill_id, res.title, res.type, res.duration, res.difficulty, res.summary, res.content);
  }
  console.log(`✓ Seeded ${resources.length} learning resources.`);

  // 7. Seed Initial Evidence for Demo User (PRD §12.1)
  const initialEvidence = [
    { skill_id: "prog_vars", k: 80, a: 75, r: 70, p: 76, conf: "Medium", att: 2 },
    { skill_id: "prog_logic", k: 70, a: 80, r: 65, p: 74, conf: "Medium", att: 2 },
    { skill_id: "front_react", k: 65, a: 60, r: 70, p: 64, conf: "Low (Preliminary)", att: 1 },
    { skill_id: "back_rest", k: 75, a: 70, r: 65, p: 71, conf: "Medium", att: 2 },
    { skill_id: "db_rel", k: 50, a: 45, r: 50, p: 48, conf: "Low (Preliminary)", att: 1 }
  ];

  const insertEvidence = db.prepare(`
    INSERT OR REPLACE INTO user_skill_progress (
      user_id, skill_id, p_score, k_score, a_score, r_score, confidence, attempts
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ev of initialEvidence) {
    insertEvidence.run(userId, ev.skill_id, ev.p, ev.k, ev.a, ev.r, ev.conf, ev.att);
  }

  // Seed Learning completion (stored separately!)
  db.prepare(`INSERT OR IGNORE INTO user_learning_progress (user_id, resource_id) VALUES (?, ?)`).run(userId, 'lr_1');
  db.prepare(`INSERT OR IGNORE INTO user_learning_progress (user_id, resource_id) VALUES (?, ?)`).run(userId, 'lr_4');

  // Seed Assessment attempt history
  db.prepare(`
    INSERT OR REPLACE INTO assessment_attempts (
      id, user_id, assessment_id, skill_id, type, k_score, a_score, r_score, p_score, passed, ai_feedback
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'att_101',
    userId,
    'ass_k_front_1',
    'front_react',
    'Knowledge Assessment',
    65, 60, 70, 64, 1,
    'Understands component lifecycle. Recommended next action: practical exercise on dependency arrays.'
  );

  console.log("✓ Initial user skill evidence & learning progress seeded.");
  console.log("Database seed completed successfully!\n");
}

if (require.main === module) {
  seed();
}

module.exports = { seed };

