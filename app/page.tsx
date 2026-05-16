"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [difficulty, setDifficulty] = useState("Medium");
  const router = useRouter();

  const handleStart = () => {
    router.push(`/interview/session-${Date.now()}?difficulty=${difficulty}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight">AI Code Interviewer</h1>
      <p className="text-muted-foreground text-center max-w-2xl mb-8">
        Practice your coding skills in a realistic, browser-based environment with AI-powered hints and real-time evaluation.
      </p>

      <div className="flex gap-4 mb-8">
        {["Easy", "Medium", "Hard"].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setDifficulty(lvl)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              difficulty === lvl 
                ? "bg-primary text-primary-foreground shadow-md" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      <button 
        onClick={handleStart}
        className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
      >
        Start New Interview
      </button>
    </div>
  );
}
