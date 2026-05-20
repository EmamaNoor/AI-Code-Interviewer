import Groq from "groq-sdk";

let groqInstance: Groq | null = null;

export const getGroqClient = () => {
  if (!groqInstance) {
    groqInstance = new Groq({
      apiKey: process.env.GROQ_API_KEY || "dummy_key_for_build",
    });
  }
  return groqInstance;
};

