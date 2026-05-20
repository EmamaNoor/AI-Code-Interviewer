import { NextResponse } from "next/server";
import { getGroqClient } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const { problem, code, hintType, pastHints } = await req.json();

    const promptRule = hintType === 'concept' 
      ? 'Provide ONE extremely brief conceptual hint. Under NO circumstances should you output code.'
      : 'Provide ONE extremely brief hint. You MUST include a short `code block`.';

    const systemMessage = `You are a coding interviewer. Give ONE hint only.
Rules: respond in 10 words max. No greetings. No explanations.
NEVER provide the complete solution. NEVER write more than 2 lines of code.
Previous hints given (DO NOT repeat): ${(pastHints || []).slice(-3).join(' | ')}
${promptRule}`;

    const userMessage = `Problem: ${JSON.stringify(problem)}\nCode so far:\n${code}`;

    const groqClient = getGroqClient();
    const completion = await groqClient.chat.completions.create({
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      model: "llama-3.1-8b-instant",
      max_tokens: 60,
    });

    const hintText = completion.choices[0]?.message?.content?.trim() || "Think about edge cases.";

    return NextResponse.json({ hint: hintText });
  } catch (error) {
    console.error("Manual Hint error:", error);
    return NextResponse.json({ hint: "Sorry, I couldn't generate a hint right now. Try again." }, { status: 500 });
  }
}
