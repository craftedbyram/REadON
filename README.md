# REadON – Full-Stack Technical Skill Platform

> *"Know your skills. Build your future."*  
> **Version 1.0 (Full-Fledged Implementation of the REadON Product Requirements Document)**

---

## 🌟 Overview

**REadON** is an AI-powered, assessment-first skill discovery and career development platform for engineering careers. Unlike conventional course platforms that assume users are beginners and confuse course completion with actual ability, REadON measures demonstrated ability through **knowledge questions**, **automated in-browser code sandboxes**, and **gamified engineering simulations**.

---

## 🎯 Core-First Practical Assessment Workflow (No Generic MCQs!)

Unlike platforms that immediately subject users to multiple-choice quizzes, REadON features an assessment-first discovery flow:

1. **Step 1: Choose Your Technical Core**:
   * Users select from the 7 Cores: *Programming Fundamentals*, *Frontend Development*, *Backend Development*, *Databases & SQL*, *Data Analytics & AI*, *Cloud & DevOps*, or *Cybersecurity*.
2. **Step 2: Hands-on Practical Task (Not an MCQ!)**:
   * The AI delivers a real-world coding challenge with a concrete production scenario, technical requirements, starter code, and automated unit test assertions.
   * Student code executes in a sandboxed runtime environment.
3. **Step 3: AI Career Role Diagnosis & Scoring**:
   * Evaluates demonstrated code quality and test pass rates using $P = 0.30K + 0.50A + 0.20R$.
   * **Identifies Best-Fit Career Role**: Matches evidence against roles (*Frontend Developer, Backend Developer, Full-Stack Developer, Data Analyst*, etc.).
4. **Step 4: Tailored Core Learning Roadmap**:
   * Pinpoints specific skill gaps on the tested core and provides an ordered learning roadmap to achieve production readiness.

---

## 🏗️ Architecture & Technology Stack

The project is architected according to **PRD Section 16 & 17**:

| Layer | Technology | Key Responsibility |
|---|---|---|
| **Frontend** | Modern HTML5, ES6 Modules, Tailwind CSS, Lucide Icons | Responsive SPA with Dashboard, Radar/Gauges, Code Editor, Results, and Roadmaps. |
| **Backend API** | Node.js (v24), HTTP Server, REST Router | Auth, session tokens, scoring engine, catalogue routing, rate limits. |
| **Database** | SQLite via built-in `node:sqlite` | Relational tables, foreign keys, migrations, and audit trails with zero external dependencies. |
| **AI Gateway** | OpenRouter AI Service (`openrouter.ai`) | Server-side LLM calls (`google/gemini-2.0-flash-lite:free`), with automatic failover to **NVIDIA Nemotron** (`nvidia/llama-3.1-nemotron-70b-instruct`), question generation, rubric evaluations. API key kept on backend. |
| **Code Execution** | Isolated Child-Process Sandbox (`node:child_process`) | Safe execution of student code with CPU, memory, and timeout bounds. |

---

## 🚀 Quickstart Guide

### 1. Run the Full-Stack Server
To boot the full-stack application (Backend API + SQLite Database + Frontend):
```bash
npm start
```
* **Web Application:** `http://localhost:3000`
* **REST API Root:** `http://localhost:3000/api/v1`

### 2. Run Integration Tests
To verify all REST API endpoints and sandbox code execution:
```bash
npm test
```

### 3. Standalone Mode (Zero Server Setup)
If you prefer to run REadON without launching a terminal server, double-click [`REadON.html`](file:///c:/Users/Asus/Desktop/Promt/REadON.html) to open the fully functional, self-contained client in any browser.

---

## 📊 Core Mathematical Scoring Formulas

### 1. Skill Proficiency ($P$) – PRD §12.1
$$\mathbf{P = 0.30K + 0.50A + 0.20R}$$
* **$K$ (Knowledge Performance, 30%)**: Deterministic conceptual multiple-choice and code output predictions.
* **$A$ (Applied Performance, 50%)**: Practical coding challenges evaluated against automated unit test suites.
* **$R$ (Reasoning Performance, 20%)**: Bug hunting diagnostic speed and qualitative explanation.

### 2. Role Readiness & Alignment – PRD §12.3
$$\mathbf{\text{Role Readiness} = \sum (\text{Skill Score} \times \text{Role Weight})}$$
* **Critical Deficit Protection**: If any mandatory skill (e.g. React for Frontend, or SQL for Backend) falls below the required threshold, the platform surfaces a **Critical Skill Gap Alert**. High overall averages cannot substitute for mandatory core competencies.

### 3. Separation of Learning vs Proficiency – PRD §6.7 & §11
Learning resource completion is recorded independently from verified skill proficiency. Completing a tutorial increments learning completion, but **proficiency only updates when the user completes an assessment verification challenge**.

---

## 📡 REST API Reference (PRD §17)

All endpoints accept and return `application/json`:

### Authentication & Profile
* `POST /api/v1/auth/register` – Create new user account.
* `POST /api/v1/auth/login` – Authenticate credentials and receive session token.
* `GET  /api/v1/auth/me` – Retrieve current user profile and stats.

### Catalogues & Mappings
* `GET  /api/v1/cores` – List all 7 technical cores with associated skills.
* `GET  /api/v1/cores/:core_id` – Inspect a specific core and granular topics.
* `GET  /api/v1/roles` – Retrieve career roles with salary, status, and weights.
* `GET  /api/v1/roles/:role_id` – Get role readiness and mandatory gap breakdown.
* `GET  /api/v1/roles/:role_id/skills` – List required skills and weights for a role.

### Assessments & Sandboxed Submissions
* `POST /api/v1/assessments/start` – Fetch challenge scenario and starter code.
* `POST /api/v1/assessments/generate` – Dynamically draft a challenge using OpenRouter AI.
* `POST /api/v1/submissions` – Execute code in an isolated sandbox and return $P$-score.
* `GET  /api/v1/assessments/:attempt_id/results` – Retrieve attempt audit result.

### Progress & Career Roadmaps
* `GET  /api/v1/progress` – Retrieve user skill evidence ledger and confidence ratings.
* `GET  /api/v1/recommendations` – Next-step recommendations based on mandatory gaps.
* `GET  /api/v1/learning-path` – Targeted learning resources mapped to diagnosed gaps.
* `POST /api/v1/learning/:resource_id/complete` – Mark resource studied.
* `GET  /api/v1/history` – Complete audit log of all assessment attempts.

---

## 🔒 Security & AI Boundaries (PRD §15 & §18)

1. **Backend-Only AI Gateway**: OpenRouter API key is stored securely in `.env` and accessed strictly by backend services. The browser client never touches frontier AI credentials.
2. **Deterministic Grading First**: Objective answer keys and automated test suites handle grading; LLMs only provide qualitative rubric explanations.
3. **Subprocess Sandbox**: Student code is executed inside an isolated worker process with strict memory and CPU runtime timeouts, protecting the main server process from infinite loops or malicious inputs.
4. **Password Hashing**: Passwords salted and hashed with Node.js crypto `scrypt`.

---

© 2026 REadON Engineering. Built per Product Requirements Document v1.0.

