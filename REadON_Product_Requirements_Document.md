**REadON**

**PRODUCT REQUIREMENTS DOCUMENT**

*Know your skills. Build your future.*

**Version 1.0  
**14 November 2026  
Product concept, requirements, MVP scope, and technical direction

# Document Guide

This document explains the REadON product idea in plain language and provides a shared reference for product, design, engineering, and future collaborators.

In one sentence: REadON assesses what a person can do, identifies what they should improve, and helps them understand which technology careers align with their demonstrated skills.

Status: Product definition and proposed MVP requirements. Technical choices and scoring formulas are initial recommendations and should be validated during implementation.

# 1. Executive Summary

REadON is an AI-powered skill assessment and career development platform for people interested in technology careers. It helps users understand what they already know, demonstrate their abilities through different types of challenges, identify skill gaps, and discover practical next steps for learning and career development.

Unlike platforms that begin by asking users to complete courses, REadON begins with assessment. A user chooses a technical area or career role, completes a suitable mix of knowledge questions, practical tasks, and interactive challenges, and receives an evidence-based view of their current skills. REadON then recommends learning resources and career paths based on the user's demonstrated abilities and goals.

The product will use AI to create and explain selected learning and assessment content. Deterministic software, automated tests, and explicit scoring rules will handle objective grading wherever possible. AI will support explanations and open-ended feedback, rather than being the sole authority for every score.

Initial MVP focus: Frontend Developer, Backend Developer, and Full-Stack Developer pathways. The platform architecture should make it possible to add more roles and technical domains later.

# 2. Product Vision and Positioning

Vision: Help people make better technology-career decisions by turning skills into visible, understandable evidence.

Positioning: An assessment-first, AI-assisted skill discovery and career development platform.

Suggested tagline: “Know your skills. Build your future.”

Core promise: REadON does not assume that a user is a beginner. It first tries to discover the user's current ability, then recommends learning and practice that address the gaps.

# 3. Problem Statement

People exploring IT careers often face several problems:

- Uncertainty about which technical skills they actually possess.
- Difficulty understanding what a particular job role expects.

- Course platforms often encourage users to start from the beginning, even when they already know some topics.
- Course completion is easily confused with real skill proficiency.

- Learning resources, coding practice, quizzes, and career information are spread across many different platforms.
- Career recommendations may be generic and may not explain why a role is suitable or what gaps remain.

REadON addresses these problems by connecting assessment, skill tracking, learning recommendations, and career exploration in one coherent experience.

# 4. Goals and Non-Goals

## 4.1 Product goals

- Help users assess existing knowledge and practical ability across selected technical skills.
- Map technical roles to the cores and skills required to perform them.

- Generate or select assessments appropriate to a user's role, skill level, and previous evidence.
- Track skill proficiency separately from learning completion.

- Identify strengths, weaknesses, and important skill gaps.
- Recommend learning materials and practice activities based on measured gaps.

- Explain career-role recommendations with evidence, gaps, and alternative paths.
- Provide a clear, motivating dashboard and a useful assessment history.

## 4.2 Non-goals for the first MVP

- Guaranteeing employment, placement, salary, or job success.
- Claiming that a readiness percentage is the probability of getting hired.

- Replacing a university degree, professional certification, or employer interview.
- Launching a full course marketplace or building every learning resource from scratch.

- Supporting every IT role with deep assessment coverage on day one.
- Allowing an LLM to execute untrusted code or independently determine every objective score.

# 5. Target Users and Personas

| **Persona**          | **Need**                                                             | **How REadON helps**                                                                        |
|----------------------|----------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| Beginner / explorer  | Understand where to start and which IT roles exist.                  | Introduces cores and roles, then uses entry-level assessments to discover a starting point. |
| College student      | Measure current skills, prepare for internships, and plan learning.  | Shows strengths, gaps, practical evidence, and a focused learning roadmap.                  |
| Fresher / job seeker | Understand role requirements and prepare for technical screening.    | Maps role expectations to skills and provides targeted practice.                            |
| Working professional | Evaluate existing skills and explore a transition or specialization. | Assesses selected skills and highlights transferable strengths and gaps.                    |

# 6. Product Concepts and Information Architecture

## 6.1 Core

A Core is a broad technical knowledge area. Each core contains skills, and each skill can be divided into topics. For example, Backend Development is a core; REST API design is a skill; HTTP methods and status codes are topics.

## 6.2 Skill

