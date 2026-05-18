import { create } from 'zustand';

export interface Problem {
  title: string;
  difficulty: string;
  description: string;
  examples: { input: string; output: string; explanation: string }[];
  constraints: string[];
  starter_code: string;
  solution: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface InterviewState {
  sessionId: string | null;
  difficulty: string;
  language: string;
  problem: Problem | null;
  code: string;
  chatHistory: ChatMessage[];
  isSubmitting: boolean;
  evaluation: any | null;
  lastHintTime: number | null;
  isAiTyping: boolean;
  isExecuting: boolean;
  executionResult: { stdout: string; stderr: string; compile_output: string } | null;
  hintTiming: 'instant' | 'stuck';
  hintType: 'concept' | 'code';
  
  // Actions
  initSession: (sessionId: string, difficulty?: string, language?: string) => Promise<void>;
  setCode: (code: string) => void;
  submitSolution: () => Promise<void>;
  skipProblem: () => Promise<void>;
  changeLanguage: (language: string) => Promise<void>;
  changeDifficulty: (difficulty: string) => Promise<void>;
  requestHint: () => Promise<void>;
  executeCode: () => Promise<void>;
  retryWithHint: () => void;
  resetCode: () => void;
  setHintTiming: (timing: 'instant' | 'stuck') => void;
  setHintType: (type: 'concept' | 'code') => void;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  sessionId: null,
  difficulty: "Medium",
  language: "javascript",
  problem: null,
  code: '',
  chatHistory: [
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to your interview! Start writing your solution in the editor. If you get stuck, I will provide real-time hints and feedback based on your code.'
    }
  ],
  isSubmitting: false,
  evaluation: null,
  lastHintTime: null,
  isAiTyping: false,
  isExecuting: false,
  executionResult: null,
  hintTiming: 'stuck',
  hintType: 'concept',

  initSession: async (sessionId: string, difficulty: string = "Medium", language: string = "javascript") => {
    set({ sessionId, difficulty, language, problem: null, code: '', evaluation: null, executionResult: null, chatHistory: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Welcome to your interview! Start writing your solution in the editor. If you get stuck, I will provide real-time hints and feedback based on your code.'
      }
    ] });

    try {
      // 1. Try to fetch existing session first
      const getRes = await fetch(`/api/session?sessionId=${sessionId}`);
      if (getRes.ok) {
        const data = await getRes.json();
        set({ 
          problem: data.problem, 
          code: data.code, 
          language: data.language,
          evaluation: data.evaluation
        });

        if (data.evaluation) {
          const hasPastEval = get().chatHistory.some(msg => msg.id === 'past-eval');
          if (!hasPastEval) {
            set({
              chatHistory: [
                ...get().chatHistory,
                {
                  id: 'past-eval',
                  role: 'assistant',
                  content: `**Reviewing Past Attempt:**\nScore: ${data.evaluation.score}/100\nVerdict: ${data.evaluation.verdict}\n\nYou can modify and run your code to try again!`
                }
              ]
            });
          }
        }
        return;
      }

      // 2. Fallback to generating a new session if not found
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty, language })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Session API failed with status ${res.status}`);
      }

      const data = await res.json();
      
      let newProblem = data.problem;

      if (!newProblem) {
        console.warn('API did not return a problem. Falling back to a hardcoded example.');
        newProblem = {
          title: "Two Sum (Fallback)",
          difficulty: difficulty,
          description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\n(Note: The API failed to generate a problem. This is a fallback problem.)",
          examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." }],
          constraints: ["2 <= nums.length <= 10^4"],
          starter_code: "function twoSum(nums, target) {\n  // Write your code here\n  \n};",
          solution: "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n};"
        };
      }
      
      set({ problem: newProblem, code: newProblem.starter_code, sessionId: data.sessionId || sessionId });

    } catch (error) {
      console.error('Failed to init session:', error);
    }
  },

  setCode: (code: string) => {
    set({ code });
  },

  submitSolution: async () => {
    set({ isSubmitting: true });
    const { problem, code, sessionId } = get();
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: JSON.stringify(problem),
          userCode: code,
          solution: problem?.solution,
          sessionId
        })
      });
      const evaluation = await res.json();
      set({ 
        evaluation, 
        isSubmitting: false,
        chatHistory: [
          ...get().chatHistory,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: `**Evaluation Complete:**\nScore: ${evaluation.score}/100\nVerdict: ${evaluation.verdict}`
          }
        ]
      });
    } catch (error) {
      console.error('Submit failed', error);
      set({ isSubmitting: false });
    }
  },

  executeCode: async () => {
    const { code, language } = get();
    if (!code) return;

    set({ isExecuting: true, executionResult: null });

    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      
      const data = await res.json();
      set({ executionResult: { stdout: data.stdout, stderr: data.stderr, compile_output: data.compile_output } });
    } catch (error) {
      console.error('Execution failed', error);
      set({ executionResult: { stdout: '', stderr: 'Network error or execution failed.', compile_output: '' } });
    } finally {
      set({ isExecuting: false });
    }
  },

  skipProblem: async () => {
    const { sessionId, difficulty, language } = get();
    if (sessionId) {
      await get().initSession(sessionId + '-' + Date.now(), difficulty, language); // Re-init with new problem
    }
  },

  changeLanguage: async (language: string) => {
    set({ language });
  },

  changeDifficulty: async (difficulty: string) => {
    const { sessionId, language } = get();
    if (sessionId) {
      await get().initSession(sessionId, difficulty, language);
    }
  },

  requestHint: async () => {
    const { sessionId, lastHintTime, hintType, chatHistory, problem, code } = get();
    
    if (lastHintTime && Date.now() - lastHintTime < 30000) {
      alert("Please wait 30 seconds before requesting another manual hint.");
      return;
    }

    if (!sessionId) return;

    set({ lastHintTime: Date.now(), isAiTyping: true });
    
    const pastHints = chatHistory.filter(h => h.role === 'assistant').map(h => h.content);
    
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, code, hintType, pastHints })
      });
      
      if (!res.ok) throw new Error();
      const { hint } = await res.json();
      
      set((state) => ({
        isAiTyping: false,
        chatHistory: [...state.chatHistory, { id: Date.now().toString(), role: 'assistant', content: hint }]
      }));
    } catch (error) {
      set({ isAiTyping: false });
      console.error('Failed to fetch hint', error);
    }
  },

  retryWithHint: () => {
    const { evaluation, chatHistory } = get();
    
    // Always reset the code on retry
    get().resetCode();

    if (evaluation && evaluation.improvements && evaluation.improvements.length > 0) {
      set({
        evaluation: null,
        chatHistory: [
          ...chatHistory,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: `**Hint for your retry:**\n${evaluation.improvements[0]}`
          }
        ]
      });
    } else {
      set({ evaluation: null });
    }
  },

  resetCode: () => {
    const { problem } = get();
    if (problem) {
      get().setCode(problem.starter_code);
    }
  },

  setHintTiming: (timing: 'instant' | 'stuck') => set({ hintTiming: timing }),
  setHintType: (type: 'concept' | 'code') => set({ hintType: type })
}));
