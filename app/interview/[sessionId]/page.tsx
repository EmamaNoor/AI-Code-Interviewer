"use client";

import React, { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import EditorPanel from "@/components/Editor";
import ProblemPanel from "@/components/Problem";
import HintPanel from "@/components/Hint";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LayoutDashboard } from "lucide-react";
import { useInterviewStore } from "@/store/useInterviewStore";
import { useEffect } from "react";

export default function InterviewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { initSession } = useInterviewStore();
  const { sessionId } = React.use(params);

  useEffect(() => {
    initSession(sessionId);
  }, [sessionId, initSession]);

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          <h1 className="font-semibold tracking-tight">AI Interviewer</h1>
          <span className="text-xs text-muted-foreground ml-2 px-2 py-0.5 bg-muted rounded-full">
            {sessionId}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Left Panel: Problem Statement */}
          <Panel defaultSize={25} minSize={20} className="bg-card">
            <ProblemPanel />
          </Panel>

          <ResizeHandle />

          {/* Center Panel: Editor */}
          <Panel defaultSize={50} minSize={30} className="bg-background">
            <EditorPanel />
          </Panel>

          <ResizeHandle />

          {/* Right Panel: Hints & Timer */}
          <Panel defaultSize={25} minSize={20} className="bg-card">
            <HintPanel />
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
}

// Custom resize handle for a premium look
function ResizeHandle() {
  return (
    <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/50 transition-colors flex items-center justify-center cursor-col-resize z-10 group">
      <div className="h-8 w-0.5 bg-muted-foreground/30 group-hover:bg-primary/80 rounded-full transition-colors" />
    </PanelResizeHandle>
  );
}
