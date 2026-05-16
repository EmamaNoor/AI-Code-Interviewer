"use client";

import React, { useState, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Code2, RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";
import { useInterviewStore } from "@/store/useInterviewStore";

const LANGUAGES = [
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "cpp", name: "C++" },
];

export default function EditorPanel() {
  const { theme } = useTheme();
  const monaco = useMonaco();
  const [mounted, setMounted] = useState(false);
  const { code, setCode, language, changeLanguage, resetCode, hintTiming, hintType, setHintTiming, setHintType } = useInterviewStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!monaco) return;

    let timeout: NodeJS.Timeout | null = null;
    let abortController: AbortController | null = null;

    const provider = monaco.languages.registerInlineCompletionsProvider(LANGUAGES.map(l => l.id), {
      provideInlineCompletions: async (model, position, context, token) => {
        return new Promise((resolve) => {
          if (timeout) clearTimeout(timeout);
          if (abortController) abortController.abort();

          timeout = setTimeout(async () => {
            if (token.isCancellationRequested) {
              return resolve({ items: [] });
            }

            abortController = new AbortController();
            
            // Get last 500 characters for prefix to save tokens
            const prefixRange = {
              startLineNumber: Math.max(1, position.lineNumber - 20),
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            };
            const textUntilPosition = model.getValueInRange(prefixRange);

            // Get next 500 characters for suffix
            const suffixRange = {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: Math.min(model.getLineCount(), position.lineNumber + 20),
              endColumn: model.getLineMaxColumn(Math.min(model.getLineCount(), position.lineNumber + 20)),
            };
            const textAfterPosition = model.getValueInRange(suffixRange);

            // Don't autocomplete if we just typed a space in the middle of nothing
            if (!textUntilPosition.trim()) {
               return resolve({ items: [] });
            }

            try {
              const res = await fetch('/api/autocomplete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  prefix: textUntilPosition,
                  suffix: textAfterPosition,
                  language: model.getLanguageId(),
                  hintType
                }),
                signal: abortController.signal
              });
              
              if (!res.ok) throw new Error();
              const { suggestion } = await res.json();

              if (token.isCancellationRequested || !suggestion) {
                return resolve({ items: [] });
              }

              resolve({
                items: [
                  {
                    insertText: suggestion,
                    range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column)
                  }
                ]
              });
            } catch (e: any) {
              if (e.name !== 'AbortError') {
                console.error(e);
              }
              resolve({ items: [] });
            }
          }, hintTiming === 'instant' ? 400 : 5000); // 400ms for instant, 5s for stuck
        });
      },
      freeInlineCompletions: () => {}
    });

    return () => {
      provider.dispose();
      if (timeout) clearTimeout(timeout);
      if (abortController) abortController.abort();
    };
  }, [monaco, hintTiming, hintType]);

  return (
    <div className="flex flex-col h-full bg-background border-x border-border/50 shadow-2xl z-20">
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-muted/30 flex-wrap gap-2 py-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center">
            <Code2 className="w-4 h-4 mr-2 text-primary" />
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer hover:text-primary transition-colors"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-background">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="hidden sm:block w-px h-4 bg-border"></div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Auto-Hints:</span>
            <select
              value={hintTiming}
              onChange={(e) => setHintTiming(e.target.value as 'instant' | 'stuck')}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer hover:text-primary transition-colors border border-border rounded px-1 py-0.5"
            >
              <option value="stuck" className="bg-background">Stuck (5s)</option>
              <option value="instant" className="bg-background">Instant</option>
            </select>
            <select
              value={hintType}
              onChange={(e) => setHintType(e.target.value as 'concept' | 'code')}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer hover:text-primary transition-colors border border-border rounded px-1 py-0.5"
            >
              <option value="concept" className="bg-background">Concept</option>
              <option value="code" className="bg-background">Code Snippet</option>
            </select>
          </div>
        </div>
        <button 
          onClick={() => {
            if (window.confirm("Are you sure you want to reset your code? This will erase all your work and return to the starter code.")) {
              resetCode();
            }
          }}
          title="Reset to Starter Code"
          className="p-1.5 text-muted-foreground hover:text-red-500 rounded-md hover:bg-muted transition-colors shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 w-full pt-4">
        {mounted && (
          <Editor
            height="100%"
            language={language}
            theme={theme === "dark" ? "vs-dark" : "light"}
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              inlineSuggest: { enabled: true },
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
              fontLigatures: true,
              lineHeight: 24,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              formatOnPaste: true,
              autoClosingBrackets: "always",
              autoClosingQuotes: "always",
              formatOnType: true,
            }}
          />
        )}
      </div>
    </div>
  );
}
