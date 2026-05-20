import { NextResponse } from "next/server";
import { getGroqClient } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const { prefix, suffix, language, hintType } = await req.json();

    const isConcept = hintType === 'concept';
    
    const promptInstructions = isConcept 
      ? `Output a short inline comment (e.g. // Hint: ...) containing a conceptual nudge based on the PREFIX. Do NOT output executable code.`
      : `Your ONLY job is to output the exact code that logically belongs between the PREFIX and SUFFIX. Output raw code only.`;

    const prompt = `You are an AI code completion engine for a ${language} file. ${promptInstructions}
Do NOT output markdown. Do NOT use backticks. Do NOT explain.

PREFIX:
${prefix}

SUFFIX:
${suffix}

COMPLETION:`;

    const groqClient = getGroqClient();
    const completion = await groqClient.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      max_tokens: 40,
      temperature: 0.1, // Low temp for more deterministic code completion
    });

    let suggestion = completion.choices[0]?.message?.content || "";
    
    // Clean up potential markdown formatting if the LLM ignores instructions
    suggestion = suggestion.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trimEnd();

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json({ suggestion: "" }, { status: 500 });
  }
}
