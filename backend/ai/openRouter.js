/**
 * OpenRouter AI Gateway Service
 * Server-side LLM integration for assessment generation and rubric evaluation.
 * Implements primary model routing with automatic fallback to NVIDIA Nemotron.
 * PRD §15 (OpenRouter Integration & Guardrails)
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-lite:free';
const OPENROUTER_FALLBACK_MODEL = process.env.OPENROUTER_FALLBACK_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct';

/**
 * Executes a single completion attempt against a given model
 */
async function callOpenRouterEndpoint(model, messages, options = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs || 10000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY.trim()}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://readon.skillquest.local',
        'X-Title': 'REadON Backend API'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: options.temperature !== undefined ? options.temperature : 0.3,
        max_tokens: options.max_tokens || 800
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[OpenRouter AI] Model '${model}' responded with HTTP ${response.status}`);
      return { success: false, status: response.status };
    }

    const json = await response.json();
    if (json.choices && json.choices[0] && json.choices[0].message) {
      return { success: true, content: json.choices[0].message.content, modelUsed: model };
    }
    return { success: false, error: 'Empty choices array returned' };
  } catch (err) {
    clearTimeout(timeout);
    return { success: false, error: err.message };
  }
}

/**
 * Chat completion with automatic failover:
 * 1. Primary Model (e.g. Gemini 2.0 Flash)
 * 2. Fallback Model: NVIDIA Nemotron (e.g. nvidia/llama-3.1-nemotron-70b-instruct)
 * 3. Graceful deterministic fallback
 */
async function generateChatCompletion(messages, options = {}) {
  if (!OPENROUTER_API_KEY) {
    return null;
  }

  const primaryModel = options.model || OPENROUTER_MODEL;
  const fallbackModel = options.fallbackModel || OPENROUTER_FALLBACK_MODEL;

  // 1. Attempt Primary Model
  const primaryResult = await callOpenRouterEndpoint(primaryModel, messages, options);
  if (primaryResult.success && primaryResult.content) {
    return { content: primaryResult.content, modelUsed: primaryModel };
  }

  // 2. Failover to NVIDIA Nemotron
  console.log(`[OpenRouter AI Failover] Primary model (${primaryModel}) failed. Switching to NVIDIA Nemotron (${fallbackModel})...`);
  const fallbackResult = await callOpenRouterEndpoint(fallbackModel, messages, options);
  if (fallbackResult.success && fallbackResult.content) {
    console.log(`[OpenRouter AI Failover] NVIDIA Nemotron responded successfully!`);
    return { content: fallbackResult.content, modelUsed: fallbackModel };
  }

  console.warn(`[OpenRouter AI] Both primary model and NVIDIA Nemotron fallback failed. Using deterministic fallback.`);
  return null;
}

/**
 * AI Evaluator: provides qualitative critique and rubric analysis (PRD §15.1)
 */
async function evaluateSubmissionAI(skillName, taskTitle, userCode, passedCount, totalTests) {
  const prompt = `As the REadON Engineering Evaluator, provide qualitative rubric feedback on this student submission:
Skill: ${skillName}
Task: ${taskTitle}
Automated Tests Passed: ${passedCount}/${totalTests}

Student Solution:
\`\`\`javascript
${userCode}
\`\`\`

Return 3 concise bullet points:
• Demonstrated Strengths: (1-2 sentences on good patterns observed)
• Identified Gaps & Edge Cases: (1-2 sentences on what failed or potential vulnerabilities)
• Recommended Next Practice: (specific topic or challenge to attempt next)`;

  const aiRes = await generateChatCompletion([
    { role: 'system', content: 'You are an expert technical evaluator for REadON. Keep answers actionable, concise, and structured.' },
    { role: 'user', content: prompt }
  ]);

  if (aiRes && aiRes.content) {
    return aiRes.content;
  }

  // Resilient deterministic fallback (PRD §15.3 & §15.4)
  if (passedCount === totalTests) {
    return `• Demonstrated Strengths: Clean logic flow, proper variable scoping, and all automated unit assertions passed.\n• Identified Gaps & Edge Cases: Ensure boundary values (such as nullish parameters or empty strings) are defended against.\n• Recommended Next Practice: Proceed to asynchronous request testing in Backend Development.`;
  } else {
    return `• Demonstrated Strengths: Function skeleton and basic types are established.\n• Identified Gaps & Edge Cases: Several automated assertions failed. Verify loop termination bounds and type coercion.\n• Recommended Next Practice: Review foundational array methods and boundary condition handling in the Learning Hub.`;
  }
}

