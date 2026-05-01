import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Store session timers and code
const sessions = new Map<string, { code: string; problem: string; timer?: NodeJS.Timeout }>();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_session', ({ sessionId, problemDescription }) => {
    socket.join(sessionId);
    console.log(`User ${socket.id} joined session ${sessionId}`);
    
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, { code: '', problem: problemDescription });
    }
  });

  socket.on('code_update', ({ sessionId, code }) => {
    const session = sessions.get(sessionId);
    if (!session) return;

    session.code = code;

    // Clear existing timer
    if (session.timer) {
      clearTimeout(session.timer);
    }

    // Set a new timer to check if user is stuck (e.g., no typing for 30 seconds for demo purposes)
    session.timer = setTimeout(async () => {
      console.log(`User in session ${sessionId} appears stuck. Generating hint...`);
      try {
        const HINT_PROMPT = `
Problem: ${session.problem}
User's current code: ${session.code}

Give ONE short hint (max 2 sentences). Don't solve it. Just nudge them in the right direction.`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(HINT_PROMPT);
        const hintText = result.response.text();
        
        io.to(sessionId).emit('ai_hint', { hint: hintText });
      } catch (error) {
        console.error('Error generating hint:', error);
      }
    }, 30000); // 30 seconds for testing/demo
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
