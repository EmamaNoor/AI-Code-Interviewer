"use client";

import React, { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import EditorPanel from "@/components/Editor";
import ProblemPanel from "@/components/Problem";
import HintPanel from "@/components/Hint";
import FeedbackModal from "@/components/Feedback";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LayoutDashboard, BookOpen, Code, MessageSquare } from "lucide-react";
import { useInterviewStore } from "@/store/useInterviewStore";
import { useEffect } from "react";
import { useAuth, RedirectToSignIn } from "@clerk/nextjs";

import { useParams, useSearchParams } from "next/navigation";

export default function InterviewPage() {
  const { initSession } = useInterviewStore();
  const params = useParams();
  const searchParams = useSearchParams();
  const { isLoaded, userId } = useAuth();
  
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'problem' | 'editor' | 'hint'>('editor');

  const sessionId = params?.sessionId as string;
  const difficulty = searchParams?.get("difficulty") || "Medium";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (sessionId && isLoaded && userId) {
      initSession(sessionId, difficulty);
    }
  }, [sessionId, difficulty, initSession, isLoaded, userId]);

  if (!isLoaded) {
    return <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
  }

  if (!userId) {
    return <RedirectToSignIn />;
  }

  return (
    <>
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
          <main className="flex-1 overflow-hidden flex flex-col">
            {isMobile ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Tab Bar */}
                <div className="flex border-b border-border bg-card/70 backdrop-blur-md">
                  {([
                    { id: 'problem', label: 'Problem', icon: BookOpen },
                    { id: 'editor', label: 'Editor', icon: Code },
                    { id: 'hint', label: 'AI Chat', icon: MessageSquare }
                  ] as const).map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-hidden relative">
                  <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'problem' ? 'block' : 'hidden'}`}>
                    <ProblemPanel />
                  </div>
                  <div className={`absolute inset-0 ${activeTab === 'editor' ? 'block' : 'hidden'}`}>
                    <EditorPanel />
                  </div>
                  <div className={`absolute inset-0 overflow-y-auto ${activeTab === 'hint' ? 'block' : 'hidden'}`}>
                    <HintPanel />
                  </div>
                </div>
              </div>
            ) : (
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
            )}
          </main>
 
          {/* Evaluation Feedback Overlay */}
          <FeedbackModal />
        </div>
    </>
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