/**
 * AI Assessment Generator: dynamically drafts new questions/challenges on demand (PRD §15.1)
 */
async function generateAssessmentAI(skillName, difficulty = 'intermediate') {
  const prompt = `Generate a single multiple-choice technical question for skill: "${skillName}" at ${difficulty} level.
Output valid JSON in this exact schema:
{
  "title": "Short title",
  "question": "Question text or code snippet",
  "options": [
    { "text": "Option A", "isCorrect": false, "explanation": "Why incorrect" },
    { "text": "Option B", "isCorrect": true, "explanation": "Why correct" },
    { "text": "Option C", "isCorrect": false, "explanation": "Why incorrect" },
    { "text": "Option D", "isCorrect": false, "explanation": "Why incorrect" }
  ]
}`;

  const aiRes = await generateChatCompletion([
    { role: 'system', content: 'You are an assessment author for REadON. Respond ONLY with valid JSON.' },
    { role: 'user', content: prompt }
  ]);

  if (aiRes && aiRes.content) {
    try {
      const cleaned = aiRes.content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn("Failed to parse AI question JSON:", e.message);
    }
  }

  // Curated Fallback
  return {
    title: `${skillName} Verification`,
    question: `In modern development, which principle is essential for maintaining predictable behavior in ${skillName}?`,
    options: [
      { text: "Avoiding explicit type checking", isCorrect: false, explanation: "Implicit types lead to runtime bugs." },
      { text: "Pure functions and deterministic state transformations", isCorrect: true, explanation: "Predictable outputs given identical inputs ensure testability and prevent side effects." },
      { text: "Sharing mutable global variables across modules", isCorrect: false, explanation: "Global state creates race conditions." },
      { text: "Hardcoding secrets into source code", isCorrect: false, explanation: "Severe security vulnerability." }
    ]
  };
}

/**
 * AI Practical Task Generator: creates hands-on coding challenges for a selected core (NO MCQs!)
 */
async function generatePracticalTaskAI(coreId, coreName) {
  const prompt = `As a principal software architect for REadON, create a hands-on practical coding challenge (NOT an MCQ!) for the technical core: "${coreName}" (${coreId}).
Output valid JSON adhering to this exact schema:
{
  "id": "task_ai_${coreId}",
  "title": "Clear Engineering Task Title",
  "scenario": "A real-world production engineering problem scenario (2-3 sentences)",
  "instructions": [
    "Step 1 requirement",
    "Step 2 requirement",
    "Step 3 requirement"
  ],
  "starterCode": "function solveTask(input) {\\n  // Starter code\\n}",
  "tests": [
    { "name": "Basic valid case", "input": {}, "expected": {} },
    { "name": "Edge case boundary", "input": {}, "expected": {} }
  ]
}`;

  const aiRes = await generateChatCompletion([
    { role: 'system', content: 'You are an engineering assessment author. Respond ONLY with valid JSON. Never output multiple choice questions.' },
    { role: 'user', content: prompt }
  ]);

  if (aiRes && aiRes.content) {
    try {
      const cleaned = aiRes.content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn("Failed to parse practical task AI output:", e.message);
    }
  }

  return null;
}

