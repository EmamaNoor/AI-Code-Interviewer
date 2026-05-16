import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Store session timers and code
const sessions = new Map<string, { code: string; problem: string; timer?: NodeJS.Timeout }>();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_session', ({ sessionId, problemDescription }) => {
    socket.join(sessionId);
    console.log(`User ${socket.id} joined session ${sessionId}`);
    
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, { code: '', problem: problemDescription });
    } else {
      // Always update the problem description to ensure it's not stale
      // if the user changed difficulty or language without changing sessionId
      sessions.get(sessionId)!.problem = problemDescription;
    }
  });

  socket.on('code_update', ({ sessionId, code, hintTiming = 'stuck', hintType = 'concept', pastHints = [] }) => {
    const session = sessions.get(sessionId);
    if (!session) return;

    session.code = code;
  });

  socket.on('request_manual_hint', async ({ sessionId, hintType = 'concept', pastHints = [] }) => {
    const session = sessions.get(sessionId);
    if (!session) return;

    try {
      const promptRule = hintType === 'concept' 
        ? 'Provide ONE extremely brief conceptual hint. Under NO circumstances should you output code.'
        : 'Provide ONE extremely brief hint. You MUST include a short `code block`.';

      const systemMessage = `You are a coding interviewer. Give ONE hint only.
Rules: respond in 10 words max. No greetings. No explanations.
NEVER provide the complete solution. NEVER write more than 2 lines of code.
Previous hints given (DO NOT repeat): ${pastHints.slice(-3).join(' | ')}
${promptRule}`;

      const userMessage = `Problem: ${session.problem}\nCode so far:\n${session.code}`;

      io.to(sessionId).emit('ai_typing');
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage }
        ],
        model: "llama-3.1-8b-instant",
        max_tokens: 60,
      });
      const hintText = completion.choices[0]?.message?.content?.trim() || "Think about edge cases.";
      
      io.to(sessionId).emit('ai_hint', { hint: hintText });
    } catch (error) {
      console.error('Error generating manual hint:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
