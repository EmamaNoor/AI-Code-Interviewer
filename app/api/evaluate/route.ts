import { getGroqClient } from '@/lib/groq';
import { EVAL_PROMPT } from '@/lib/prompts';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { problem, userCode, solution, sessionId } = await req.json();

    const groqClient = getGroqClient();
    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: "user",
          content: EVAL_PROMPT(problem, userCode, solution || "Not provided"),
        },
      ],
      model: "llama-3.3-70b-versatile", // Great for evaluation
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content || "{}";
    
    // Clean potential markdown blocks just in case
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const evaluation = JSON.parse(cleanText);

    if (sessionId) {
      await prisma.evaluation.create({
        data: {
          sessionId,
          score: evaluation.score,
          verdict: evaluation.verdict,
          feedback: JSON.stringify(evaluation.improvements || [])
        }
      });
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: {
          code: userCode,
          status: 'COMPLETED'
        }
      });
    }

    return Response.json(evaluation);
  } catch (error: any) {
    console.error('Eval error:', error);
    return Response.json({ error: 'Failed to evaluate code' }, { status: 500 });
  }
}