/**
 * AI Role Identification & Learning Recommender:
 * Diagnoses the candidate's engineering role alignment from practical test evidence and suggests targeted learning.
 */
async function identifyCareerRoleAndLearningAI(coreName, taskTitle, userCode, passedCount, totalTests, scoreP) {
  const prompt = `As the REadON Career Diagnostic Engine, evaluate this candidate based on their practical test submission:
Core Tested: ${coreName}
Challenge: ${taskTitle}
Automated Tests Passed: ${passedCount}/${totalTests} (Demonstrated Proficiency: ${scoreP}%)

Student Submission:
\`\`\`javascript
${userCode}
\`\`\`

Analyze their code structure, logic, and test performance, and output valid JSON in this schema:
{
  "recommendedRole": "Frontend Developer | Backend Developer | Full-Stack Developer | Data Analyst | Python Developer | AI Application Developer",
  "matchPercentage": 85,
  "diagnosis": "Why this role aligns with their demonstrated practical strengths (2 sentences)",
  "criticalGaps": ["Specific topic gap 1", "Specific topic gap 2"],
  "coreLearningRoadmap": [
    { "topic": "Name of topic to study", "priority": "High | Medium", "reason": "Why needed for production readiness" },
    { "topic": "Second topic to study", "priority": "High | Medium", "reason": "Why needed for production readiness" }
  ],
  "encouragement": "A motivating concluding sentence about their career potential."
}`;

  const aiRes = await generateChatCompletion([
    { role: 'system', content: 'You are an elite engineering career advisor. Respond ONLY with valid JSON.' },
    { role: 'user', content: prompt }
  ]);

  if (aiRes && aiRes.content) {
    try {
      const cleaned = aiRes.content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn("Failed to parse role diagnosis AI JSON:", e.message);
    }
  }

  // Resilient deterministic fallback
  let defaultRole = "Full-Stack Developer";
  if (coreName.includes("Frontend")) defaultRole = "Frontend Developer";
  if (coreName.includes("Backend")) defaultRole = "Backend Developer";
  if (coreName.includes("Database")) defaultRole = "Backend Developer";
  if (coreName.includes("Analytics")) defaultRole = "Data Analyst";

  return {
    recommendedRole: defaultRole,
    matchPercentage: Math.max(60, scoreP),
    diagnosis: `Demonstrated practical capability in ${coreName} with ${passedCount}/${totalTests} unit test assertions verified in sandbox. Shows strong baseline logic.`,
    criticalGaps: ["Defensive boundary condition checking", "Asynchronous error boundary wrapping"],
    coreLearningRoadmap: [
      { topic: `${coreName} Advanced Patterns`, priority: "High", reason: `Required to reach production readiness in ${defaultRole}.` },
      { topic: "Automated Integration Testing", priority: "Medium", reason: "Guarantees contract reliability across microservice boundaries." }
    ],
    encouragement: `Your practical problem solving shows strong foundation. Target the identified gaps to achieve 85%+ readiness!`
  };
}

/**
 * Interactive AI Chat Mentor with Dual-Model Failover (Gemini 2.0 Flash + NVIDIA Nemotron 70B)
 */
