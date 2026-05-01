"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { useInterviewStore } from "@/store/useInterviewStore";

export default function ProblemPanel() {
  const { problem } = useInterviewStore();

  if (!problem) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-muted-foreground animate-pulse">
        <BookOpen className="w-8 h-8 mb-4 opacity-50" />
        <p>Loading problem from AI...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="h-12 border-b border-border flex items-center px-4 bg-muted/30">
        <BookOpen className="w-4 h-4 mr-2 text-muted-foreground" />
        <span className="font-medium text-sm text-muted-foreground">Problem Description</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{problem.title}</h2>
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
            problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
            'bg-red-500/10 text-red-500'
          }`}>
            {problem.difficulty}
          </span>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{problem.description}</p>

          {problem.examples?.map((ex, i) => (
            <div key={i} className="my-6">
              <h3 className="text-lg font-semibold mb-2">Example {i + 1}:</h3>
              <div className="bg-muted p-4 rounded-md font-mono text-sm">
                <p><span className="font-semibold text-muted-foreground">Input:</span> {ex.input}</p>
                <p><span className="font-semibold text-muted-foreground">Output:</span> {ex.output}</p>
                {ex.explanation && <p><span className="font-semibold text-muted-foreground">Explanation:</span> {ex.explanation}</p>}
              </div>
            </div>
          ))}

          <div className="my-6">
            <h3 className="text-lg font-semibold mb-2">Constraints:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm bg-muted/30 p-4 rounded-md">
              {problem.constraints?.map((c, i) => (
                <li key={i}><code>{c}</code></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
