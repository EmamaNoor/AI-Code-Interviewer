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
  problem: Problem | null;
  code: string;
  chatHistory: ChatMessage[];
  isSubmitting: boolean;
  evaluation: any | null;
  
  // Actions
  initSession: (sessionId: string) => Promise<void>;
  setCode: (code: string) => void;
  submitSolution: () => Promise<void>;
  skipProblem: () => Promise<void>;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  socket: null,
  sessionId: null,
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

  initSession: async (sessionId: string) => {
    set({ sessionId, problem: null, code: '', evaluation: null, chatHistory: [
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
        body: JSON.stringify({ difficulty: 'Medium' })
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
          difficulty: "Easy",
          description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\n(Note: The Anthropic API failed to generate a problem, likely due to billing issues. This is a fallback problem.)",
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

      socket.on('ai_hint', (data: { hint: string }) => {
        set((state) => ({
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
    const { socket, sessionId } = get();
    if (socket && sessionId) {
      socket.emit('code_update', { sessionId, code });
    }
  },

  submitSolution: async () => {
    set({ isSubmitting: true });
    const { problem, code } = get();
    try {
      const res = await fetch('/api/eval', {
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
            content: `**Evaluation:**\nScore: ${evaluation.score}/100\nCorrectness: ${evaluation.correctness}\n\nVerdict: ${evaluation.verdict}`
          }
        ]
      });
    } catch (error) {
      console.error('Submit failed', error);
      set({ isSubmitting: false });
    }
  },

  skipProblem: async () => {
    const { sessionId } = get();
    if (sessionId) {
      await get().initSession(sessionId + '-' + Date.now()); // Re-init with new problem
    }
  }
}));