A Skill is a capability that can be assessed and tracked over time. Skills should be reusable across multiple roles. For example, SQL may be relevant to Backend Developer, Full-Stack Developer, and Data Analyst roles.

## 6.3 Topic

A Topic is a smaller learning or assessment unit within a skill. Topics make it possible to identify precise knowledge gaps rather than reporting only a broad skill score.

## 6.4 Career role

A Career Role is a job family with a defined set of required cores and skills. Each role should have a description, expected skill levels, skill weights, and any mandatory skills.

## 6.5 Assessment

An Assessment is a structured attempt to measure one or more skills. It can contain knowledge questions, practical tasks, and interactive challenges.

## 6.6 Learning resource

A Learning Resource is material or an activity that helps a user improve a skill. It may be a short explanation, code example, interactive exercise, video, document, guided project, or revision activity.

## 6.7 Important product distinction

Skill proficiency and learning completion must be stored and displayed separately. Completing all lessons does not automatically mean a user is proficient. Proficiency must be supported by assessment evidence.

# 7. Initial Technical Cores and Skills

| **Core**                 | **Initial skills / topics**                                                                                                                                  |
|--------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Programming Fundamentals | Variables and data types; operators; conditionals and loops; functions and scope; arrays and strings; basic data structures; debugging and error handling.   |
| Frontend Development     | Semantic HTML; CSS layouts and responsive design; JavaScript DOM and events; React components, props and state; API integration and asynchronous JavaScript. |
| Backend Development      | HTTP and REST API design; routing and request handling; authentication and authorization; input validation and error responses; automated API testing.       |
| Databases and SQL        | Tables, keys and relationships; CRUD; filtering, sorting and aggregation; joins and subqueries; transactions and data integrity.                             |
| Data Analytics and AI    | Data cleaning; exploratory analysis and visualization; basic statistics; ML fundamentals and evaluation; LLM application fundamentals and output evaluation. |
| Cloud and DevOps         | Linux command line; networking and DNS; cloud deployment and configuration; Docker; CI/CD and monitoring.                                                    |
| Cybersecurity            | Threat recognition; identity and least privilege; web application security; log analysis and incident triage; secrets management and secure configuration.   |

The seven cores form the broader product taxonomy. For the first MVP, the most complete assessment experiences should be built around Programming Fundamentals, Frontend Development, Backend Development, and Databases and SQL. The remaining cores can be introduced progressively.

# 8. Career Roles and Role-to-Skill Mapping

A role is not a separate copy of a core. Roles reuse shared skills through database mappings. This allows one skill assessment to contribute evidence to more than one role.

| **Role**                  | **Core / skill emphasis**                                                                   | **MVP priority** |
|---------------------------|---------------------------------------------------------------------------------------------|------------------|
| Frontend Developer        | Programming Fundamentals + Frontend Development; selected API and browser concepts.         | MVP              |
| Backend Developer         | Programming Fundamentals + Backend Development + Databases and SQL; testing and API design. | MVP              |
| Full-Stack Developer      | Programming Fundamentals + Frontend + Backend + SQL.                                        | MVP              |
| Python Developer          | Programming Fundamentals + Backend Development + SQL.                                       | Later            |
| Software Developer        | Programming Fundamentals + problem solving + role-specific technical skills.                | Later            |
| Data Analyst              | Databases and SQL + Data Analytics and AI.                                                  | Later            |
| AI Application Developer  | Programming + Backend + SQL + AI application skills.                                        | Later            |
| AI Engineer / ML Engineer | Programming + Data Analytics and AI + deployment and evaluation skills.                     | Later            |
| Data Engineer             | Programming + SQL + data processing + Cloud and DevOps.                                     | Later            |
| Cloud / DevOps Engineer   | Cloud and DevOps + Programming + selected Security skills.                                  | Later            |
| Cybersecurity Analyst     | Cybersecurity + Linux and networking fundamentals.                                          | Later            |

For each role, administrators should be able to define required skills, importance weights, expected proficiency levels, and mandatory skills. Role mappings must be editable without changing application code.

# 9. Assessment Experience

## 9.1 Assessment-first flow

1.  User signs in and completes a lightweight profile.
2.  User explores technical cores or selects a career role.

3.  REadON displays the skills expected for that selection.
4.  User starts a baseline assessment or chooses a specific skill to assess.

