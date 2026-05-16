import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

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
  socket: Socket | null;
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
  hintTiming: 'instant' | 'stuck';
  hintType: 'concept' | 'code';
  
  // Actions
  initSession: (sessionId: string, difficulty?: string, language?: string) => Promise<void>;
  setCode: (code: string) => void;
  submitSolution: () => Promise<void>;
  skipProblem: () => Promise<void>;
  changeLanguage: (language: string) => Promise<void>;
  changeDifficulty: (difficulty: string) => Promise<void>;
  requestHint: () => void;
  retryWithHint: () => void;
  resetCode: () => void;
  setHintTiming: (timing: 'instant' | 'stuck') => void;
  setHintType: (type: 'concept' | 'code') => void;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  socket: null,
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
  hintTiming: 'stuck',
  hintType: 'concept',

  initSession: async (sessionId: string, difficulty: string = "Medium", language: string = "javascript") => {
    set({ sessionId, difficulty, language, problem: null, code: '', evaluation: null, chatHistory: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Welcome to your interview! Start writing your solution in the editor. If you get stuck, I will provide real-time hints and feedback based on your code.'
      }
    ] });

    try {
      // 1. Fetch or generate problem
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
      
      set({ problem: newProblem, code: newProblem.starter_code });

      // 2. Setup Socket
      const existingSocket = get().socket;
      if (existingSocket) existingSocket.disconnect();

      const socket = io('http://localhost:3001'); // Using separate Node.js server
      
      socket.on('connect', () => {
        socket.emit('join_session', { sessionId, problemDescription: JSON.stringify(newProblem) });
      });

      socket.on('ai_typing', () => {
        set({ isAiTyping: true });
      });

      socket.on('ai_hint', (data: { hint: string }) => {
        set((state) => ({
          isAiTyping: false,
          chatHistory: [...state.chatHistory, { id: Date.now().toString(), role: 'assistant', content: data.hint }]
        }));
      });

      set({ socket });

    } catch (error) {
      console.error('Failed to init session:', error);
    }
  },

  setCode: (code: string) => {
    set({ code });
    const { socket, sessionId, hintTiming, hintType, chatHistory } = get();
    if (socket && sessionId) {
      const pastHints = chatHistory.filter(h => h.role === 'assistant').map(h => h.content);
      socket.emit('code_update', { sessionId, code, hintTiming, hintType, pastHints });
    }
  },

  submitSolution: async () => {
    set({ isSubmitting: true });
    const { problem, code } = get();
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: JSON.stringify(problem),
          userCode: code,
          solution: problem?.solution
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

  skipProblem: async () => {
    const { sessionId, difficulty, language } = get();
    if (sessionId) {
      await get().initSession(sessionId + '-' + Date.now(), difficulty, language); // Re-init with new problem
    }
  },

  changeLanguage: async (language: string) => {
    const { sessionId, difficulty } = get();
    if (sessionId) {
      await get().initSession(sessionId, difficulty, language);
    }
  },

  changeDifficulty: async (difficulty: string) => {
    const { sessionId, language } = get();
    if (sessionId) {
      await get().initSession(sessionId, difficulty, language);
    }
  },

  requestHint: () => {
    const { socket, sessionId, lastHintTime, hintType, chatHistory } = get();
    
    if (lastHintTime && Date.now() - lastHintTime < 30000) {
      alert("Please wait 30 seconds before requesting another manual hint.");
      return;
    }

    if (socket && sessionId) {
      set({ lastHintTime: Date.now() });
      const pastHints = chatHistory.filter(h => h.role === 'assistant').map(h => h.content);
      socket.emit('request_manual_hint', { sessionId, hintType, pastHints });
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
