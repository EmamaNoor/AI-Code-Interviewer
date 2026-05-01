"use client";

import React, { useState, useEffect } from "react";
import { Lightbulb, Timer, Send, MessageSquare, SkipForward } from "lucide-react";
import { useInterviewStore } from "@/store/useInterviewStore";
import ReactMarkdown from 'react-markdown';

export default function HintPanel() {
  const [seconds, setSeconds] = useState(0);
  const { chatHistory, isSubmitting, submitSolution, skipProblem } = useInterviewStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-muted/30">
        <div className="flex items-center text-muted-foreground">
          <MessageSquare className="w-4 h-4 mr-2" />
          <span className="font-medium text-sm">AI Assistant</span>
        </div>
        <div className="flex items-center bg-background px-3 py-1 rounded-full border border-border">
          <Timer className="w-3.5 h-3.5 mr-1.5 text-primary animate-pulse" />
          <span className="text-xs font-mono font-medium">{formatTime(seconds)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
        {chatHistory.map((msg, index) => (
          <div key={msg.id || index} className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 p-2 rounded-full flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border bg-card flex gap-3">
        <button
          onClick={skipProblem}
          className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground py-3 rounded-md font-medium transition-all"
        >
          <SkipForward className="w-4 h-4" />
          Skip
        </button>
        <button
          onClick={submitSolution}
          disabled={isSubmitting}
          className="flex-[2] flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-md font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Solution
            </>
          )}
        </button>
      </div>
    </div>
  );
}
