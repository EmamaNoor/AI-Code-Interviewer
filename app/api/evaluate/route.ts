import { groq } from '@/lib/groq';
import { EVAL_PROMPT } from '@/lib/prompts';

export async function POST(req: Request) {
  try {
    const { problem, userCode, solution } = await req.json();

    const completion = await groq.chat.completions.create({
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

    return Response.json(evaluation);
  } catch (error: any) {
    console.error('Eval error:', error);
    return Response.json({ error: 'Failed to evaluate code' }, { status: 500 });
  }
}
