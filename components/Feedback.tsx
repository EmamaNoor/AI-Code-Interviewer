"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Code, Cpu, Layers, ListChecks, SkipForward, RotateCcw, Eye } from "lucide-react";
import { useInterviewStore } from "@/store/useInterviewStore";
import Editor from "@monaco-editor/react";

export default function FeedbackModal() {
  const { problem, evaluation, skipProblem, retryWithHint } = useInterviewStore();
  const [showSolution, setShowSolution] = useState(false);

  if (!evaluation) return null;

  const { score, correctness, time_complexity, space_complexity, issues, improvements, verdict } = evaluation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border shadow-2xl rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full flex items-center justify-center ${
              score >= 80 ? "bg-green-500/20 text-green-500" :
              score >= 50 ? "bg-yellow-500/20 text-yellow-500" :
              "bg-red-500/20 text-red-500"
            }`}>
              {score >= 80 ? <CheckCircle2 className="w-8 h-8" /> : 
               score >= 50 ? <AlertTriangle className="w-8 h-8" /> : 
               <XCircle className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Solution Evaluated</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <span className="capitalize font-medium">Verdict: {correctness}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-extrabold ${
              score >= 80 ? "text-green-500" :
              score >= 50 ? "text-yellow-500" :
              "text-red-500"
            }`}>
              {score}<span className="text-xl text-muted-foreground">/100</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {showSolution ? (
            <div className="space-y-4 h-full flex flex-col">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-primary">
                <Code className="w-5 h-5" /> Reference Solution
              </h3>
              <div className="flex-1 border border-border rounded-md overflow-hidden bg-background">
                <Editor
                  height="400px"
                  language={useInterviewStore.getState().language}
                  theme="vs-dark"
                  value={problem?.solution || "No solution provided."}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    padding: { top: 16 },
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-2">
                  <ListChecks className="w-5 h-5 text-primary" /> Overall Verdict
                </h3>
                <p className="text-sm leading-relaxed">{verdict}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2 text-muted-foreground">
                    <Cpu className="w-4 h-4" /> Time Complexity
                  </h4>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm">{time_complexity}</div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2 text-muted-foreground">
                    <Layers className="w-4 h-4" /> Space Complexity
                  </h4>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm">{space_complexity}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-red-500">
                    <AlertTriangle className="w-5 h-5" /> Issues & Bugs
                  </h3>
                  {issues && issues.length > 0 ? (
                    <ul className="space-y-3">
                      {issues.map((issue: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-sm bg-red-500/5 p-3 rounded-md border border-red-500/10">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No major issues found.</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-primary">
                    <Code className="w-5 h-5" /> Concrete Suggestions
                  </h3>
                  {improvements && improvements.length > 0 ? (
                    <ul className="space-y-3">
                      {improvements.map((improvement: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-sm bg-primary/5 p-3 rounded-md border border-primary/10">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Your solution is already optimal!</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/10 flex justify-between items-center gap-4">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="px-6 py-2.5 rounded-md font-medium text-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
          >
            {showSolution ? <ListChecks className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showSolution ? "View Feedback" : "View Solution"}
          </button>
          
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowSolution(false);
                retryWithHint();
              }}
              className="px-6 py-2.5 rounded-md font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Retry Problem
            </button>
            <button
              onClick={skipProblem}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
            >
              Next Problem <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}