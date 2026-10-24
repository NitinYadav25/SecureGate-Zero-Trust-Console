# SecureGate — Zero-Trust Administrative Gateway Console

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Jupyter](https://img.shields.io/badge/Jupyter-Notebook-F37626?style=flat&logo=jupyter&logoColor=white)](https://jupyter.org/)
[![Vitest](https://img.shields.io/badge/Vitest-10%2F10%20Passing-emerald?style=flat&logo=vitest)](https://vitest.dev/)
[![Security Tests](https://img.shields.io/badge/Python%20Invariants-10%2F10%20Verified-emerald?style=flat&logo=pytest)]()
[![Zero-Trust](https://img.shields.io/badge/Architecture-NIST%20SP%20800--207%20Zero--Trust-indigo?style=flat)]()
[![BootCamp](https://img.shields.io/badge/IBM%20CyberSecurity-BootCamp%202026-052FAD?style=flat&logo=ibm)]()

> **Project Submission:** IBM CyberSecurity BootCamp 2026 Internship Project  
> **Student / Author:** Nitin Yadav  
> **GitHub Repository:** [https://github.com/NitinYadav25/SecureGate-Zero-Trust-Console](https://github.com/NitinYadav25/SecureGate-Zero-Trust-Console)  
> **Core Architecture:** Zero-Trust Network Access (ZTNA) with Cloudflare Tunnel (`cloudflared`) & Cloudflare Access MFA

---

## 📌 Project Overview & Executive Summary

Traditional network security models rely on castle-and-moat perimeter defenses—such as legacy corporate VPNs, bastion jump hosts, and public IP allowlists. Once an attacker breaches the perimeter via stolen credentials or unpatched vulnerabilities, they gain unchecked lateral movement across internal subnets.

**SecureGate** is an enterprise-grade administrative gateway console and policy enforcement engine engineered around strict **Zero-Trust principles (NIST SP 800-207)**:
- **Never Trust, Always Verify:** Every incoming request is authenticated, authorized, and cryptographically verified at the edge before reaching any internal workload.
- **Least-Privilege & Default-Deny:** Access is denied by default; permission is granted only when explicit role, group, and multi-factor requirements match.
- **Fail-Closed Resilience:** Outbound-only Cloudflare Tunnel connectors (`cloudflared`) ensure internal services have zero exposed public IPv4/IPv6 addresses. If a tunnel daemon drops, edge routes immediately **fail closed (HTTP 503)** rather than falling back to origin IPs.
- **Tiered Multi-Factor Assurance (NIST AAL2/AAL3):** Enforces cryptographic distinction between high-assurance hardware keys (FIDO2 / WebAuthn) for critical infrastructure and standard software TOTP authenticators for routine dashboards.

The project provides both a **production-ready Next.js 16 Web Management Console** and an **autonomous Python 3.11 Security Telemetry & Invariant Verification Suite** (with an interactive **Jupyter Notebook**).

---

## 📊 Dataset Information & Access Links

SecureGate incorporates a comprehensive enterprise security telemetry and configuration dataset representing production cloud infrastructure undergoing Zero-Trust migration. All dataset files are hosted directly within this repository for transparent reproducibility and SIEM analysis:

| Dataset Asset | Format | Direct Repository Link | Description |
| :--- | :--- | :--- | :--- |
| **Audit Trail SIEM Telemetry (CSV)** | CSV | [`audit_trail_export.csv`](./audit_trail_export.csv) | High-density audit event records including actor provenance, IP, timestamp, target app, outcome, and policy reason. |
| **Audit Trail SIEM Telemetry (JSON)** | JSON | [`audit_trail_export.json`](./audit_trail_export.json) | Structured JSON audit feed designed for Splunk, Datadog, or IBM QRadar ingestion. |
| **Enterprise Seed Initializer (Python)** | Python (.py) | [`Nitin_Yadav_SecureGate_Zero_Trust_Console.py`](./Nitin_Yadav_SecureGate_Zero_Trust_Console.py) | Full programmatic data models, seed generators, and automated test runners. |
| **Interactive Jupyter Dataset & Notebook** | Jupyter (.ipynb) | [`Nitin_Yadav_SecureGate_Zero_Trust_Console.ipynb`](./Nitin_Yadav_SecureGate_Zero_Trust_Console.ipynb) | End-to-end interactive notebook containing all seed data, visual telemetry, and decision simulations. |
| **TypeScript Application Data Store** | TypeScript (.ts) | [`src/lib/demo-data.ts`](./src/lib/demo-data.ts) | Normalized TypeScript data store powering the Next.js interactive console. |

### Dataset Entities & Schema Breakdown

```
Enterprise Dataset Entities
├── 1. Applications (5 Records)
│   ├── Internal Origins: RFC1918 hostnames (e.g., http://vault-prod.internal:8200)
│   ├── Public Edge Hostnames (e.g., https://vault.corp.securegate.io)
│   └── Attributes: Environment, Protection Status, Assigned Policy, MFA Level
├── 2. Cloudflare Tunnels (4 Records)
│   ├── Connectors: US-East (IAD), EU-West (FRA), APAC (NRT), US-West Staging (SJC)
│   └── Telemetry: Status (Connected/Disconnected/Pending), Active Connections, Latency (ms)
├── 3. Access Policies (3 Rulesets)
│   ├── pol-secops-crit: Critical Vault & KMS Admins (Requires FIDO2 WebAuthn)
│   ├── pol-platform-eng: Kubernetes Admin Plane (Requires TOTP/WebAuthn)
│   └── pol-sre-observability: Read-only Telemetry & Metrics
├── 4. Identity Directory (5 Users & 4 SCIM Groups)
│   ├── Elena Rostova (Principal Architect, FIDO2 Hardware Key enrolled)
│   ├── Arun Patel (Platform Engineer, Authenticator App TOTP enrolled)
│   ├── Marcus Vance (Security Engineer, FIDO2 enrolled)
│   ├── David Miller (Site Reliability Engineer, Suspended Account)
│   └── External Vendor Auditor (Third-party Contractor, No MFA enrolled)
└── 5. Audit Log Events (High-Density Event Stream)
    └── Fields: id, timestamp, actor (name, email, role, IP), event_type, target_app, outcome, reason, policy_evaluated, mfa_verified
```

---

## 🛡️ Core Security Invariants

SecureGate is built upon five foundational security invariants that cannot be bypassed:

1. **Default-Deny Access Control (`default_decision = 'deny'`):**  
   Every access request begins in a blocked state. Access is granted solely when an explicit allow-rule evaluates to `true`. Permissive default policies (`default_decision = 'allow'`) are rejected by schema validators.
2. **Fail-Closed Tunnel Architecture:**  
   If an edge connector daemon (`cloudflared`) terminates or enters an unhealthy state, dependent routes immediately return `HTTP 503 Service Unavailable`. Under no circumstances does the system fall back to direct origin IP addressing.
3. **Internal Topology Concealment:**  
   Private RFC1918 IP addresses (`10.x.x.x`, `172.16.x.x`, `192.168.x.x`) and `*.internal` DNS hostnames are completely shielded from public clients, HTTP error pages, and client payloads.
4. **Zero Secrets in Frontend:**  
   API tokens, tunnel credentials, private keys, and TOTP secret seeds are never bundled into client-side JavaScript bundles or public API responses.
5. **Tiered MFA Assurance Enforcement (NIST AAL3 vs AAL2):**  
   Critical production infrastructure enforces hardware-bound FIDO2 / WebAuthn keys. Users with only software TOTP authenticators are strictly blocked from high-assurance routes.

---

## 🏗️ System Architecture & 5-Stage Zero-Trust Decision Pipeline

```
  +-----------------------------------------------------------------------------------+
  |                         SECUREGATE ZERO-TRUST PIPELINE                            |
  +-----------------------------------------------------------------------------------+
                                            |
                                    [ INCOMING REQUEST ]
                          (Identity + Target Application + Session)
                                            |
                                            v
    +-------------------------------------------------------------------------------+
    | STAGE 1: Application Status Check                                             |
    | - Is target application administratively disabled?                            |
    |   * YES -> DENY (403 Forbidden / Route Disabled)                              |
    |   * NO  -> Pass to Stage 2                                                    |
    +-------------------------------------------------------------------------------+
                                            |
                                            v
    +-------------------------------------------------------------------------------+
    | STAGE 2: Cloudflare Tunnel Fail-Closed Guard                                  |
    | - Is connector daemon active and reporting healthy heartbeat?                 |
    |   * NO  -> DENY (503 Service Unavailable — Fail-Closed Safeguard Engaged)     |
    |   * YES -> Pass to Stage 3 (Strictly ZERO direct origin fallback)             |
    +-------------------------------------------------------------------------------+
                                            |
                                            v
    +-------------------------------------------------------------------------------+
    | STAGE 3: Identity & Default-Deny Authorization Check                          |
    | - Is user account suspended or revoked in IdP directory?                      |
    |   * YES -> DENY (Account Suspended)                                           |
    | - Does user role, directory group, or email match policy allow-rules?         |
    |   * NO  -> DENY (Zero-Trust Default-Deny Triggered)                           |
    |   * YES -> Pass to Stage 4                                                    |
    +-------------------------------------------------------------------------------+
                                            |
                                            v
    +-------------------------------------------------------------------------------+
    | STAGE 4: Multi-Factor Authentication (MFA) Verification                       |
    | - Is user enrolled in MFA and active challenge verified in session?           |
    |   * NO  -> DENY (MFA Step-Up Challenge Required)                              |
    | - Does user's MFA tier satisfy policy requirement (e.g. FIDO2 vs TOTP)?       |
    |   * NO  -> DENY (Insufficient MFA Assurance Level)                            |
    |   * YES -> Pass to Stage 5                                                    |
    +-------------------------------------------------------------------------------+
                                            |
                                            v
    +-------------------------------------------------------------------------------+
    | STAGE 5: Cryptographic Edge Access Token Issuance                             |
    | - Generate ephemeral, signed Zero-Trust edge session token                    |
    | - Proxy request through encrypted Cloudflare Tunnel to private origin         |
    |   * OUTCOME -> ALLOW (200 OK — Ephemeral Access Granted)                      |
    +-------------------------------------------------------------------------------+
```

---

## 🚀 Key Modules & Capabilities

```
SecureGate Platform Architecture
├── 1. Security Overview Dashboard (KPIs, Telemetry, Active Invariants, Live Audit Stream)
├── 2. Protected Applications Catalog (Internal Origins, Edge Hostnames, Tunnel Bindings)
├── 3. Access Policy Builder (Default-Deny Rule Matrix, MFA Assurance Tiers, Groups)
├── 4. Cloudflare Tunnel Management (Connector Health, Ingress Rules, Fail-Closed Simulator)
├── 5. Interactive Access Evaluator Sandbox (5-Stage Step-by-Step Pipeline Inspector)
├── 6. Activity & Audit Logs (High-Density Event Log, SIEM CSV & JSON Export)
├── 7. Identity & SCIM Directory (Users, Security Groups, MFA Status, Account Lifecycle)
├── 8. Settings & Production Migration (cloudflared Config Generator, IdP Checklist)
└── 9. Python Backend & Jupyter Engine (Data Models, Invariant Verification Suite)
```

1. **Security Overview Dashboard:** Real-time posture tracking, active tunnel health monitoring, MFA enforcement percentage, and live audit telemetry stream.
2. **Protected Applications Catalog:** Administrative inventory showing internal origins, edge hostnames, tunnel bindings, and environment classification (`Production`, `Staging`, `Development`).
3. **Access Policy Engine:** Granular policy builder enforcing default-deny, allowed user groups, email domain restrictions, session timeouts, and required MFA assurance tiers.
4. **Cloudflare Tunnel Management:** Connector daemon health cards with an interactive **Simulate Disconnect** toggle to demonstrate fail-closed behavior in real time.
5. **Interactive Access Evaluator Sandbox:** Test access attempts for any user against any internal application, visualizing the 5-stage policy pipeline decision step-by-step.
6. **Activity & Audit Logging:** High-density, filterable security audit trail with one-click **CSV and JSON export** capabilities.
7. **Identity Directory:** User and security group inventory modeling enterprise SCIM synchronization (Okta / Microsoft Entra ID).
8. **Settings & Integrations:** Production migration checklist detailing `cloudflared` daemon configuration, Cloudflare Access OIDC setup, and database provisioning steps.
9. **Python Invariant Verification Suite:** Standalone command-line and Jupyter notebook engine verifying 10/10 security invariants with zero external web dependencies.

---

## 🛠️ Technology Stack

### Frontend & Full-Stack Console
- **Framework:** [Next.js 16](https://nextjs.org) (App Router, Server-side Route Handlers)
- **Language:** [TypeScript 5.0](https://www.typescriptlang.org) (Strict type checking)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) with high-density Enterprise Light Theme
- **Icons:** [Lucide React](https://lucide.dev)
- **Validation:** [Zod](https://zod.dev) (Strict schema enforcement)
- **Unit Testing:** [Vitest](https://vitest.dev) (10/10 passing test suites)
- **Code Quality:** [ESLint](https://eslint.org) (0 errors, 0 warnings)

### Python Backend, Analytics & Verification Engine
- **Runtime:** [Python 3.11+](https://www.python.org/)
- **Data Modeling:** [Pydantic v2](https://docs.pydantic.dev/) & Dataclasses
- **Data Processing:** [Pandas](https://pandas.pydata.org/) & [NumPy](https://numpy.org/)
- **Visual Telemetry:** [Matplotlib](https://matplotlib.org/) & [Seaborn](https://seaborn.pydata.org/)
- **Interactive Notebook:** [Jupyter Notebook](https://jupyter.org/) (`Nitin_Yadav_SecureGate_Zero_Trust_Console.ipynb`)
- **Automated Invariant Suite:** 10/10 automated security tests validating NIST SP 800-207 invariants

---

## 🧪 Setup & Run Instructions

### Prerequisites
- **Node.js:** v18.0.0 or v20.0.0+ (`node -v`)
- **Python:** v3.10 or v3.11+ (`python --version`)
- **Package Managers:** `npm` (or `pnpm` / `yarn`) and `pip`

---

### 1. Web Management Console (Next.js & TypeScript)

```bash
# 1. Clone the repository
git clone https://github.com/NitinYadav25/SecureGate-Zero-Trust-Console.git

# 2. Navigate into the project root
cd SecureGate-Zero-Trust-Console

# 3. Install Node.js dependencies
npm install

# 4. Launch the Next.js development server
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

To run the TypeScript unit test suite:
```bash
npm run test
```

To run the linter and production build:
```bash
npm run lint
npm run build
```

---

### 2. Python Backend & Security Invariant Engine

The repository includes a standalone Python implementation of the Zero-Trust policy engine and telemetry generator:

```bash
# 1. Install required Python packages
pip install -r requirements.txt

# 2. Run the SecureGate Console & Invariant Verification Suite
python Nitin_Yadav_SecureGate_Zero_Trust_Console.py
```

**Expected Output:**
```
================================================================================
   SECUREGATE — ZERO-TRUST ADMINISTRATIVE GATEWAY CONSOLE
   IBM CyberSecurity BootCamp 2026 Internship Submission
   Author: Nitin Yadav | GitHub: NitinYadav25/SecureGate-Zero-Trust-Console
================================================================================
...
VERIFICATION SUMMARY: 10/10 Security Invariant Tests Passed (100% SUCCESS)
...
Audit Trail SIEM Exports Generated Successfully:
  - CSV Export:  audit_trail_export.csv
  - JSON Export: audit_trail_export.json
```

---

### 3. Interactive Jupyter Notebook

For an interactive, cell-by-cell walkthrough with visual telemetry and access simulation:

```bash
jupyter notebook Nitin_Yadav_SecureGate_Zero_Trust_Console.ipynb
```

---

## 🧪 Automated Security Invariant Test Suite (10/10 Passing)

SecureGate includes an automated verification suite covering all core security invariants:

| # | Security Invariant Tested | Test Scenario | Expected Result | Status |
| :-: | :--- | :--- | :--- | :-: |
| **1** | **Legitimate DevSecOps Access** | User with FIDO2 Hardware Key accesses HashiCorp Vault via active tunnel | `ALLOWED (200 OK)` | ✅ PASS |
| **2** | **Tunnel Fail-Closed Guard** | Tunnel connector severed; request arrives for Tokyo DB | `DENIED (503 Fail-Closed)` | ✅ PASS |
| **3** | **Zero-Trust Default-Deny** | External contractor account requests access to Kubernetes Admin Plane | `DENIED (Default-Deny)` | ✅ PASS |
| **4** | **IdP SCIM Account Suspension** | Suspended engineer account attempts access to production resources | `DENIED (Account Suspended)` | ✅ PASS |
| **5** | **Step-Up MFA Challenge** | User has valid role but has not completed active MFA challenge | `DENIED (MFA Incomplete)` | ✅ PASS |
| **6** | **Tiered MFA Assurance (NIST AAL3)** | Software TOTP authenticator provided for Vault requiring FIDO2 WebAuthn | `DENIED (Insufficient Tier)` | ✅ PASS |
| **7** | **Disabled Route Blocking** | Legitimate architect accesses decommissioned jump host | `DENIED (Route Disabled)` | ✅ PASS |
| **8** | **Credential Stripping & Sanitization** | Admin registers internal URL containing embedded basic credentials | `REJECTED (Validation Error)` | ✅ PASS |
| **9** | **Schema Default-Deny Enforcement** | Policy creator attempts to submit `default_decision = 'allow'` | `REJECTED (Schema Violation)` | ✅ PASS |
| **10** | **Dynamic State Mutation Guard** | Active tunnel is programmatically disconnected during live session | `IMMEDIATELY BLOCKED (503)` | ✅ PASS |

---

## 📁 Repository Directory Structure

```
SecureGate-Zero-Trust-Console/
├── Nitin_Yadav_SecureGate_Zero_Trust_Console.ipynb  # Interactive Jupyter Notebook
├── Nitin_Yadav_SecureGate_Zero_Trust_Console.py     # Python Backend & Test Runner
├── requirements.txt                                 # Python dependencies
├── audit_trail_export.csv                           # SIEM Audit Trail Dataset (CSV)
├── audit_trail_export.json                          # SIEM Audit Trail Dataset (JSON)
├── README.md                                        # Project Documentation
├── package.json                                     # Node.js dependencies & scripts
├── tsconfig.json                                    # TypeScript compiler configuration
├── vitest.config.ts                                 # Vitest unit testing configuration
├── eslint.config.mjs                                # ESLint configuration
├── public/                                          # Static assets & icons
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── applications/route.ts                # Application catalog REST API
    │   │   ├── audit-logs/route.ts                  # Audit trail REST API
    │   │   ├── evaluate-access/route.ts             # 5-Stage Access Evaluator API
    │   │   ├── policies/route.ts                    # Access policy REST API
    │   │   └── tunnels/route.ts                     # Tunnel connector REST API
    │   ├── globals.css                              # Tailwind CSS tokens & layout
    │   ├── layout.tsx                               # Root application shell
    │   └── page.tsx                                 # Main console dashboard view
    ├── components/
    │   ├── applications/                            # Application catalog & drawer
    │   ├── audit/                                   # Audit logs table & SIEM export
    │   ├── common/                                  # Badges, modals, and alerts
    │   ├── layout/                                  # Navigation sidebar & header
    │   ├── overview/                                # Telemetry KPIs & audit stream
    │   ├── policies/                                # Policy editor & rule builder
    │   ├── settings/                                # Production migration checklist
    │   ├── simulator/                               # Interactive access sandbox modal
    │   ├── tunnels/                                 # Tunnel cards & fail-closed toggle
    │   └── users/                                   # SCIM identity directory & groups
    ├── lib/
    │   ├── data-store.ts                            # In-memory reactive data store
    │   ├── demo-data.ts                             # Enterprise seed dataset (TypeScript)
    │   ├── evaluator.ts                             # Pure Zero-Trust decision engine
    │   ├── utils.ts                                 # UTC formatters & cn utility
    │   └── validations.ts                           # Zod validation schemas
    ├── test/
    │   ├── evaluator.test.ts                        # Evaluator unit test suite (Vitest)
    │   └── validations.test.ts                      # Zod validation test suite (Vitest)
    └── types/
        └── index.ts                                 # Core TypeScript definitions
```

---

## ⚙️ Production Reference Configuration (`cloudflared`)

For enterprise production deployments migrating away from reverse proxies and VPNs, SecureGate uses the following configuration pattern (`/etc/cloudflared/config.yml`):

```yaml
tunnel: a827e891-4cf1-45d2-97b4-9a8c1f92e45b
credentials-file: /etc/cloudflared/a827e891-4cf1-45d2-97b4-9a8c1f92e45b.json

ingress:
  # Internal HashiCorp Vault Production Route
  - hostname: vault.corp.securegate.io
    service: http://vault-prod.internal:8200
    originRequest:
      connectTimeout: 10s
      noTLSVerify: false

  # Internal Kubernetes Production Control Plane
  - hostname: k8s-prod.corp.securegate.io
    service: http://k8s-master.corp.internal:6443

  # Internal Grafana Metrics Observability
  - hostname: metrics.securegate.io
    service: http://grafana.internal:3000

  # Default Catch-All Fail-Closed Ingress Rule
  # Strictly guarantees that unmatched traffic receives HTTP 503
  - service: http_status:503
```

---

## 📄 License & Academic Disclaimer

This project is created and submitted by **Nitin Yadav** for the **IBM CyberSecurity BootCamp 2026 Internship Project**.

- **License:** MIT License. See repository for full terms.
- **Disclaimer:** Mocked network endpoints and simulated connector heartbeats illustrate Zero-Trust architectural principles; production implementations require genuine Cloudflare Zero Trust organizations, authenticated `cloudflared` connectors, and enterprise IdP directory credentials (Okta / Microsoft Entra ID).