5.  The system selects or generates a suitable challenge based on the skill, topic, difficulty, and previous evidence.
6.  User answers questions, completes a practical task, or plays an interactive challenge.

7.  The platform evaluates the submission using the appropriate evaluation method.
8.  Results update the user's skill evidence and assessment history.

9.  REadON explains strengths and gaps and recommends the next useful activity.

## 9.2 Assessment types

| **Assessment type** | **Examples**                                                               | **Preferred evaluation**                                                                  |
|---------------------|----------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| Knowledge questions | MCQ, true/false, output prediction, short explanation, scenario questions. | Deterministic answer keys for objective items; rubric-assisted review for open responses. |
| Practical tasks     | Write or debug code, write SQL, design an API, fix a frontend interaction. | Automated tests, static checks, task-specific criteria, and sandboxed execution.          |
| Gamified challenges | Bug Hunter, SQL Detective, Deployment Rescue, Security Investigator.       | Explicit game rules, task completion criteria, test results, and recorded evidence.       |

## 9.3 Example challenge

A Backend Development challenge could ask a user to design a REST endpoint for creating a task. The challenge should include a title, context, instructions, expected request and response behavior, test cases, difficulty, time guidance, and evaluation criteria.

## 9.4 Adaptive difficulty

Challenge difficulty should consider current proficiency, confidence in the evidence, recent performance, topic coverage, and the user's learning objective. Illustrative bands can be used as an initial heuristic: below 30 may trigger foundational practice; 30–50 basic practice; 50–70 intermediate work; 70–85 more complex tasks; above 85 advanced challenges. These are starting rules, not scientifically validated cut-offs, and should be tuned using real assessment data.

# 10. Gamification and Challenge Concepts

Gamification should make practice engaging while still measuring meaningful ability. Rewards must reflect demonstrated performance, not simply clicking through content.

| **Game / challenge**  | **Core concept**         | **Example activity**                                                                        |
|-----------------------|--------------------------|---------------------------------------------------------------------------------------------|
| Bug Hunter            | Programming Fundamentals | Find and repair a bug in a short program, then explain why it failed.                       |
| Rebuild the Interface | Frontend Development     | Fix or recreate a small interactive page using HTML, CSS, and JavaScript.                   |
| Restore the Service   | Backend Development      | Repair API endpoints until they pass the provided tests.                                    |
| SQL Detective         | Databases and SQL        | Query a dataset to identify duplicates, missing records, or suspicious patterns.            |
| Data Detective        | Data Analytics and AI    | Clean a dataset, find a pattern, and judge whether an AI-generated conclusion is supported. |
| Deployment Rescue     | Cloud and DevOps         | Diagnose a simulated deployment or application failure.                                     |
| Security Investigator | Cybersecurity            | Inspect simulated logs and identify a suspicious event or configuration weakness.           |

Potential engagement features include XP, skill badges, daily challenges, streaks, levels, achievements, progress maps, and larger “boss challenges”. Rewards should be tied to quality, correctness, improvement, and consistency.

# 11. Learning Hub and Recommendations

REadON should recommend learning after it has evidence about what the user needs. It should not force every user to follow a fixed beginner course.

- Show the exact skill or topic gap behind each recommendation.
- Offer a suitable resource type: explanation, example, exercise, video, document, revision, or guided project.

- Allow users to skip content they already understand and take a verification assessment.
- Recommend practice after learning, so completion can be tested.

- Track learning completion separately from proficiency.
- Prioritize recommendations by role relevance, skill gap, prerequisites, and user goals.

The initial Learning Hub can curate external or administrator-approved resources rather than building a large content library before the assessment experience is validated.

# 12. Skill Intelligence, Scoring, and Career Readiness

## 12.1 Skill proficiency

Each skill should have a proficiency score, a confidence indicator, and a record of supporting evidence. One strong quiz result should not automatically establish advanced practical ability.

An illustrative skill score is: P = 0.30K + 0.50A + 0.20R, where K is knowledge performance, A is applied/practical performance, and R is reasoning or explanation performance. Weights should be configurable by skill; not every skill needs the same mix.

## 12.2 Confidence in the score

Confidence should reflect the amount, variety, consistency, and recency of evidence. A score based on several different tasks over time should be treated as more reliable than a score based on one short quiz. The UI should avoid presenting uncertain estimates as exact facts.

## 12.3 Role readiness

