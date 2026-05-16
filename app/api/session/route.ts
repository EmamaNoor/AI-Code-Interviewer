import { v4 as uuidv4 } from 'uuid';
import { groq } from '@/lib/groq';
import { PROBLEM_PROMPT } from '@/lib/prompts';

const sessions = new Map<string, any>();

const FALLBACK_PROBLEM = {
  title: "Two Sum",
  difficulty: "Easy",
  description:
    "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to the target.",
  examples: [
    {
      input: "nums = [2, 7, 11, 15], target = 9",
      output: "[0, 1]",
      explanation: "nums[0] + nums[1] = 2 + 7 = 9.",
    },
  ],
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists.",
  ],
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return Response.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  const session = sessions.get(sessionId);

  if (!session) {
    return Response.json({ error: 'Session not found' }, { status: 404 });
  }

  return Response.json(session);
}

export async function POST(req: Request) {
  try {
    const { difficulty, language = 'javascript' } = await req.json();

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: PROBLEM_PROMPT(difficulty, language),
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });
    
    const text = completion.choices[0]?.message?.content || "{}";

    const cleaned = text.replace(/```json|```/g, "").trim();
    const problem = JSON.parse(cleaned);

    return Response.json({ problem });
  } catch (error: any) {
    console.error("Session generation failed:", error);

    return Response.json({
      problem: FALLBACK_PROBLEM,
      fallback: true,
      message: "Groq failed, so a fallback problem was used.",
      details: error?.message || "Unknown error",
    });
  }
}