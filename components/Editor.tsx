"use client";

import React, { useState, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { Code2, Settings2 } from "lucide-react";
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
  const [language, setLanguage] = useState("javascript");
  const { theme } = useTheme();
  const monaco = useMonaco();
  const [mounted, setMounted] = useState(false);
  const { code, setCode } = useInterviewStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col h-full bg-background border-x border-border/50 shadow-2xl z-20">
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-muted/30">
        <div className="flex items-center">
          <Code2 className="w-4 h-4 mr-2 text-primary" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer hover:text-primary transition-colors"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id} className="bg-background">
                {lang.name}
              </option>
            ))}
          </select>
        </div>
        <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
          <Settings2 className="w-4 h-4" />
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
            }}
          />
        )}
      </div>
    </div>
  );
}