Role readiness is a measure of how closely a user's demonstrated skills align with the defined skill requirements for a role. An illustrative weighted calculation is: Role Readiness = sum of (skill score × role weight). For example, a Backend role could weight Programming at 25%, Backend at 35%, SQL at 25%, and Testing at 15%.

The result must be labelled as skill alignment or role readiness, not as a probability of being hired. Mandatory skill gaps should be displayed separately so a high average cannot hide a critical missing skill.

## 12.4 Explainable recommendations

- Why the role was recommended.
- Which demonstrated strengths support the recommendation.

- Which required skills are missing or below the expected level.
- What the user can do next to improve alignment.

- Alternative roles that may better match the user's current evidence.

# 13. User Journey and Main Screens

| **Screen**             | **Purpose / key content**                                                                       |
|------------------------|-------------------------------------------------------------------------------------------------|
| Landing and onboarding | Explain REadON, register or sign in, collect basic goals and experience.                        |
| Dashboard              | Skill overview, recent activity, suggested next step, role alignment, and learning progress.    |
| Explore Cores          | Browse the seven technical cores and inspect their skills and topics.                           |
| Career Roles           | Explore role descriptions, required skills, weights, and expected proficiency.                  |
| Assessment interface   | Display question/task instructions, progress, timer where appropriate, and submission controls. |
| Assessment results     | Show score, evidence, explanations, strengths, gaps, and recommended next action.               |
| My Skills              | Show proficiency, confidence, evidence history, and skill-level details.                        |
| Learning Hub           | Show targeted learning resources and learning completion.                                       |
| Career Roadmap         | Show role-alignment gaps and an ordered set of suggested actions.                               |
| Assessment History     | Show past attempts, dates, results, and changes over time.                                      |
| Settings and profile   | Manage profile, interests, experience, language preference, and account settings.               |

The navigation should remain simple. The MVP should prioritize Dashboard, Explore Cores, Career Roles, Assessment, Results, My Skills, and Learning Hub.

# 14. Functional Requirements

## 14.1 Authentication and profile

- Users can register, sign in, sign out, and reset credentials.
- Users can manage a profile with experience level, interests, career goals, and preferred language.

- Protected user data must be accessible only to the authenticated user and authorized administrators.

## 14.2 Core, role, skill, and topic management

- Users can browse cores, skills, topics, and career roles.
- Users can inspect the skills required by a role.

- Administrators can create, edit, publish, archive, and map cores, roles, skills, and topics.
- Mappings and weights must be stored in the database, not hardcoded into application logic.

## 14.3 Assessment and submission

- Users can start an assessment for a role, core, skill, or topic.
- The system can select or generate challenges at an appropriate difficulty.

- Users can save or submit answers and code according to the assessment rules.
- Each attempt records the challenge version, rubric version, submission, evaluation, and timestamp.

- Users can view past attempts and feedback.

## 14.4 Progress and recommendations

- The system updates skill evidence after a valid evaluation.
- The system keeps learning completion separate from proficiency.

- Users can view strengths, gaps, confidence, and skill trends.
- The system recommends relevant resources and next assessments.

- Career recommendations include reasons, gaps, and alternative paths.

## 14.5 Administration

- Administrators can manage users and content according to role permissions.
- Administrators can review AI-generated assessment templates before publishing them.

- Administrators can manage rubrics, test cases, role mappings, and resource links.
- Administrators can monitor content quality, failed assessments, and system usage.

# 15. AI Strategy and OpenRouter Integration


The initial AI provider will be OpenRouter using free model access. The application should keep its AI layer provider-independent so another model provider can be introduced later without rewriting assessment and career logic.

## 15.1 Logical AI components

| **Component**        | **Responsibility**                                                                      | **Control / boundary**                                                                       |
|----------------------|-----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| Assessment Generator | Draft questions, scenarios, and challenge instructions from approved skill definitions. | Validate output against schemas; review templates and reject ambiguous or incorrect content. |
| AI Evaluator         | Explain open-ended answers and provide rubric-based qualitative feedback.               | Do not use it as the only grader for objective answers or executable code.                   |
| Skill Analyzer       | Summarize patterns in already-computed assessment evidence.                             | Python/business rules calculate scores; AI may help explain the result.                      |
| Career Advisor       | Explain role matches, skill gaps, and possible next steps.                              | Recommendations must be grounded in role mappings and measured skill data.                   |

## 15.2 Recommended task allocation

- Use an LLM to draft MCQs, scenarios, coding prompts, and learning explanations.
- Use answer keys and Python rules to grade objective questions.

