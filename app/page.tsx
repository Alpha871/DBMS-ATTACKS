"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import QueryPanel from "@/components/custom-components/query-panel";
import OutputPanel from "@/components/custom-components/output-panel";
import { DEMO_ROWS } from "@/lib/constant";

function ts() {
  return new Date().toLocaleTimeString();
}

export default function Home() {
  // Start with no data shown
  const [results, setResults] = useState<typeof DEMO_ROWS>([]);
  const [log, setLog] = useState<string[]>([
    `[INFO] Demo ready — no data displayed until execution.`,
  ]);
  const [protectedMode, setProtectedMode] = useState<boolean>(false);

  // Vulnerable execution handler
  const handleVulnerable = ({
    input,
    isInjection,
  }: {
    input: string;
    isInjection: boolean;
  }) => {
    if (isInjection) {
      setResults(DEMO_ROWS);
      setLog((l) => [
        `[ALERT] Injection detected: input="${input}"`,
        `[SUCCESS] Query executed (vulnerable) at ${ts()}.`,
        `[INFO] 3 rows returned (exfiltrated).`,
        ...l,
      ]);
    } else {
      // Non-injection: naive filtering (may return some rows)
      const filtered = DEMO_ROWS.filter(
        (r) => r.email.includes(input) || r.username.includes(input)
      );
      setResults(filtered);
      setLog((l) => [
        `[SUCCESS] Query executed (vulnerable) at ${ts()}.`,
        `[INFO] ${filtered.length} row(s) returned.`,
        ...l,
      ]);
    }
  };

  // Protected execution handler
  const handleProtected = ({ input }: { input: string }) => {
    const filtered = DEMO_ROWS.filter(
      (r) => r.email === input || r.username === input
    );
    setResults(filtered);
    setLog((l) => [
      `[SUCCESS] Query executed (protected) at ${ts()}.`,
      `[INFO] ${filtered.length} row(s) returned (protected).`,
      ...l,
    ]);
  };

  const resetDemo = () => {
    setResults([]); // clear output
    setLog((l) => [`[INFO] Demo reset at ${ts()}.`, ...l]);
  };

  return (
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div className="flex min-w-72 flex-col gap-2">
            <h1 className="text-4xl font-black leading-tight tracking-[-0.033em]">
              Interactive SQL Injection Demo
            </h1>
            <p className="text-muted-foreground">
              Toggle Protected Mode to simulate parameterized queries that
              prevent injection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Protected Mode
              </span>
              <button
                onClick={() => setProtectedMode((s) => !s)}
                className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors focus:outline-none ${
                  protectedMode ? "bg-green-500" : "bg-[#392828]"
                }`}
                aria-pressed={protectedMode}
                title={
                  protectedMode ? "Protected mode ON" : "Protected mode OFF"
                }
              >
                <span
                  className={`block h-6 w-6 rounded-full bg-white transform transition-transform ${
                    protectedMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <Button
              onClick={resetDemo}
              className="h-10 min-w-[84px] rounded-lg px-4 bg-accent text-accent-foreground text-sm font-bold"
            >
              Reset Demo
            </Button>
          </div>
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <QueryPanel
            protectedMode={protectedMode}
            onVulnerable={handleVulnerable}
            onProtected={handleProtected}
          />
          <OutputPanel results={results} log={log} />
        </div>
      </div>
    </main>
  );
}