async function chatWithMentorAI(userMessages, studentContext = {}) {
  const { currentRole, streak, xp } = studentContext;
  
  const systemPrompt = `You are the REadON AI Career Advisor & Technical Mentor.
You are powered by Google Gemini 2.0 Flash Lite with NVIDIA Nemotron 70B failover.
Your mission: Help students master software engineering through objective evidence, practice, and skill assessment.

Student Profile Context:
• Target Role: ${currentRole || 'Full-Stack Developer'}
• Current XP: ${xp || 850} (Streak: ${streak || 3} days)
• Scoring Framework: P = 0.30K + 0.50A + 0.20R (Knowledge 30%, Applied 50%, Reasoning 20%).
• Key Principle: Learning completion does not equal demonstrated proficiency; real ability requires taking practical coding tasks without MCQs.

Guidelines:
1. Provide concise, clear, and insightful technical guidance.
2. If the user asks for code examples, provide clean modern ES6/Node.js or Python snippets with explanations.
3. If the user asks about career pathways or skill gaps, reference the 7 REadON Cores (Programming, Frontend, Backend, Databases, AI/Data, Cloud/DevOps, Cybersecurity).
4. Be motivating, intellectually honest, and direct.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(userMessages || [])
  ];

  const aiRes = await generateChatCompletion(messages, { max_tokens: 1000, temperature: 0.6 });
  if (aiRes && aiRes.content) {
    return {
      message: aiRes.content,
      modelUsed: aiRes.modelUsed
    };
  }

  // Resilient deterministic fallback when offline
  const lastUserMsg = (userMessages && userMessages.length > 0) ? userMessages[userMessages.length - 1].content : '';
  return {
    message: generateMentorFallbackResponse(lastUserMsg, currentRole),
    modelUsed: 'deterministic-offline-fallback'
  };
}

function generateMentorFallbackResponse(query, targetRole) {
  const q = (query || '').toLowerCase();
  if (q.includes('gap') || q.includes('deficit') || q.includes('score')) {
    return `🎯 **Role Readiness Analysis for ${targetRole || 'Full-Stack Developer'}**:
In REadON, your readiness score is governed by **P = 0.30K + 0.50A + 0.20R**.
• **Mandatory Skills**: A high score in secondary skills cannot substitute for mandatory deficits. Check your Dashboard for any critical gap warnings (marked with ⚠️).
• **Next Recommended Action**: Go to the **Skill Cores** or **Assessment** section and select your deficit area to complete a hands-on practical coding challenge.`;
  }
  if (q.includes('formula') || q.includes('0.30') || q.includes('scoring') || q.includes('proficiency')) {
    return `📐 **Understanding the Proficiency Formula**:
REadON calculates skill proficiency using:
$$\\mathbf{P = 0.30K + 0.50A + 0.20R}$$
• **30% Knowledge ($K$)**: Conceptual understanding, syntactic recall, and terminology.
• **50% Applied ($A$)**: Automated test assertions passed in our isolated sandbox runner.
• **20% Reasoning ($R$)**: Edge case defense, performance constraints, and architectural trade-offs.
This ensures that reading a tutorial or guessing an MCQ never artificially inflates your engineering score.`;
  }
  if (q.includes('task') || q.includes('challenge') || q.includes('practice')) {
    return `💻 **Practical Coding Tasks Available**:
REadON rejects generic multiple-choice quizzes for technical skills. Instead, try one of our 7 core coding challenges:
1. **Frontend**: Data Pagination & Filtering Engine
2. **Backend**: REST API Endpoint & Auth Header Guard
3. **Databases**: Customer Order Spend Aggregator (SQL Join logic)
4. **Data Analytics**: Data Outlier Trimmer & Imputer
5. **Programming Fundamentals**: Payload Sanitizer & Type Normalizer
Navigate to the **Assessment** tab to launch any task in our browser sandbox!`;
  }
  return `👋 I am your **REadON AI Career & Technical Mentor**, backed by Google Gemini 2.0 Flash Lite and NVIDIA Nemotron 70B.
I can help you:
• Diagnose skill deficits for your target role (${targetRole || 'Full-Stack Developer'})
• Explain algorithms, SQL optimizations, and architectural patterns
• Review your code submissions and test assertion results
• Formulate your daily learning roadmap

What technical topic or skill would you like to explore today?`;
}

module.exports = {
  generateChatCompletion,
  evaluateSubmissionAI,
  generateAssessmentAI,
  generatePracticalTaskAI,
  identifyCareerRoleAndLearningAI,
  chatWithMentorAI,
  OPENROUTER_MODEL,
  OPENROUTER_FALLBACK_MODEL
};
