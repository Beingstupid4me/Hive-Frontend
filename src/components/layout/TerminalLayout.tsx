"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function TerminalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
