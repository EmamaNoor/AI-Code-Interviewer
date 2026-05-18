import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

import { ClerkProvider } from '@clerk/nextjs'

export const metadata: Metadata = {
  title: "AI Code Interviewer",
  description: "Browser-Based AI Code Interviewer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body suppressHydrationWarning className={`${inter.className} min-h-screen bg-background antialiased overflow-hidden`}>
          <script dangerouslySetInnerHTML={{ __html: `
            window.addEventListener('unhandledrejection', function(event) {
              if (event.reason) {
                try {
                  const reasonStr = typeof event.reason === 'object' ? JSON.stringify(event.reason) : String(event.reason);
                  if (reasonStr.includes('cancel') || reasonStr.includes('Cancel') || reasonStr.includes('AbortError') || reasonStr === '{}') {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                  }
                } catch(e) {}
              }
            }, true);
          `}} />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
