# VulnDB — Interactive DBMS Security Attack & Defense Demo

A comprehensive educational platform demonstrating real-world database security vulnerabilities and their mitigations through interactive simulations.

## 🎯 Project Overview

VulnDB is a Next.js + shadcn/ui web application that illustrates three critical DBMS attack vectors and their defensive countermeasures:

- **SQL Injection (SQLi)** — Exploitation of dynamically constructed queries
- **Insider Threats** — Data exfiltration and privilege abuse
- **Ransomware & DoS** — Availability and data encryption attacks

### Key Features

- ✅ **Interactive Before/After Demos** — Toggle between vulnerable and protected modes
- ✅ **Real-time Query Execution** — See SQL injection attacks blocked in action
- ✅ **Audit Trail Logging** — Track security events and anomalies
- ✅ **RBAC/IAM Simulation** — Demonstrate least-privilege access controls
- ✅ **Encryption & Backup Protection** — Show defensive measures against ransomware

---

## 📋 Architecture

```
attacks/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with sidebar + main
│   │   ├── page.tsx            # Home page (SQL Injection demo)
│   │   └── globals.css         # Tailwind + custom theme
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── custom-components/
│   │   │   ├── query-panel.tsx
│   │   │   ├── output-panel.tsx
│   │   │   ├── insider-panel.tsx
│   │   │   └── ransomware-panel.tsx
│   │   └── layout/
│   │       ├── sidebar.tsx
│   │       └── header.tsx
│   ├── lib/
│   │   └── tooltips.json       # i18n messages & audit logs
│   └── hooks/
│       └── useDemoState.ts     # State management
├── package.json
├── tailwind.config.ts
└── next.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📸 Illustration: Vulnerable vs Protected Modes

### Section 1: SQL Injection Demo

**Before (Vulnerable):**

```
┌─────────────────────────────────────────┐
│  Query Construction & Execution         │
├─────────────────────────────────────────┤
│ ⚠️  Insecure: String Concatenation      │
│                                         │
│ SELECT * FROM users WHERE email =       │
│ ' OR '1'='1                             │
│                                         │
│ User Input: [' OR '1'='1]               │
│                                         │
│ [Execute Attack] [Execute Query]        │
└─────────────────────────────────────────┘

Result: 3 rows exfiltrated ❌
```

**After (Protected):**

```
┌─────────────────────────────────────────┐
│  Query Construction & Execution         │
├─────────────────────────────────────────┤
│ ✅ Secure: Prepared Statements          │
│                                         │
│ SELECT * FROM users WHERE email = ?     │
│                                         │
│ Sanitization: ' OR '1'='1 → BLOCKED     │
│                                         │
│ [Execute Attack] [Execute Query]        │
└─────────────────────────────────────────┘