- Use automated tests and a secure execution sandbox to evaluate code.
- Use a rubric and AI-assisted feedback for open-ended reasoning, with human review for high-impact or disputed outcomes.

- Use Python to calculate proficiency, confidence, and role alignment.
- Use database mappings and deterministic rules to shortlist career roles; use AI to explain the shortlist in plain language.

## 15.3 Free-model considerations

- Free model availability, response speed, quality, context length, and feature support can vary.
- Use a dynamic free router for early experiments, then benchmark and pin a suitable model for important workflows when consistency matters.

- Design for request limits and occasional provider failures. Batch related question generation where appropriate and cache reusable content.
- Validate every model response with Pydantic or equivalent schema validation. Retry safely or fall back to a non-AI path when output is invalid.

- Do not configure paid fallbacks if the project must remain free-only.
- Keep the OpenRouter API key on the backend. Never expose it in frontend code or commit it to source control.

## 15.4 Prompt and content safety

- Treat user submissions and retrieved content as untrusted input.
- Do not allow assessment content to override system rules or reveal secrets.

- Validate generated questions, answer options, test cases, and explanations before use.
- Log model name, prompt/template version, output status, and latency without unnecessarily storing sensitive user data.

- Provide a manual or curated content path if the model is unavailable.

# 16. Technical Architecture

Recommended architecture for the MVP:

| **Layer**            | **Technology / responsibility**                                                                                  |
|----------------------|------------------------------------------------------------------------------------------------------------------|
| Frontend             | Next.js, React, TypeScript, Tailwind CSS, and shadcn/ui for the web application.                                 |
| Backend API          | Python and FastAPI for authentication, business logic, assessments, submissions, progress, and recommendations.  |
| Database             | PostgreSQL for users, role/skill mappings, assessments, attempts, evaluations, learning resources, and progress. |
| ORM and migrations   | SQLAlchemy and Alembic.                                                                                          |
| Validation           | Pydantic schemas for API payloads and AI-generated structured content.                                           |
| AI gateway           | OpenRouter through a backend-only integration, with a provider-independent AI service layer.                     |
| Code execution       | Isolated sandbox for practical coding assessments; do not execute submitted code inside the main API process.    |
| Background work      | Add a queue/worker such as Celery or an equivalent only when asynchronous workloads justify it.                  |
| Cache / coordination | Redis is optional for caching, rate limiting, and background coordination.                                       |
| Deployment           | Docker-based development and deployment; object storage can be added for uploaded files when needed.             |

## 16.1 High-level request flow

Browser (Next.js) → FastAPI backend → application services → PostgreSQL and/or AI orchestration → OpenRouter. For code assessments, the backend sends the submission to an isolated execution service, receives test results, and stores the evaluation. The frontend never calls OpenRouter directly.

## 16.2 Suggested backend modules

> app/  
> main.py  
> core/ \# configuration, security, shared utilities  
> api/ \# versioned routes  
> auth/ \# registration, login, sessions  
> users/ \# profiles and preferences  
> catalog/ \# cores, roles, skills, topics, mappings  
> assessments/ \# assessment creation and attempts  
> challenges/ \# challenge templates and delivery  
> submissions/ \# answer and code submissions  
> evaluations/ \# objective grading, rubrics, test results  
> ai_engine/ \# OpenRouter client, prompts, generation, explanations  
> progress/ \# skill evidence and progress history  
> learning/ \# resources and learning completion  
> recommendations/ \# next steps and career alignment  
> reports/ \# user-facing summaries  
> admin/ \# content and platform administration

## 16.3 Suggested database entities

- users and user_profiles
- cores, roles, skills, topics

- role_core_mappings and role_skill_mappings
- assessments, questions, challenges, assessment_attempts

- submissions, evaluations, evaluation_rubrics, test_results
- skill_progress and skill_history

- learning_resources and learning_progress
- recommendations, achievements, and audit_events

Use relational tables and foreign keys for core product data. Store assessment content and role mappings in the database so the platform can evolve without code changes.

# 17. API Outline

