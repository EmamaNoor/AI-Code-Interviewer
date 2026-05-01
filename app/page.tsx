import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1 className="text-4xl font-extrabold mb-8 tracking-tight">AI Code Interviewer</h1>
      <p className="text-muted-foreground text-center max-w-2xl mb-8">
        Practice your coding skills in a realistic, browser-based environment with AI-powered hints and real-time evaluation.
      </p>
      <Link 
        href={`/interview/session-${Date.now()}`}
        className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
      >
        Start New Interview
      </Link>
    </div>
  );
}