Result: Query Blocked by WAF ✅
```

---

### Section 2: Access Control & Insider Threats

**Before (Vulnerable):**

```
┌─────────────────────────────────────────┐
│  User Management (No RBAC)              │
├─────────────────────────────────────────┤
│ User: alice | Role: analyst             │
│ User: bob   | Role: developer           │
│ User: admin | Role: admin               │
│                                         │
│ [Become Admin] ← No validation!         │
│                                         │
│ Action Log:                             │
│ ❌ No audit trail                       │
│ ❌ No MFA required                      │
│ ❌ Role change unlogged                 │
└─────────────────────────────────────────┘
```

**After (Protected):**

```
┌─────────────────────────────────────────┐
│  User Management (RBAC + IAM)           │
├─────────────────────────────────────────┤
│ User: alice | Role: analyst (read-only) │
│ User: bob   | Role: developer           │
│ User: admin | Role: admin               │
│                                         │
│ [Modify Role] (disabled - insufficient) │
│                                         │
│ Audit Trail:                            │
│ ✅ [2025-11-08 14:23:15] Role change    │
│    denied: analyst→admin (RBAC)         │
│ ✅ MFA verification required            │
│ ✅ Immutable audit log (signed)         │
└─────────────────────────────────────────┘
```

---

### Section 3: Ransomware & DoS Protection

**Before (Vulnerable):**

```
┌─────────────────────────────────────────┐
│  Backup & Availability                  │
├─────────────────────────────────────────┤
│ Backups:                                │
│ ❌ backup_2025-11-08.sql (unencrypted)  │
│ ❌ backup_2025-11-07.sql (unencrypted)  │
│                                         │
│ Availability: 🔴 DEGRADED               │
│ DoS Attack Active (0 rate limiting)     │
│                                         │
│ [Simulate Encryption] → Malware blocks  │
│                                         │
│ Ransomed: All backups encrypted! 🔒     │
└─────────────────────────────────────────┘
```

**After (Protected):**

```
┌─────────────────────────────────────────┐
│  Backup & Availability (Hardened)       │
├─────────────────────────────────────────┤
│ Backups (AES-256 encrypted):            │
│ ✅ backup_2025-11-08.sql (🔒 encrypted) │
│ ✅ backup_2025-11-07.sql (🔒 encrypted) │
│ ✅ Key rotation: every 30 days          │
│                                         │
│ Availability: 🟢 HEALTHY                │
│ Rate Limiting: 1000 req/min enforced    │
│                                         │
│ [Restore Backup] (MFA required)         │
│                                         │
│ Last Restore: verified, signed, logged  │
└─────────────────────────────────────────┘
```

---

## 🎓 How to Use

### SQL Injection Demo

1. Navigate to the **SQL Injection Demo** tab (default view)
2. Click **"Execute Attack (Vulnerable)"** to see data exfiltration
3. Toggle **Protected Mode** to enable parameterized queries
4. Click **"Execute Query (Hardened)"** to see the attack blocked
5. Review the **System Log** to see audit entries

### Insider Threats & RBAC

1. Navigate to **Insider Threats** in the sidebar
2. Click **"Vulnerable"** to see:
   - Unprotected role elevation
   - Missing audit trails
3. Click **"Protected"** to see:
   - RBAC enforcement
   - MFA verification
   - Immutable audit logs

### Ransomware & DoS

1. Navigate to **Ransomware & DoS** in the sidebar
2. Click **"Vulnerable"** to see:
   - Unencrypted backups
   - No rate limiting
3. Click **"Protected"** to see:
   - AES-256 encrypted backups
   - DoS mitigation active
   - Key rotation info

---

## 📊 Key Concepts Demonstrated

| Attack Vector   | Vulnerability        | Defense                  | Technology                 |
| --------------- | -------------------- | ------------------------ | -------------------------- |
| SQL Injection   | String concatenation | Prepared statements      | Parameterized queries      |
| Insider Threats | No RBAC / MFA        | Least privilege + IAM    | RBAC, MFA, audit logs      |
| Ransomware      | Unencrypted backups  | Encryption + MFA restore | AES-256, multi-factor auth |
| DoS             | No rate limiting     | Traffic throttling       | Firewall rules, WAF        |

---

## 🔧 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** shadcn/ui + Tailwind CSS
- **Language:** TypeScript
- **State Management:** React hooks
- **Styling:** Tailwind CSS (custom theme)

---

## 📝 Environment Setup

Create a `.env.local` file (if backend integration is needed):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEMO_MODE=true
```

---

## 🚨 Disclaimer

This is an **educational tool** for learning DBMS security concepts. It should **NOT** be used for:

- Unauthorized access to real systems
- Malicious activity
- Production deployments

Use responsibly in controlled lab environments only.

---

## 📚 References

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Zero Trust Architecture](https://www.nist.gov/publications/zero-trust-architecture)
- Khan 2025 — Access Controls: RBAC, IAM, Least Privilege
- Farooq 2025 — Logging & Monitoring: Anomaly Detection

---

## 👨‍💻 Contributing

Contributions welcome! Please submit issues and PRs to improve the demo.

---

## 📄 License

MIT License — See LICENSE file for details.

---

**VulnDB** — Learn security by breaking it safely. 🔐