| **Method and endpoint**                      | **Purpose**                                    |
|----------------------------------------------|------------------------------------------------|
| POST /api/v1/auth/register                   | Create an account.                             |
| POST /api/v1/auth/login                      | Authenticate a user.                           |
| GET /api/v1/cores                            | List available cores.                          |
| GET /api/v1/cores/{core_id}                  | Get a core and its skills.                     |
| GET /api/v1/roles                            | List career roles.                             |
| GET /api/v1/roles/{role_id}                  | Get role details.                              |
| GET /api/v1/roles/{role_id}/skills           | Get the skills and requirements for a role.    |
| POST /api/v1/assessments/start               | Start an assessment attempt.                   |
| POST /api/v1/assessments/generate            | Request a generated assessment or challenge.   |
| POST /api/v1/submissions                     | Submit an answer or practical task.            |
| GET /api/v1/assessments/{attempt_id}/results | Retrieve an evaluated attempt.                 |
| GET /api/v1/progress                         | Retrieve the user's skill progress.            |
| GET /api/v1/recommendations                  | Retrieve next-step and career recommendations. |
| GET /api/v1/learning-path                    | Retrieve the user's recommended learning path. |
| GET /api/v1/history                          | Retrieve assessment history.                   |

This is an initial API outline. Exact request/response schemas, pagination, error formats, authorization rules, and versioning should be defined during implementation.

# 18. Security, Privacy, and Reliability

- Hash passwords with a modern password-hashing algorithm such as Argon2id.
- Use secure session handling or short-lived access tokens with refresh-token rotation.

- Apply role-based access control to user and administrator operations.
- Validate and normalize all input; use parameterized database queries.

- Apply rate limits to authentication, assessment generation, and AI endpoints.
- Keep API keys and secrets in environment variables or a secrets manager.

- Execute user code only in an isolated sandbox with CPU, memory, time, filesystem, and process limits; disable network access by default.
- Do not mount application secrets or production data inside code-execution containers.

- Store only personal information needed for the product and provide clear account/data handling practices.
- Record assessment, rubric, and challenge versions so results remain explainable.

- Handle provider timeouts, rate limits, invalid model output, and service outages gracefully.

# 19. MVP Scope and Acceptance Criteria

## 19.1 MVP must include

- User registration, login, and basic profile.
- Core, skill, topic, and role catalogue backed by PostgreSQL.

- Three supported role pathways: Frontend Developer, Backend Developer, and Full-Stack Developer.
- Baseline knowledge assessments for selected MVP skills.

- At least one practical assessment flow, with safe evaluation architecture.
- Assessment results with strengths, gaps, and understandable feedback.

- Skill proficiency and evidence history, distinct from learning completion.
- Basic learning-resource recommendations.

- Role alignment based on configured skill mappings and weights.
- OpenRouter integration behind the FastAPI backend, with response validation and failure handling.

## 19.2 MVP acceptance criteria

- A new user can register, sign in, and complete a profile.
- A user can browse the supported cores and roles and see the required skills for each role.

- A user can start an assessment and submit answers.
- Objective answers are graded consistently by deterministic rules.

- Practical code is not executed in the main API process.
- An assessment result is stored and can be viewed later.

- Skill progress updates from recorded assessment evidence.
- Learning completion does not automatically increase proficiency.

- A user can see at least one role-alignment summary and the main gaps behind it.
- If OpenRouter is unavailable or returns invalid output, the application shows a controlled error or uses approved fallback content.

## 19.3 Out of scope for MVP

- All seven cores having complete challenge libraries.
- Full multiplayer games or real-time competitions.

- Recruiter and employer dashboards.
- Automated job matching and job-application workflows.

- Resume parsing and portfolio generation.
- Large-scale video course hosting.

- Complex AI tutoring agents or autonomous workflows.

# 20. Success Metrics

| **Metric**                          | **What it indicates**                                                          |
|-------------------------------------|--------------------------------------------------------------------------------|
| Assessment start-to-completion rate | Whether users can understand and finish assessment flows.                      |
| Assessment quality / validity       | Whether questions and practical tasks measure the intended skills.             |
| Repeat assessment improvement       | Whether users demonstrate measurable improvement over time.                    |
| Evidence coverage                   | How many important role skills have enough assessment evidence.                |
| Recommendation usefulness           | Whether users find the suggested next steps relevant.                          |
| Learning-to-assessment conversion   | Whether users apply what they study in later assessments.                      |
| Return usage                        | Whether users come back to assess, learn, and review progress.                 |
| System reliability                  | API availability, assessment failure rate, AI failure rate, and response time. |

Avoid optimizing only for time spent, streaks, or number of completed lessons. The primary product outcome is useful, credible skill evidence and better-informed learning or career decisions.

