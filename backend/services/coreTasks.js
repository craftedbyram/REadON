/**
 * Curated Hands-on Practical Tasks for All 7 Technical Cores
 * Used for practical skill assessment (NO MCQs!) and career role diagnosis.
 */

const CORE_PRACTICAL_TASKS = {
  prog: {
    coreId: "prog",
    coreName: "Programming Fundamentals",
    title: "Data Payload Sanitizer & Type Normalizer",
    scenario: "In an enterprise API gateway, incoming user registration payloads arrive with messy formatting, whitespace, and type inconsistencies. Implement the normalization pipeline.",
    instructions: [
      "Return: { valid: boolean, sanitized: object | null, errors: string[] }",
      "Field 'name' must be a trimmed string of at least 2 characters.",
      "Field 'age' must be an integer between 18 and 120. If invalid or missing, add 'Invalid age' to errors.",
      "Field 'email' must contain '@' and '.' and be returned in lowercase."
    ],
    starterCode: `function sanitizeUserPayload(user) {
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
    tests: [
      {
        name: "Normalizes valid profile correctly",
        input: { name: "  alice dev  ", age: 24, email: "Alice@Example.COM" },
        expected: { valid: true }
      },
      {
        name: "Rejects underage candidate",
        input: { name: "Bob", age: 16, email: "bob@test.com" },
        expected: { valid: false }
      },
      {
        name: "Rejects malformed email",
        input: { name: "Charlie", age: 30, email: "invalid-email" },
        expected: { valid: false }
      }
    ],
    alignedRole: "Software Developer",
    learningModules: [
      "Type coercion edge cases in JavaScript",
      "Defensive parameter checking and null safety",
      "High performance string parsing & regex"
    ]
  },

  front: {
    coreId: "front",
    coreName: "Frontend Development",
    title: "Reactive Search Filter & Pagination Reducer",
    scenario: "You are building a high-performance searchable table for a SaaS dashboard. Implement a pagination and search query reducer that calculates pages and item slices without mutating state.",
    instructions: [
      "Accepts: (items, pageSize, pageNumber, searchQuery)",
      "Filters items case-insensitively where item.name contains searchQuery.",
      "Calculates totalPages = Math.max(1, Math.ceil(filtered.length / pageSize)).",
      "Clamps pageNumber between 1 and totalPages.",
      "Returns: { totalPages: number, pageItems: any[], currentPage: number }"
    ],
    starterCode: `function paginateItems(items, pageSize, pageNumber, searchQuery) {
  let filtered = items || [];
  if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(it => it && it.name && it.name.toLowerCase().includes(q));
  }
  
  const totalPages = Math.max(1, Math.ceil(filtered.length / (pageSize || 10)));
  const page = Math.min(Math.max(1, pageNumber || 1), totalPages);
  
  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);
  
  return {
    totalPages,
    pageItems,
    currentPage: page
  };
}`,
    tests: [
      {
        name: "Paginates 4 items into 2 per page",
        input: [
          [{ id: 1, name: "React" }, { id: 2, name: "Vue" }, { id: 3, name: "Angular" }, { id: 4, name: "Svelte" }],
          2, 1, ""
        ],
        expected: { totalPages: 2, currentPage: 1 }
      },
      {
        name: "Filters items with search query 'el'",
        input: [
          [{ id: 1, name: "React" }, { id: 2, name: "Vue" }, { id: 3, name: "Angular" }, { id: 4, name: "Svelte" }],
          10, 1, "el"
        ],
        expected: { totalPages: 1 }
      }
    ],
    alignedRole: "Frontend Developer",
    learningModules: [
      "React state synchronization & useEffect cleanup",
      "Virtual DOM diffing & memory optimization",
      "CSS Grid & fluid responsive layout strategies"
    ]
  },

  back: {
    coreId: "back",
    coreName: "Backend Development",
    title: "REST API Endpoint & Auth Header Guard",
    scenario: "Build an API route request validator that inspects incoming HTTP request headers for Bearer tokens, enforces authorization roles, and returns standardized status codes.",
    instructions: [
      "Accepts: req = { headers: { authorization: 'Bearer token' }, method: 'POST', body: object }",
      "If authorization header missing or not Bearer: return { status: 401, error: 'Unauthorized' }",
      "If valid token, process body and return { status: 201, data: req.body, timestamp: number }"
    ],
    starterCode: `function handleCreateTask(req) {
  const auth = req && req.headers ? req.headers.authorization : null;
  if (!auth || !auth.startsWith('Bearer ')) {
    return { status: 401, error: 'Unauthorized' };
  }
  
  if (!req.body || !req.body.title) {
    return { status: 400, error: 'Title required' };
  }

  return {
    status: 201,
    data: req.body,
    timestamp: Date.now()
  };
}`,
    tests: [
      {
        name: "Rejects unauthenticated request with 401",
        input: { headers: {}, body: { title: "Deploy Server" } },
        expected: { status: 401 }
      },
      {
        name: "Accepts authorized request with status 201 Created",
        input: { headers: { authorization: "Bearer sq_valid_token_123" }, body: { title: "Build Docker image" } },
        expected: { status: 201 }
      }
    ],
    alignedRole: "Backend Developer",
    learningModules: [
      "REST idempotency & RFC 7807 problem details",
      "JWT verification & RBAC authorization pipelines",
      "Automated integration testing with Mock HTTP fixtures"
    ]
  },

  db: {
    coreId: "db",
    coreName: "Databases & SQL",
    title: "Relational Join & Revenue Aggregator",
    scenario: "Write an algorithmic SQL-style relational query engine that joins customers with their orders and calculates total lifetime spend per customer.",
    instructions: [
      "Accepts: (customers, orders)",
      "Each order has { customerId: number, amount: number }",
      "Groups orders by customerId, sums the amounts, and returns an array of { id, name, totalSpent }",
      "Customers with zero orders should have totalSpent: 0"
    ],
    starterCode: `function aggregateCustomerSpend(customers, orders) {
  const spendMap = {};
  for (const ord of (orders || [])) {
    spendMap[ord.customerId] = (spendMap[ord.customerId] || 0) + ord.amount;
  }
  
  return (customers || []).map(cust => ({
    id: cust.id,
    name: cust.name,
    totalSpent: spendMap[cust.id] || 0
  }));
}`,
    tests: [
      {
        name: "Calculates total spend across joined orders",
        input: [
          [{ id: 1, name: "Acme Corp" }, { id: 2, name: "Globex" }],
          [{ customerId: 1, amount: 500 }, { customerId: 1, amount: 250 }, { customerId: 2, amount: 100 }]
        ],
        expected: [
          { id: 1, name: "Acme Corp", totalSpent: 750 },
          { id: 2, name: "Globex", totalSpent: 100 }
        ]
      }
    ],
    alignedRole: "Backend Developer",
    learningModules: [
      "SQL Indexing strategies (B-Trees vs Hash indexes)",
      "Multi-table joins (INNER, LEFT, FULL OUTER) and execution plans",
      "ACID isolation levels and deadlock prevention"
    ]
  },

  ai: {
    coreId: "ai",
    coreName: "Data Analytics & AI",
    title: "Dataset Outlier Detection & Z-Score Normalizer",
    scenario: "Data ingested from IoT sensors contains severe anomalies and spikes. Build a data preprocessing filter that calculates mean, standard deviation, and filters out outliers beyond 2 standard deviations.",
    instructions: [
      "Accepts: values (array of numbers)",
      "Computes mean and sample standard deviation.",
      "Filters out values where Math.abs(val - mean) > 2 * stdDev.",
      "Returns: { cleanedValues: number[], outliersCount: number, mean: number }"
    ],
    starterCode: `function cleanDataOutliers(values) {
  if (!values || values.length === 0) return { cleanedValues: [], outliersCount: 0, mean: 0 };
  
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  const threshold = 2 * stdDev;
  const cleaned = [];
  let outliers = 0;
  
  for (const v of values) {
    if (stdDev === 0 || Math.abs(v - mean) <= threshold) {
      cleaned.push(v);
    } else {
      outliers++;
    }
  }
  
  return {
    cleanedValues: cleaned,
    outliersCount: outliers,
    mean: Number(mean.toFixed(2))
  };
}`,
    tests: [
      {
        name: "Detects outlier spike in dataset",
        input: [10, 11, 12, 10, 11, 100, 12, 10],
        expected: { outliersCount: 1 }
      }
    ],
    alignedRole: "Data Analyst",
    learningModules: [
      "Statistical inference, p-values and confidence intervals",
      "Feature engineering and vectorization for ML models",
      "LLM prompt evaluations and output guardrails"
    ]
  },

  cloud: {
    coreId: "cloud",
    coreName: "Cloud & DevOps",
    title: "Container Health Status & Dependency Resolver",
    scenario: "In microservices orchestration, containers must boot in correct topological order based on their dependencies. Implement a service dependency validator.",
    instructions: [
      "Accepts: services = [{ name: string, dependsOn: string[] }]",
      "Validates that all dependsOn references exist in the services list.",
      "Returns: { valid: boolean, errors: string[] }"
    ],
    starterCode: `function validateServiceDependencies(services) {
  const serviceNames = new Set((services || []).map(s => s.name));
  const errors = [];
  
  for (const s of (services || [])) {
    if (s.dependsOn && Array.isArray(s.dependsOn)) {
      for (const dep of s.dependsOn) {
        if (!serviceNames.has(dep)) {
          errors.push(\`Service \${s.name} depends on missing service \${dep}\`);
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}`,
    tests: [
      {
        name: "Validates consistent service graph",
        input: [
          { name: "api", dependsOn: ["database", "redis"] },
          { name: "database", dependsOn: [] },
          { name: "redis", dependsOn: [] }
        ],
        expected: { valid: true }
      },
      {
        name: "Catches missing dependency",
        input: [
          { name: "web", dependsOn: ["auth-service"] }
        ],
        expected: { valid: false }
      }
    ],
    alignedRole: "Full-Stack Developer",
    learningModules: [
      "Multi-stage Dockerfile builds and image caching",
      "CI/CD deployment pipelines and automated rollbacks",
      "Network routing, reverse proxies, and TLS termination"
    ]
  },

  sec: {
    coreId: "sec",
    coreName: "Cybersecurity",
    title: "OWASP Header & Token Expiry Scanner",
    scenario: "Inspect server HTTP responses to ensure critical OWASP security headers (Content-Security-Policy, X-Frame-Options) are enforced, and verify that authentication tokens are not expired.",
    instructions: [
      "Accepts: (headers, tokenPayload)",
      "Checks that 'content-security-policy' and 'x-frame-options' exist in headers (case-insensitive).",
      "Checks that tokenPayload.exp * 1000 > Date.now().",
      "Returns: { secure: boolean, missingHeaders: string[], tokenExpired: boolean }"
    ],
    starterCode: `function auditSecurityHeaders(headers, tokenPayload) {
  const lowerHeaders = {};
  for (const k in (headers || {})) {
    lowerHeaders[k.toLowerCase()] = headers[k];
  }
  
  const required = ['content-security-policy', 'x-frame-options'];
  const missing = [];
  
  for (const r of required) {
    if (!lowerHeaders[r]) {
      missing.push(r);
    }
  }
  
  const now = Date.now();
  const tokenExpired = tokenPayload && tokenPayload.exp ? (tokenPayload.exp * 1000 <= now) : true;
  
  return {
    secure: missing.length === 0 && !tokenExpired,
    missingHeaders: missing,
    tokenExpired
  };
}`,
    tests: [
      {
        name: "Passes secure headers with valid token",
        input: [
          { 'Content-Security-Policy': "default-src 'self'", 'X-Frame-Options': 'DENY' },
          { exp: Math.floor((Date.now() + 60000) / 1000) }
        ],
        expected: { secure: true, tokenExpired: false }
      },
      {
        name: "Detects missing CSP header",
        input: [
          { 'X-Frame-Options': 'DENY' },
          { exp: Math.floor((Date.now() + 60000) / 1000) }
        ],
        expected: { secure: false }
      }
    ],
    alignedRole: "Full-Stack Developer",
    learningModules: [
      "OWASP Top 10 vulnerabilities (Injection, Broken Auth, XSS)",
      "Principle of Least Privilege and Role-Based Access Control",
      "Secrets rotation and secure environment configuration"
    ]
  }
};

module.exports = {
  CORE_PRACTICAL_TASKS
};
