import { genAI } from '@/lib/gemini';
import { EVAL_PROMPT } from '@/lib/prompts';

export async function POST(req: Request) {
  try {
    const { problem, userCode, solution } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(EVAL_PROMPT(problem, userCode, solution || "Not provided"));
    const text = result.response.text();
    
    // Clean potential markdown blocks
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const evaluation = JSON.parse(cleanText);

    return Response.json(evaluation);
  } catch (error: any) {
    console.error('Eval error:', error);
    return Response.json({ error: 'Failed to evaluate code' }, { status: 500 });
  }
}