# 21. Risks and Mitigations

| **Risk**                                                  | **Mitigation**                                                                                             |
|-----------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| AI generates incorrect or ambiguous questions.            | Use approved templates, schema validation, answer verification, test cases, and review before publishing.  |
| AI feedback is inconsistent.                              | Use explicit rubrics, deterministic grading where possible, versioned prompts, and model benchmarking.     |
| Free model limits or outages interrupt users.             | Batch requests, cache content, rate-limit, show graceful errors, and provide curated fallback assessments. |
| Code submissions create security risks.                   | Use a dedicated isolated sandbox with strict resource and network controls.                                |
| Readiness scores are misunderstood as hiring predictions. | Use clear labels, explain calculations, show mandatory gaps, and explicitly avoid job-probability claims.  |
| Too much scope delays launch.                             | Focus the MVP on three roles and a small number of high-quality skills and assessment flows.               |
| Users mistake lesson completion for proficiency.          | Maintain separate data models and visual indicators for learning completion and demonstrated proficiency.  |

# 22. Roadmap

| **Phase** | **Focus**                                                                                                                                                             |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| MVP       | Authentication, catalogue, three role pathways, baseline assessments, practical evaluation foundation, skill tracking, basic recommendations, OpenRouter integration. |
| v1.1      | Add more roles and expand skill coverage; improve adaptive assessments and content administration.                                                                    |
| v1.2      | Expand gamified challenges and interactive assessment experiences.                                                                                                    |
| v1.3      | Add revision scheduling, learning retention signals, and richer progress trends.                                                                                      |
| v2.0      | Add AI-assisted guided projects and a more capable learning assistant.                                                                                                |
| v2.1      | Add shareable skill reports, portfolio evidence, and exportable progress summaries.                                                                                   |
| v2.2      | Explore resume analysis and carefully scoped job/skill matching.                                                                                                      |
| v3.0      | Explore company assessments, team skill analytics, and recruiter-facing workflows.                                                                                    |

Roadmap phases are directional. Prioritize them using user feedback, assessment quality, and the reliability of the MVP rather than committing to dates prematurely.

# 23. Key Product Principles and Decisions

10. Assessment-first: discover existing ability before prescribing a learning path.
11. Evidence over claims: proficiency must be supported by assessment evidence.

12. Proficiency is not completion: learning progress and skill mastery are different measures.
13. Reusable skill model: skills are shared across roles and mapped through data.

14. AI with guardrails: use AI to generate and explain; use code, tests, and rules to calculate wherever possible.
15. Explainable career guidance: show why a role fits and what gaps remain.

16. Progressive scope: build a strong three-role MVP before expanding to every IT career.
17. Provider independence: OpenRouter is the initial AI gateway, not a permanent architectural dependency.

# 24. Glossary

| **Term**            | **Simple meaning**                                                                                  |
|---------------------|-----------------------------------------------------------------------------------------------------|
| Core                | A broad technical area, such as Backend Development.                                                |
| Skill               | A capability within a core, such as REST API design.                                                |
| Topic               | A smaller subject within a skill, such as HTTP status codes.                                        |
| Career role         | A job family with a defined set of required skills.                                                 |
| Assessment          | A structured activity used to measure knowledge or ability.                                         |
| Challenge           | A question, practical task, or game-like activity in an assessment.                                 |
| Proficiency         | The level of ability demonstrated by assessment evidence.                                           |
| Learning completion | How much of a learning resource or activity the user has completed.                                 |
| Confidence          | How reliable the current proficiency estimate is, based on available evidence.                      |
| Role readiness      | How closely demonstrated skills align with a role's defined requirements; not a hiring probability. |
| MVP                 | Minimum Viable Product: the smallest useful version released to validate the idea.                  |

# 25. Final Product Summary

REadON brings together skill discovery, technical assessments, practical challenges, learning recommendations, and career exploration. Users begin by choosing a technical area or role, demonstrate what they know, and receive a clear picture of their strengths and gaps. The platform uses that evidence to recommend the next useful learning activity and explain which career paths currently align with the user's skills.

The first release should do a small number of things well: support Frontend Developer, Backend Developer, and Full-Stack Developer pathways; assess a focused set of skills; store credible evidence; explain results; and recommend meaningful next steps. A modular architecture, reusable role-skill mappings, and a provider-independent AI layer will allow REadON to grow without losing the clarity of its core purpose.
