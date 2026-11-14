/**
 * Isolated Code Execution Sandbox Runner
 * Executes student submissions in an isolated child-process worker with strict timeouts.
 * PRD §16 & §18 (Safe Sandboxed Execution)
 */

const { fork } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

/**
 * Runs code against automated test cases in an isolated child process
 */
function runCodeInSandbox(userCode, tests, timeoutMs = 3000) {
  return new Promise((resolve) => {
    // Harness script content executed in child process
    const workerScript = `
      process.on('message', (msg) => {
        const { code, tests } = msg;
        const results = [];
        let passedCount = 0;

        try {
          // Dynamically detect declared function name from student code
          const matchFn = code.match(/function\s+([a-zA-Z0-9_$]+)/);
          const detectedFnName = matchFn ? matchFn[1] : 'solveTask';

          const fn = new Function('input', \`
            \${code}
            
            function runUserTarget(inp) {
              if (typeof \${detectedFnName} === 'function') {
                return Array.isArray(inp) ? \${detectedFnName}(...inp) : \${detectedFnName}(inp);
              }
              if (typeof solveTask === 'function') {
                return Array.isArray(inp) ? solveTask(...inp) : solveTask(inp);
              }
              if (typeof sanitizeUserPayload === 'function') {
                return sanitizeUserPayload(inp);
              }
              if (typeof calculateCartTax === 'function') {
                return calculateCartTax(inp[0], inp[1]);
              }
              if (typeof detectDuplicateAccounts === 'function') {
                return detectDuplicateAccounts(inp);
              }
              return null;
            }
            return runUserTarget(input);
          \`);

          function checkMatch(output, expected) {
            if (expected === undefined || expected === null) return !!output;
            if (typeof expected === 'boolean') return output === expected || (output && output.valid === expected);
            if (typeof expected === 'number' || typeof expected === 'string') {
              if (output === expected) return true;
              if (output && (output.total === expected || output.subtotal === expected)) return true;
              return false;
            }
            if (Array.isArray(expected)) {
              if (!Array.isArray(output) || output.length !== expected.length) return false;
              return expected.every((val, i) => checkMatch(output[i], val));
            }
            if (typeof expected === 'object') {
              if (!output || typeof output !== 'object') return false;
              return Object.keys(expected).every(k => checkMatch(output[k], expected[k]));
            }
            return false;
          }

          for (const t of tests) {
            let passed = false;
            let error = null;
            let output = null;

            try {
              output = fn(t.input);
              passed = checkMatch(output, t.expected);
            } catch (err) {
              error = err.message;
            }

            if (passed) passedCount++;
            results.push({ name: t.name, passed, output, error });
          }

          process.send({ success: true, passedCount, total: tests.length, results });
        } catch (compileErr) {
          process.send({ success: false, compileError: compileErr.message, passedCount: 0, total: tests.length, results: [] });
        }
      });
    `;

    const tmpPath = path.join(__dirname, `worker_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.tmp.js`);
    fs.writeFileSync(tmpPath, workerScript);

    const child = fork(tmpPath, {
      silent: true,
      execArgv: ['--max-old-space-size=64'] // Memory limit
    });

    let completed = false;
    const timer = setTimeout(() => {
      if (!completed) {
        completed = true;
        child.kill('SIGKILL');
        try { fs.unlinkSync(tmpPath); } catch (e) {}
        resolve({
          success: false,
          timeout: true,
          error: `Execution timed out (> ${timeoutMs}ms). Check for infinite loops.`,
          passedCount: 0,
          total: tests.length,
          results: []
        });
      }
    }, timeoutMs);

    child.on('message', (data) => {
      if (!completed) {
        completed = true;
        clearTimeout(timer);
        child.kill();
        try { fs.unlinkSync(tmpPath); } catch (e) {}
        resolve(data);
      }
    });

    child.on('error', (err) => {
      if (!completed) {
        completed = true;
        clearTimeout(timer);
        try { fs.unlinkSync(tmpPath); } catch (e) {}
        resolve({
          success: false,
          error: err.message,
          passedCount: 0,
          total: tests.length,
          results: []
        });
      }
    });

    child.send({ code: userCode, tests });
  });
}

module.exports = {
  runCodeInSandbox
};

