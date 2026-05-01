export const PROBLEM_PROMPT = (difficulty: string) => `
Generate a ${difficulty} LeetCode-style coding problem.
Return only valid JSON, no markdown, no explanation.

{
  "title": "problem title",
  "difficulty": "${difficulty}",
  "description": "full problem description",
  "examples": [{ "input": "...", "output": "...", "explanation": "..." }],
  "constraints": ["constraint 1", "constraint 2"],
  "starter_code": "def solution():\n    pass",
  "solution": "complete working solution",
  "time_complexity": "O(...)",
  "space_complexity": "O(...)"
}`;

export const HINT_PROMPT = (problem: string, code: string) => `
Problem: ${problem}
User's current code: ${code}

Give ONE short hint (max 2 sentences). Don't solve it. Just nudge them in the right direction.`;

export const EVAL_PROMPT = (problem: string, userCode: string, solution: string) => `
Problem: ${problem}
User solution: ${userCode}
Reference solution: ${solution}

Return only valid JSON:
{
  "score": 0-100,
  "correctness": "correct|partial|wrong",
  "time_complexity": "...",
  "space_complexity": "...",
  "issues": ["..."],
  "improvements": ["..."],
  "verdict": "2-3 sentence summary"
}`;