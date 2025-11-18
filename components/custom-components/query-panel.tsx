"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type QueryPanelProps = {
  protectedMode: boolean;
  onVulnerable: (payload: { input: string; isInjection: boolean }) => void;
  onProtected: (payload: { input: string }) => void;
};

const QueryPanel: React.FC<QueryPanelProps> = ({
  protectedMode,
  onVulnerable,
  onProtected,
}) => {
  const [userInput, setUserInput] = useState<string>("' OR '1'='1");

  const [message, setMessage] = useState<string | null>(null);

  const modeHint = useMemo(
    () =>
      protectedMode
        ? "Protected mode is ON — Execute will run a parameterized query."
        : "Protected mode is OFF — Execute will run the vulnerable path.",
    [protectedMode]
  );

  const isInjectionPayload = (val: string) => {
    const s = val.toLowerCase();
    return (
      s.includes("' or '1'='1") ||
      s.includes("1'='1") ||
      s.includes(" or 1=1") ||
      s.includes("--") ||
      s.includes("'; --")
    );
  };

  const run = () => {
    if (protectedMode) {
      onProtected({ input: userInput });
      setMessage("Protected query executed (parameterized).");
    } else {
      const inj = isInjectionPayload(userInput);
      onVulnerable({ input: userInput, isInjection: inj });
      setMessage(
        inj
          ? "Executed attack: Data exfiltrated."
          : "Query executed (vulnerable)."
      );
    }
  };

  const resetPanel = () => {
    setUserInput("' OR '1'='1");
    setMessage(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-card rounded-xl border border-border">
      <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em]">
        Query Construction &amp; Execution
      </h2>

      {/* Mode banner derives from prop; no state syncing */}
      <div
        className={[
          "rounded-lg p-3 text-center border",
          protectedMode
            ? "bg-green-500/10 border-green-500"
            : "bg-destructive/20 border-destructive",
        ].join(" ")}
      >
        <p className="text-base font-bold">
          {protectedMode
            ? "Protected: Parameterized Query"
            : "Insecure: String Concatenation Used"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{modeHint}</p>
      </div>

      <div className="bg-foreground/90 dark:bg-foreground/5 p-4 rounded-lg font-mono text-sm text-foreground/90 overflow-x-auto">
        <span className="opacity-80">SELECT</span> *{" "}
        <span className="opacity-80">FROM</span> users{" "}
        <span className="opacity-80">WHERE</span> email ={" "}
        <span className="opacity-80">&lsquo;</span>
        <span className="font-bold text-accent-foreground">{userInput}</span>
        <span className="opacity-80">&rsquo;</span>;
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="userInput" className="text-sm font-medium">
          User Input (email):
        </label>
        <Input
          id="userInput"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="' OR '1'='1"
          className="font-mono"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Button onClick={run} className="flex-1 bg-destructive text-white">
          Execute
        </Button>
        <Button
          onClick={resetPanel}
          className="flex-1 bg-green-500 text-primary-foreground hover:bg-green-500/90"
        >
          Reset Panel
        </Button>
      </div>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
};

export default QueryPanel;
