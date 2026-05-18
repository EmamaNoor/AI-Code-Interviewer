"use client";

import React, { useState, useEffect } from "react";
import { Lightbulb, Timer, Send, MessageSquare, SkipForward } from "lucide-react";
import { useInterviewStore } from "@/store/useInterviewStore";
import ReactMarkdown from 'react-markdown';

export default function HintPanel() {
  const [seconds, setSeconds] = useState(0);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const { chatHistory, isSubmitting, submitSolution, skipProblem, requestHint, isAiTyping, lastHintTime, executeCode, isExecuting } = useInterviewStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (lastHintTime) {
        const remaining = Math.max(0, 30 - Math.floor((Date.now() - lastHintTime) / 1000));
        setCooldownLeft(remaining);
      } else {
        setCooldownLeft(0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastHintTime]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      <div className="min-h-[56px] border-b border-border flex items-center justify-between px-4 py-2 bg-muted/30 gap-3">
        <div className="flex items-center text-muted-foreground gap-2">
          <MessageSquare className="w-4 h-4 mr-2" />
          <span className="font-medium text-sm hidden sm:inline">AI Assistant</span>
        </div>
        
        <div className="flex items-center bg-background px-3 py-1 rounded-full border border-border shrink-0">
          <Timer className="w-3.5 h-3.5 mr-1.5 text-primary animate-pulse" />
          <span className="text-xs font-mono font-medium">{formatTime(seconds)}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
        {chatHistory.map((msg, index) => (
          <div key={msg.id || index} className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
            <div className="flex items-start gap-3 w-full">
              <div className="bg-primary/20 p-2 rounded-full flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none min-w-0 flex-1 overflow-x-auto">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isAiTyping && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm animate-pulse">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-full flex-shrink-0">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <p className="text-muted-foreground italic">AI Assistant is analyzing your code...</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border bg-card grid grid-cols-2 gap-2">
        <button
          onClick={skipProblem}
          className="flex items-center justify-center gap-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground py-2.5 rounded-md font-medium transition-all text-sm w-full"
        >
          <SkipForward className="w-4 h-4" />
          Skip
        </button>
        <button
          onClick={requestHint}
          disabled={cooldownLeft > 0}
          className={`flex items-center justify-center gap-1.5 py-2.5 rounded-md font-medium transition-all text-sm w-full ${
            cooldownLeft > 0 
              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-70' 
              : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/30'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          {cooldownLeft > 0 ? `Wait ${cooldownLeft}s` : 'Hint'}
        </button>
        <button
          onClick={executeCode}
          disabled={isExecuting || isSubmitting}
          className="flex items-center justify-center gap-1.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 py-2.5 rounded-md font-medium transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed w-full"
        >
          {isExecuting ? (
            <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          ) : (
            <span className="font-mono">{'>_'}</span>
          )}
          Run
        </button>
        <button
          onClick={submitSolution}
          disabled={isSubmitting}
          className="flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-md font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm w-full"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit
            </>
          )}
        </button>
      </div>
    </div>
  );
}
