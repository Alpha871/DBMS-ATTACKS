"use client";

import React from "react";

interface OutputPanelProps {
  results: Array<{
    id: number;
    username: string;
    email: string;
    passwordHash: string;
  }>;
  log: string[];
}

const OutputPanel: React.FC<OutputPanelProps> = ({ results, log }) => {
  return (
    <div className="flex flex-col gap-6 p-6 bg-card rounded-xl border border-border">
      <div className="flex justify-between items-center">
        <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em]">
          Database Output
        </h2>
        <span className="inline-flex items-center rounded-full bg-green-600/20 px-3 py-1 text-sm font-medium text-green-500">
          Success
        </span>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted">
            <tr className="text-muted-foreground">
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Username</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Password Hash</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="border-t border-border/60">
                <th
                  className="px-6 py-4 font-medium whitespace-nowrap"
                  scope="row"
                >
                  {r.id}
                </th>
                <td className="px-6 py-4">{r.username}</td>
                <td className="px-6 py-4">{r.email}</td>
                <td className="px-6 py-4 font-mono">{r.passwordHash}</td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td className="px-6 py-6 text-muted-foreground" colSpan={4}>
                  No rows returned.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-base font-bold tracking-[-0.01em]">
          System Log / Errors
        </h3>
        <div className="bg-foreground/90 dark:bg-foreground/5 p-4 rounded-lg font-mono text-sm text-muted-foreground h-32 overflow-y-auto">
          {log.length === 0 ? (
            <p className="text-muted-foreground">No logs yet.</p>
          ) : (
            log.map((entry, i) => <p key={i}>{entry}</p>)
          )}
        </div>
      </div>
    </div>
  );
};

export default OutputPanel;
