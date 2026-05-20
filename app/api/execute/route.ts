import { NextResponse } from "next/server";
import { getGroqClient } from "@/lib/groq";

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    const prompt = `You are a sandboxed code execution engine. Your job is to statically analyze and "run" the provided code in your head.
If the code has syntax errors or would crash, output the exact error message in "stderr" and leave "stdout" blank.
If the code compiles and runs successfully, simulate the output of any print/console statements and output them in "stdout".
DO NOT output anything other than this exact JSON structure:
{
  "stdout": "...",
  "stderr": "..."
}

Language: ${language}
Code to execute:
\`\`\`
${code}
\`\`\``;

    const groqClient = getGroqClient();
    const completion = await groqClient.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      max_tokens: 300,
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(response);

    return NextResponse.json({
      stdout: data.stdout || "",
      stderr: data.stderr || "",
      compile_output: ""
    });
  } catch (error) {
    console.error("Execution error:", error);
    return NextResponse.json({ stdout: "", stderr: "Internal Engine Error: Could not execute code.", compile_output: "" }, { status: 500 });
  }
}
