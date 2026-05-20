"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import { 
  ClipboardList, 
  BookOpen, 
  Clock, 
  ChevronRight, 
  Award, 
  Plus, 
  Brain, 
  Code2, 
  Sparkles, 
  Terminal 
} from "lucide-react";

export default function Home() {
  const [difficulty, setDifficulty] = useState("Medium");
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const router = useRouter();
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    if (isLoaded && userId) {
      fetch('/api/history')
        .then(res => res.json())
        .then(data => {
          setHistory(Array.isArray(data) ? data : []);
          setLoadingHistory(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingHistory(false);
        });
    } else {
      setLoadingHistory(false);
    }
  }, [isLoaded, userId]);

  const handleStart = () => {
    router.push(`/interview/session-${Date.now()}?difficulty=${difficulty}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-8 md:p-24 bg-background text-foreground overflow-y-auto custom-scrollbar">
      <div className="absolute top-4 right-4 flex items-center gap-3 z-20">
        {userId && <UserButton />}
        <ThemeToggle />
      </div>
      
      <div className="flex flex-col items-center justify-center text-center max-w-3xl mt-16 md:mt-8">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
          Codely
        </h1>
        <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mb-12 leading-relaxed">
          A browser-based interview simulator that generates coding problems, watches you code in real-time, drops hints when you're stuck, and scores your solution with specific feedback on what to fix.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 items-center bg-card/30 border border-border px-12 py-6 rounded-2xl w-full max-w-xl justify-center shadow-lg backdrop-blur-sm">
          <div className="flex gap-2">
            {["Easy", "Medium", "Hard"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDifficulty(lvl)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  difficulty === lvl 
                    ? "bg-primary text-primary-foreground shadow-md scale-105" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button 
            onClick={handleStart}
            className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Start Interview
          </button>
        </div>
      </div>

      {/* Feature Showcase Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mt-20 text-left">
        <div className="p-6 rounded-2xl border border-border/50 bg-card/25 backdrop-blur-sm hover:border-primary/30 transition-all hover:-translate-y-1 duration-300 group">
          <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors">On-Demand Problems</h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Generate customizable, LeetCode-style coding challenges instantly powered by llama-3.3-70b.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border/50 bg-card/25 backdrop-blur-sm hover:border-primary/30 transition-all hover:-translate-y-1 duration-300 group">
          <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors">Monaco Code Editor</h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Code in a professional interface with syntax highlighting, language switching, and local execution.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border/50 bg-card/25 backdrop-blur-sm hover:border-primary/30 transition-all hover:-translate-y-1 duration-300 group">
          <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors">Non-Spoiling Hints</h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Receive smart, real-time conceptual nudges or code completions without spoiling the solution.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border/50 bg-card/25 backdrop-blur-sm hover:border-primary/30 transition-all hover:-translate-y-1 duration-300 group">
          <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors">Smart Evaluation</h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Submit your code for instant grading, complexity analysis, and specific improvement actions.
          </p>
        </div>
      </div>

      {userId && (
        <div className="w-full max-w-5xl mt-16 border border-border rounded-2xl bg-card/30 backdrop-blur-sm p-6 shadow-lg animate-fade-in mb-12">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Your Progress Dashboard</h2>
            </div>
            <span className="text-xs font-semibold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
              {history.length} attempts
            </span>
          </div>

          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/80">
              <Clock className="w-8 h-8 mb-3 animate-spin text-primary" />
              <p className="text-sm">Loading attempts history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-xl bg-card/10">
              <Award className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-60" />
              <p className="font-semibold text-muted-foreground mb-1">No previous attempts found.</p>
              <p className="text-xs text-muted-foreground/80">Take your first mock coding interview to track your evaluations here!</p>
            </div>
          ) : (
            <div className="grid gap-3.5 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {history.map((session) => {
                let problemObj = { title: "Coding Challenge", difficulty: "Medium" };
                try {
                  problemObj = JSON.parse(session.problem);
                } catch(e) {}
                
                const evaluation = session.evaluations[0];
                const dateStr = new Date(session.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

                return (
                  <div key={session.id} className="flex items-center justify-between p-4 border border-border rounded-xl bg-card/40 hover:bg-card/70 hover:border-primary/30 transition-all duration-200 group">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{problemObj.title}</h3>
                        <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground mt-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                            problemObj.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                            problemObj.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {problemObj.difficulty}
                          </span>
                          <span className="uppercase font-mono font-bold tracking-wider text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border/50">{session.language}</span>
                          <span>•</span>
                          <span>{dateStr}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {evaluation ? (
                        <div className="flex items-center gap-1.5 bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                          <Award className="w-3.5 h-3.5 text-primary" />
                          <span className={`font-extrabold text-xs ${
                            evaluation.score >= 80 ? 'text-green-500' :
                            evaluation.score >= 50 ? 'text-yellow-500' :
                            'text-red-500'
                          }`}>
                            {evaluation.score}/100
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                          In Progress
                        </span>
                      )}

                      <Link
                        href={`/interview/${session.id}`}
                        className="flex items-center gap-0.5 text-xs font-bold text-primary hover:underline hover:text-primary/80 transition-colors"
                      >
                        Review
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
