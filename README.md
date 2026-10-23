# SecureGate — Zero-Trust Administrative Gateway Console

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-10%2F10%20Passing-emerald?style=flat&logo=vitest)](https://vitest.dev/)
[![Zero-Trust](https://img.shields.io/badge/Architecture-Zero--Trust%20Fail--Closed-indigo?style=flat)]()

**SecureGate** is an enterprise-grade administrative dashboard prototype designed to manage, secure, and monitor access to sensitive internal admin consoles using a strict **Zero-Trust architecture**.

Built for the **IBM CyberSecurity BootCamp 2026 Internship Project**, SecureGate models production patterns inspired by **Cloudflare Tunnel (`cloudflared`)** and **Cloudflare Access with Multi-Factor Authentication (MFA)**.

---

## 🛡️ Core Security Invariants

- **Default-Deny Access Control:** Every access evaluation starts strictly in a blocked/denied state. Access is granted solely when explicit role, group, or user allow-rules match.
- **Fail-Closed Architecture:** If a Cloudflare Tunnel connector daemon terminates or loses connectivity, dependent edge routes immediately **fail closed** (HTTP 503). The system never falls back to direct public origin IPs.
- **Topology Concealment:** Private RFC1918 addresses and `*.internal` DNS hostnames are shielded from unauthenticated public error screens.
- **Zero Secrets in Frontend:** API keys, tunnel tokens, and TOTP secret seeds are never bundled, logged, or exposed in client payloads.
- **MFA Assurance Enforcement:** Enforces step-up authentication with FIDO2 / WebAuthn hardware keys or TOTP authenticator apps.

---

## 🚀 Key Modules & Capabilities

```
SecureGate Architecture
├── 1. Security Overview Dashboard (KPIs, Telemetry, Live Audit Stream)
├── 2. Protected Applications (Catalog, Filter, Detail Drawer, Create/Edit Form)
├── 3. Access Policies (Default-Deny Rule Matrix, MFA Assurance, Groups)
├── 4. Cloudflare Tunnels (Connector Health, Ingress Rules, Fail-Closed Simulator)
├── 5. Activity & Audit Logs (High-Density Event Log, CSV/JSON Export)
├── 6. Identity Directory (Simulated Okta/Entra ID SCIM Sync, Users, Groups)
├── 7. Settings & Integrations (Connector Checklist, Reset Demo State)
└── 8. Zero-Trust Access Evaluator Sandbox (Interactive Decision Pipeline)
```

1. **Security Overview Dashboard:** Real-time posture tracking, active tunnel health monitoring, MFA enforcement percentage, and live audit telemetry stream.
2. **Protected Applications Catalog:** Administrative inventory showing internal origins, edge hostnames, tunnel bindings, and environment classification (`Production`, `Staging`, `Development`).
3. **Access Policy Engine:** Granular policy builder enforcing default-deny, allowed user groups, email domain restrictions, session timeouts, and required MFA assurance tiers.
4. **Cloudflare Tunnel Management:** Connector daemon health cards with an interactive **Simulate Disconnect** toggle to demonstrate fail-closed behavior in real time.
5. **Interactive Access Evaluator Sandbox:** Test access attempts for any user against any internal application, visualizing the 5-stage policy pipeline decision step-by-step.
6. **Activity & Audit Logging:** High-density, filterable security audit trail with one-click **CSV and JSON export** capabilities.
7. **Identity Directory:** User and security group inventory modeling enterprise SCIM synchronization (Okta / Microsoft Entra ID).
8. **Settings & Integrations:** Production migration checklist detailing cloudflared daemon configuration, Cloudflare Access OIDC setup, and database provisioning steps.

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router, Server-side Route Handlers)
- **Language:** [TypeScript](https://www.typescriptlang.org) (Strict mode)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) with an Enterprise Light Theme
- **Icons:** [Lucide React](https://lucide.dev)
- **Validation:** [Zod](https://zod.dev)
- **Unit Testing:** [Vitest](https://vitest.dev) (10/10 test suites covering policy evaluation, validation, and fail-closed invariants)
- **Linting:** [ESLint](https://eslint.org) (0 errors, 0 warnings)

---

## 🧪 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/NitinYadav25/SecureGate-Zero-Trust-Console.git

# Navigate into the project directory
cd SecureGate-Zero-Trust-Console

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the development server
npm run dev

# Open in your browser
http://localhost:3000
```

### Running Tests & Linting

```bash
# Run unit test suite (10/10 tests)
npm run test

# Run ESLint check
npm run lint

# Build for production
npm run build
```

---

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── applications/route.ts    # Application catalog endpoints
│   │   │   ├── audit-logs/route.ts      # Audit event endpoints
│   │   │   ├── evaluate-access/route.ts # Real-time evaluator endpoint
│   │   │   ├── policies/route.ts        # Access policy endpoints
│   │   │   └── tunnels/route.ts         # Tunnel connector endpoints
│   │   ├── globals.css                  # Tailwind styles and theme tokens
│   │   ├── layout.tsx                   # Root HTML shell
│   │   └── page.tsx                     # Main SecureGate app shell
│   ├── components/
│   │   ├── applications/                # Applications catalog & editor
│   │   ├── audit/                       # Audit logging & export table
│   │   ├── common/                      # Badges, banners, confirmation modals
│   │   ├── layout/                      # TopBar & Sidebar navigation
│   │   ├── overview/                    # KPI metrics & live security telemetry
│   │   ├── policies/                    # Policy manager & rule builder
│   │   ├── settings/                    # Integration checklist & demo reset
│   │   ├── simulator/                   # Interactive access evaluator modal
│   │   ├── tunnels/                     # Tunnel health & fail-closed simulator
│   │   └── users/                       # Users and groups directory
│   ├── lib/
│   │   ├── data-store.ts                # In-memory data store with fallback seed
│   │   ├── demo-data.ts                 # Seed applications, tunnels, policies, users
│   │   ├── evaluator.ts                 # Pure Zero-Trust decision engine
│   │   ├── utils.ts                     # Deterministic UTC formatters & cn utility
│   │   └── validations.ts               # Zod validation schemas
│   ├── test/
│   │   ├── evaluator.test.ts            # Evaluator unit test suite
│   │   └── validations.test.ts          # Zod schema validation test suite
│   └── types/
│       └── index.ts                     # TypeScript definitions
├── vitest.config.ts                     # Vitest configuration
└── package.json
```

---

## 📄 License & Disclaimer

This project is an MVP prototype built for educational and demonstration purposes during the **IBM CyberSecurity BootCamp 2026 Internship**. Mocked endpoints and simulated connectors illustrate Zero-Trust architectural principles; production deployments require genuine Cloudflare Zero Trust accounts, `cloudflared` connectors, and enterprise IdP credentials.
