"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { randomValue } from "@/lib/utils";
import { INITIAL_LOG, INITIAL_RECORDS } from "@/lib/constant";

function Toggle({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full p-0.5 transition-colors ${
        checked ? "justify-end bg-primary" : "justify-start bg-[#392828]"
      } focus:outline-none focus:ring-2 focus:ring-primary/50`}
      title={checked ? "RBAC Enabled" : "RBAC Disabled"}
    >
      <div className="h-full w-[27px] rounded-full bg-white transition-transform" />
    </button>
  );
}

export default function RbacSimulatorPage() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [dark]);

  // RBAC & data state
  const [role, setRole] = useState<string>("employee");
  const [rbacEnabled, setRbacEnabled] = useState<boolean>(true);
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [logs, setLogs] = useState(INITIAL_LOG);

  // Dialogs
  const [violation, setViolation] = useState<{
    open: boolean;
    action?: string;
    id?: number;
    reason?: string;
  }>({ open: false });

  const [edit, setEdit] = useState<{
    open: boolean;
    data?: {
      id: number;
      name: string;
      email: string;
      salary: string;
      notes: string;
    };
  }>({ open: false });
  const [confirmDel, setConfirmDel] = useState<{ open: boolean; id?: number }>({
    open: false,
  });

  // Permissions
  const canDelete = useMemo(
    () => (rn: string) => !rbacEnabled || rn === "admin",
    [rbacEnabled]
  );
  const canExport = useMemo(
    () => (rn: string) => !rbacEnabled || rn === "admin",
    [rbacEnabled]
  );
  const canEdit = useMemo(
    () => (rn: string) => !rbacEnabled || rn === "admin" || rn === "employee",
    [rbacEnabled]
  );

  const [ransomwareActive, setRansomwareActive] = useState(false);
  const [dosActive, setDosActive] = useState(false);
  const [dosLatencyMs, setDosLatencyMs] = useState<number>(600);
  const [dosFailurePct, setDosFailurePct] = useState<number>(40);
  const [recordsBackup, setRecordsBackup] = useState<
    typeof INITIAL_RECORDS | null
  >(null);

  // Utils
  function log(status: "Allowed" | "Denied", msg: string) {
    const ts = new Date().toISOString().replace("T", " ").slice(0, 19);
    setLogs((l) => [{ ts, message: msg, status }, ...l]);
  }

  function encryptText(s: string) {
    return "🔒 " + btoa(unescape(encodeURIComponent(s))).slice(0, 10) + "…";
  }
  function encryptRecords(rs: typeof INITIAL_RECORDS) {
    return rs.map((r) => ({
      ...r,
      email: encryptText(r.email),
      salary: encryptText(r.salary),
      notes: encryptText(r.notes),
    }));
  }

  function startRansomware() {
    if (ransomwareActive) return;
    if (!recordsBackup) setRecordsBackup(records);
    setRecords((prev) => encryptRecords(prev));
    setRansomwareActive(true);
    log("Denied", "Ransomware started — data encrypted at rest.");
  }
  function stopRansomware() {
    if (!ransomwareActive) return;
    if (recordsBackup) {
      setRecords(recordsBackup);
      setRecordsBackup(null);
    }
    setRansomwareActive(false);
    log("Allowed", "Ransomware neutralized — data restored from backup.");
  }

  async function performWithDoS<T>(fn: () => T) {
    if (!dosActive) return fn();
    await new Promise((res) => setTimeout(res, Math.max(0, dosLatencyMs)));

    const roll = randomValue() * 100;
    if (roll < dosFailurePct) {
      throw new Error("Service Unavailable (simulated DoS)");
    }
    return fn();
  }

  async function tryAction(
    action: "view" | "edit" | "delete" | "export",
    id: number
  ) {
    // When ransomware active, only view is allowed
    if (ransomwareActive && action !== "view") {
      const reason = `Action "${action}" blocked: data is encrypted (ransomware active).`;
      log(
        "Denied",
        `${role} attempted to ${action} record #${id} while data encrypted.`
      );
      setViolation({ open: true, action, id, reason });
      return;
    }

    const allowed =
      action === "view"
        ? true
        : action === "edit"
        ? canEdit(role)
        : action === "delete"
        ? canDelete(role)
        : canExport(role);

    if (!allowed) {
      const reason = `Action "${action}" is not permitted for role "${role}" ${
        rbacEnabled ? "(RBAC enabled)" : ""
      }.`;
      log("Denied", `${role} attempted to ${action} record #${id}.`);
      setViolation({ open: true, action, id, reason });
      return;
    }

    try {
      await performWithDoS(() => true);

      log("Allowed", `${role} performed ${action} on record #${id}.`);
      if (action === "edit") {
        const found = records.find((r) => r.id === id)!;
        setEdit({ open: true, data: { ...found } });
      } else if (action === "delete") {
        setConfirmDel({ open: true, id });
      } else if (action === "export") {
        alert("Export started (simulated).");
      } else if (action === "view") {
        alert(`Viewing record #${id} (simulated).`);
      }
    } catch {
      log("Denied", `Request failed under DoS: ${role} ${action} #${id}.`);
      setViolation({
        open: true,
        action,
        id,
        reason: "Service Unavailable — simulated DoS dropped the request.",
      });
    }
  }

  // Save edit
  function saveEdit() {
    if (!edit.data) return;
    setRecords((prev) =>
      prev.map((r) => (r.id === edit.data!.id ? edit.data! : r))
    );
    log("Allowed", `${role} saved edits for record #${edit.data.id}.`);
    setEdit({ open: false });
  }

  // Confirm delete
  function doDelete() {
    if (!confirmDel.id && confirmDel.id !== 0) return;
    setRecords((prev) => prev.filter((r) => r.id !== confirmDel.id));
    log("Allowed", `${role} deleted record #${confirmDel.id}.`);
    setConfirmDel({ open: false });
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#F0F0F0] flex-1">
      <div className="relative w-full overflow-x-hidden">
        <div className="px-4 sm:px-8 md:px-12 xl:px-20 py-5">
          <div className="max-w-5xl w-full mx-auto">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#392828] px-4 md:px-10 py-3">
              <div className="flex items-center gap-4">
                <div className="size-6 text-primary">
                  {/* shield svg */}
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                  >
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                  </svg>
                </div>
                <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                  RBAC Threat Simulator
                </h1>
              </div>

              <div className="flex gap-2">
                <Button
                  className="bg-primary text-white h-10 px-4 min-w-[84px] max-w-[480px]"
                  onClick={() => alert("Help — describe simulation here")}
                >
                  Help
                </Button>
                <Button
                  variant="secondary"
                  className="h-10 px-4 min-w-[84px] max-w-[480px]"
                  onClick={() => alert("Open docs")}
                >
                  Documentation
                </Button>
                <Button variant="ghost" onClick={() => setDark((d) => !d)}>
                  {dark ? "Light" : "Dark"}
                </Button>
              </div>
            </header>

            {/* Title */}
            <div className="flex flex-wrap justify-between gap-3 px-4 mt-8">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                  Role-Based Access Control Demo
                </p>
                <p className="text-[#b99d9d] text-base">
                  Observe how RBAC mitigates insider threats by enforcing the
                  principle of least privilege.
                </p>
              </div>
            </div>

            {/* Control Panel */}
            <section className="px-4">
              <h2 className="text-white text-[22px] font-bold pb-3 pt-5">
                Control Panel
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg border border-[#392828] bg-[#1E1E1E] p-4">
                <div className="flex max-w-full flex-wrap items-end gap-4">
                  <label className="flex flex-col min-w-40 flex-1">
                    <p className="text-white text-base font-medium pb-2">
                      Select User Role
                    </p>
                    <Select
                      onValueChange={(val) => setRole(val)}
                      defaultValue={role}
                    >
                      <SelectTrigger className="w-full h-14 rounded-lg border border-[#543b3b] bg-[#271c1c] text-white px-4 py-3">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                </div>
                <div className="p-4">
                  <div className="flex flex-1 flex-col items-start justify-between gap-4 p-0 sm:flex-row sm:items-center">
                    <div className="flex flex-col gap-1">
                      <p className="text-white text-base font-bold">
                        RBAC Simulation
                      </p>
                      <p className="text-[#b99d9d] text-base">
                        Enable or disable RBAC to see its effect on data access.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Toggle
                        checked={rbacEnabled}
                        onCheckedChange={(v) => setRbacEnabled(v)}
                      />
                      <span className="text-sm text-[#b99d9d]">
                        {rbacEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Attack Simulator — Ransomware & DoS */}
            <section className="px-4">
              <h2 className="text-white text-[22px] font-bold pb-3 pt-5">
                Attack Simulator — Ransomware & DoS
              </h2>

              <div className="grid grid-cols-1 gap-4 rounded-lg border border-[#392828] bg-[#1E1E1E] p-4">
                {/* Ransomware row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-white font-semibold">Ransomware</p>
                    <p className="text-[#b99d9d] text-sm">
                      Encrypts sensitive fields (email, salary, notes). Only
                      read (view) is allowed until restored.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!ransomwareActive ? (
                      <Button
                        className="bg-primary text-white"
                        onClick={startRansomware}
                      >
                        Start Ransomware
                      </Button>
                    ) : (
                      <Button variant="destructive" onClick={stopRansomware}>
                        Restore & Decrypt
                      </Button>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/10" />

                {/* DoS row */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-white font-semibold">
                        Denial of Service (DoS)
                      </p>
                      <p className="text-[#b99d9d] text-sm">
                        Adds latency and random failure to all actions. Good to
                        demonstrate degraded availability.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!dosActive ? (
                        <Button
                          variant="secondary"
                          onClick={() => setDosActive(true)}
                        >
                          Start DoS
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={() => setDosActive(false)}
                        >
                          Stop DoS
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-[#b99d9d]">
                        Latency (ms)
                      </span>
                      <Input
                        type="number"
                        min={0}
                        value={dosLatencyMs}
                        onChange={(e) =>
                          setDosLatencyMs(Number(e.target.value || 0))
                        }
                        className="bg-[#271c1c] border-[#543b3b] text-white"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-[#b99d9d]">
                        Failure rate (%)
                      </span>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={dosFailurePct}
                        onChange={(e) =>
                          setDosFailurePct(
                            Math.max(
                              0,
                              Math.min(100, Number(e.target.value || 0))
                            )
                          )
                        }
                        className="bg-[#271c1c] border-[#543b3b] text-white"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Availability / Integrity status banners */}
            <section className="px-4 mt-4 space-y-2">
              {ransomwareActive && (
                <Alert
                  variant="destructive"
                  className="border-red-500/30 bg-red-500/10"
                >
                  <AlertTitle className="text-red-300">
                    Data Encrypted
                  </AlertTitle>
                  <AlertDescription className="text-red-200">
                    Ransomware active — sensitive fields are encrypted. Write
                    operations are blocked.
                  </AlertDescription>
                </Alert>
              )}
              {dosActive && (
                <Alert className="border-yellow-500/30 bg-yellow-500/10">
                  <AlertTitle className="text-yellow-300">
                    Service Degraded (DoS)
                  </AlertTitle>
                  <AlertDescription className="text-yellow-200">
                    Requests face ~{dosLatencyMs}ms latency and {dosFailurePct}%
                    failure.
                  </AlertDescription>
                </Alert>
              )}
            </section>

            {/* Original blue RBAC banner */}
            <section className="px-4">
              <div className="flex items-center gap-4 rounded-lg bg-blue-500/10 p-4 border border-blue-500/20 mt-4">
                <span className="material-symbols-outlined text-blue-400">
                  verified_user
                </span>
                <p className="text-blue-300">
                  {rbacEnabled
                    ? "RBAC Active — Insider threats mitigated through least-privilege enforcement."
                    : "RBAC Disabled — Actions are not enforced (simulation)."}
                </p>
              </div>
            </section>

            {/* Table */}
            <section className="flex flex-col gap-4 px-4">
              <h2 className="text-white text-[22px] font-bold pt-5 flex items-center gap-2">
                Sensitive Data Records
                {ransomwareActive && (
                  <Badge className="bg-red-500/20 text-red-300 hover:bg-red-500/20">
                    Read-Only
                  </Badge>
                )}
              </h2>

              <div className="overflow-x-auto rounded-lg border border-[#392828] bg-[#1E1E1E]">
                <table className="w-full min-w-[800px] text-left text-sm text-[#F0F0F0]">
                  <thead className="border-b border-[#392828]">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Salary</th>
                      <th className="p-4">Notes</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-[#392828] hover:bg-white/5 transition-colors"
                      >
                        <td className="p-4">{r.id}</td>
                        <td className="p-4">{r.name}</td>
                        <td className="p-4">{r.email}</td>
                        <td className="p-4">{r.salary}</td>
                        <td className="p-4">{r.notes}</td>
                        <td className="p-4">
                          <div className="flex justify-center items-center gap-2">
                            <button
                              className="p-2 rounded-lg hover:bg-white/10"
                              title="View Details"
                              onClick={() => tryAction("view", r.id)}
                            >
                              👁️
                            </button>
                            <button
                              className="p-2 rounded-lg hover:bg-white/10"
                              title="Edit Record"
                              onClick={() => tryAction("edit", r.id)}
                            >
                              ✏️
                            </button>
                            <button
                              className={`p-2 rounded-lg ${
                                !canDelete(role) ? "text-gray-600" : ""
                              }`}
                              title={
                                canDelete(role)
                                  ? "Delete"
                                  : "Delete Record (Permission Denied)"
                              }
                              onClick={() => tryAction("delete", r.id)}
                            >
                              {canDelete(role) ? "🗑️" : "🔒"}
                            </button>
                            <button
                              className={`p-2 rounded-lg ${
                                !canExport(role) ? "text-gray-600" : ""
                              }`}
                              title={
                                canExport(role)
                                  ? "Export"
                                  : "Export Data (Permission Denied)"
                              }
                              onClick={() => tryAction("export", r.id)}
                            >
                              {canExport(role) ? "⬇️" : "🔒"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Activity Log */}
            <section className="flex flex-col gap-4 px-4 mb-12">
              <h2 className="text-white text-[22px] font-bold pt-5">
                Real-Time Activity Log
              </h2>
              <div className="flex flex-col gap-2 rounded-lg border border-[#392828] bg-[#1E1E1E] p-4 max-h-96 overflow-y-auto">
                {logs.map((l, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                      <p className="text-xs text-gray-400">{l.ts}</p>
                      <p className="text-sm">{l.message}</p>
                    </div>
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                        l.status === "Allowed"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <Dialog
              open={violation.open}
              onOpenChange={(o) => setViolation((v) => ({ ...v, open: o }))}
            >
              <DialogContent className="sm:max-w-md border-white/10 bg-[#1E1E1E] text-[#F0F0F0]">
                <DialogHeader>
                  <DialogTitle>Permission Denied</DialogTitle>
                  <DialogDescription className="text-[#b99d9d]">
                    {violation.reason}
                  </DialogDescription>
                </DialogHeader>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-[#b99d9d]">Action:</span>{" "}
                    {violation.action}
                  </div>
                  <div>
                    <span className="text-[#b99d9d]">Record:</span> #
                    {violation.id}
                  </div>
                  <div>
                    <span className="text-[#b99d9d]">Role:</span> {role}
                  </div>
                  <div>
                    <span className="text-[#b99d9d]">RBAC:</span>{" "}
                    {rbacEnabled ? "Enabled" : "Disabled"}
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button variant="ghost">Close</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button>Request Access</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={edit.open}
              onOpenChange={(o) => setEdit((e) => ({ ...e, open: o }))}
            >
              <DialogContent className="sm:max-w-lg border-white/10 bg-[#1E1E1E] text-[#F0F0F0]">
                <DialogHeader>
                  <DialogTitle>Edit Record #{edit.data?.id}</DialogTitle>
                  <DialogDescription className="text-[#b99d9d]">
                    Modify fields and save. Salary is admin-only when RBAC is
                    enabled.
                  </DialogDescription>
                </DialogHeader>
                {edit.data && (
                  <form
                    className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveEdit();
                    }}
                  >
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-[#b99d9d]">Name</span>
                      <input
                        className="w-full rounded-lg border border-[#543b3b] bg-[#271c1c] text-white h-10 px-3 py-2 focus:ring-2 focus:ring-primary/50"
                        value={edit.data.name}
                        onChange={(e) =>
                          setEdit((s) => ({
                            ...s,
                            data: { ...s.data!, name: e.target.value },
                          }))
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-sm text-[#b99d9d]">Email</span>
                      <input
                        className="w-full rounded-lg border border-[#543b3b] bg-[#271c1c] text-white h-10 px-3 py-2 focus:ring-2 focus:ring-primary/50"
                        value={edit.data.email}
                        onChange={(e) =>
                          setEdit((s) => ({
                            ...s,
                            data: { ...s.data!, email: e.target.value },
                          }))
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1 sm:col-span-2">
                      <span className="text-sm text-[#b99d9d]">
                        Salary{" "}
                        {role !== "admin" && rbacEnabled ? (
                          <em className="text-xs text-red-300">
                            {" "}
                            (read-only for {role})
                          </em>
                        ) : null}
                      </span>
                      <input
                        className="w-full rounded-lg border border-[#543b3b] bg-[#271c1c] text-white h-10 px-3 py-2 focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
                        value={edit.data.salary}
                        disabled={rbacEnabled && role !== "admin"}
                        onChange={(e) =>
                          setEdit((s) => ({
                            ...s,
                            data: { ...s.data!, salary: e.target.value },
                          }))
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-1 sm:col-span-2">
                      <span className="text-sm text-[#b99d9d]">Notes</span>
                      <textarea
                        className="w-full rounded-lg border border-[#543b3b] bg-[#271c1c] text-white min-h-24 px-3 py-2 focus:ring-2 focus:ring-primary/50"
                        value={edit.data.notes}
                        onChange={(e) =>
                          setEdit((s) => ({
                            ...s,
                            data: { ...s.data!, notes: e.target.value },
                          }))
                        }
                      />
                    </label>
                    <DialogFooter className="sm:col-span-2 mt-2 gap-2">
                      <DialogClose asChild>
                        <Button variant="ghost" type="button">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit">Save</Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            <Dialog
              open={confirmDel.open}
              onOpenChange={(o) => setConfirmDel((c) => ({ ...c, open: o }))}
            >
              <DialogContent className="sm:max-w-md border-white/10 bg-[#1E1E1E] text-[#F0F0F0]">
                <DialogHeader>
                  <DialogTitle>Delete Record #{confirmDel.id}</DialogTitle>
                  <DialogDescription className="text-[#b99d9d]">
                    This action is irreversible. Are you sure?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant="destructive" onClick={doDelete}>
                      Delete
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
