<p align="center">
  <img src="packages/frontend/assets/android-chrome-512x512.png" alt="ARGUS" width="200" />
</p>

<h1 align="center">ARGUS</h1>
<p align="center"><b>All-Seeing Web Intelligence Platform</b></p>
<p align="center"><i>Nothing escapes ARGUS.</i></p>

<p align="center">
  <img src="https://img.shields.io/badge/checks-42-00d4ff?style=flat-square&logo=shield" alt="42 Checks" />
  <img src="https://img.shields.io/badge/node-%3E%3D18-339933?style=flat-square&logo=node.js" alt="Node 18+" />
  <img src="https://img.shields.io/badge/typescript-5.x-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License" />
  <img src="https://img.shields.io/badge/docker-ready-2496ED?style=flat-square&logo=docker" alt="Docker Ready" />
</p>

<p align="center">
  <a href="https://argus.cybermindspace.live"><img src="https://img.shields.io/badge/🔱_LIVE_DEMO-argus.cybermindspace.live-00d4ff?style=for-the-badge&logoColor=white" alt="Live Demo" /></a>
</p>

---

Enter any URL, domain, or IP address and **ARGUS** runs **42 OSINT & security checks in parallel**, streaming results in real-time via Server-Sent Events to a cyberpunk-themed dashboard.

## ✨ Features

- 🔱 **42 parallel checks** across security, DNS, network, content, performance & reputation
- ⚡ **Real-time streaming** — results appear as each check completes via SSE
- 🛡️ **100-point security scoring** with 11 weighted categories
- 🌐 **Zero API keys required** — works out of the box (optional keys enhance checks)
- 📊 **Export** results as JSON, CSV, or Markdown
- 📜 **Scan history** with localStorage persistence
- 🐳 **Docker-ready** with multi-stage production build
- 🎨 **Dark cyberpunk UI** with glassmorphism and micro-animations

---

## 📋 42-Check Table

| # | ID | Name | Category | Description |
|---|-----|------|----------|-------------|
| 1 | `security-score` | Overall Security Score | Security | Composite 100-point security score across 11 weighted categories |
| 2 | `ssl-chain` | SSL Certificate Chain | Security | Analyzes full SSL/TLS certificate chain, expiry, and issuer trust |
| 3 | `tls-ciphers` | TLS Cipher Suites | Security | Analyzes TLS cipher suite negotiation and identifies weak ciphers |
| 4 | `security-headers` | Security Headers | Security | Audits HTTP security headers (CSP, HSTS, X-Frame-Options, etc.) |
| 5 | `hsts-preload` | HSTS Preload Status | Security | Checks if the domain is on the HSTS preload list |
| 6 | `cookies` | Cookies | Security | Inspects cookies for HttpOnly, Secure, SameSite flags |
| 7 | `waf-detection` | WAF / Firewall Detection | Security | Identifies Web Application Firewalls and CDN protection layers |
| 8 | `safe-browsing` | Google Safe Browsing | Threats | Checks URL against Google Safe Browsing threat lists |
| 9 | `virustotal` | VirusTotal Threat Intel | Threats | Checks URL against 70+ VirusTotal antivirus engines |
| 10 | `hidden-paths` | Hidden Path Exposure | Security | Probes for exposed `.env`, `.git`, `phpinfo.php`, admin panels |
| 11 | `breach-check` | Data Breach Check | Security | Checks if the domain appears in known data breach databases |
| 12 | `cert-transparency` | Certificate Transparency | Security | Queries CT logs for all certificates issued for the domain |
| 13 | `ip-info` | IP Address Info | Network | Resolves IP + geolocation, ISP, ASN, and network information |
| 14 | `server-info` | Server Info | Network | Identifies hosting provider, server software, and ASN |
| 15 | `dns-records` | DNS Records | DNS | Queries A, AAAA, MX, NS, CNAME, TXT, CAA, and SOA records |
| 16 | `dnssec` | DNS Security | DNS | Checks DNSSEC validation and DNS-based security extensions |
| 17 | `dns-propagation` | DNS Propagation | DNS | Tests DNS resolution consistency across 8 global resolvers |
| 18 | `ipv6-support` | IPv6 Support | Infrastructure | Checks for AAAA DNS records and IPv6 connectivity |
| 19 | `http-headers` | HTTP Headers | Network | Inspects all HTTP response headers returned by the server |
| 20 | `http-version` | HTTP/2 & HTTP/3 | Performance | Detects HTTP protocol versions (HTTP/1.1, h2, h3) |
| 21 | `redirect-chain` | Redirect Chain | Network | Traces the full redirect path from initial URL to final destination |
| 22 | `open-ports` | Open Ports | Network | Scans common TCP ports to identify running services |
| 23 | `traceroute` | Traceroute | Network | Traces the network path measuring latency at each hop |
| 24 | `cdn-detection` | CDN Detection | Infrastructure | Detects CDN provider from response headers and DNS |
| 25 | `whois` | WHOIS / Domain Info | Network | Retrieves domain registration, registrar, and expiration info |
| 26 | `subdomains` | Subdomain Enumeration | DNS | Discovers subdomains via DNS brute-force and CT logs |
| 27 | `related-domains` | Related Domains | DNS | Discovers related domains through DNS cross-referencing |
| 28 | `email-config` | Email Security | Security | Checks SPF, DKIM, and DMARC email authentication configs |
| 29 | `content-analysis` | Content Analysis | Content | Analyzes page metadata, OpenGraph, Twitter cards, and SEO |
| 30 | `tech-stack` | Technology Stack | Content | Detects web technologies, frameworks, CMS, and libraries |
| 31 | `robots-txt` | Robots.txt | Content | Fetches and parses robots.txt crawl rules and sitemaps |
| 32 | `sitemap` | Sitemap | Content | Fetches and parses XML sitemap to discover indexed pages |
| 33 | `link-analysis` | Link Analysis | Content | Analyzes internal and external links on the page |
| 34 | `social-media` | Social Media Presence | Content | Detects social media links and profiles on the website |
| 35 | `screenshot` | Site Screenshot | Content | Captures a visual screenshot via a rendering API |
| 36 | `trackers` | Tracker Detection | Content | Detects third-party tracking scripts and analytics |
| 37 | `performance` | Performance Metrics | Performance | Measures TTFB, page size, and response timing |
| 38 | `quality-score` | Quality Metrics | Performance | Evaluates overall website quality score |
| 39 | `accessibility` | Accessibility Check | Performance | Checks basic WCAG accessibility criteria |
| 40 | `carbon-footprint` | Carbon Footprint | Performance | Estimates carbon emissions per page load |
| 41 | `global-ranking` | Global Ranking | Reputation | Retrieves domain popularity and traffic ranking |
| 42 | `archive-history` | Archive History | Reputation | Checks Wayback Machine for historical snapshots |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Option 1: Docker (Recommended)

```bash
# Clone the repo
git clone https://github.com/GENESIS-PROKEY/ARGUS.git
cd argus

# Copy environment template
cp .env.example .env

# Build and run with Docker Compose
docker compose up --build
```

ARGUS will be available at **http://localhost:3001**

### Option 2: Development (npm)

```bash
# Clone the repo
git clone https://github.com/GENESIS-PROKEY/ARGUS.git
cd argus

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start all services (shared + backend + frontend)
npm run dev
```

- **Frontend** → http://localhost:5173
- **Backend API** → http://localhost:3001

### Option 3: Production Build

```bash
# Build everything
npm run build

# Start production server (serves frontend from backend)
npm start
```

---

## ⚙️ Configuration

All configuration is via environment variables. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend API server port |
| `NODE_ENV` | `development` | Environment (`development` / `production` / `test`) |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin for frontend |
| `CHECK_TIMEOUT_MS` | `15000` | Max time per check in milliseconds |
| `CACHE_TTL_SECONDS` | `300` | In-memory cache TTL (5 minutes) |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limit window (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per rate limit window |
| `LOG_LEVEL` | `info` | Logging level (`error` / `warn` / `info` / `debug`) |
| `REDIS_URL` | — | Optional Redis URL for distributed caching |
| `VIRUSTOTAL_API_KEY` | — | Optional [VirusTotal](https://www.virustotal.com/gui/join-us) API key |
| `GOOGLE_SAFE_BROWSING_KEY` | — | Optional [Google Safe Browsing](https://developers.google.com/safe-browsing/v4/get-started) API key |
| `CLOUDMERSIVE_API_KEY` | — | Optional [Cloudmersive](https://api.cloudmersive.com/) screenshot API key |

> **Note:** ARGUS works without any API keys. Adding keys unlocks enhanced threat intelligence and screenshot capabilities.

---

## 📡 API Documentation

### Health Check

```bash
curl http://localhost:3001/api/health
```

```json
{
  "status": "healthy",
  "timestamp": 1712764800000,
  "version": "1.0.0",
  "name": "argus",
  "checks": 42,
  "uptime": 3600
}
```

### Run a Scan (SSE Stream)

```bash
curl -N "http://localhost:3001/api/v1/scan?url=github.com"
```

The scan endpoint returns a **Server-Sent Events (SSE)** stream with the following event types:

#### `scan:start`
```json
{
  "type": "scan:start",
  "scanId": "uuid",
  "target": { "hostname": "github.com", "url": "https://github.com", "protocol": "https" },
  "totalChecks": 42,
  "timestamp": 1712764800000
}
```

#### `check:complete` (emitted 42 times)
```json
{
  "type": "check:complete",
  "scanId": "uuid",
  "checkId": "ssl-chain",
  "checkName": "SSL Certificate Chain",
  "result": {
    "success": true,
    "data": { "...check-specific data..." },
    "duration": 342
  },
  "completedCount": 1,
  "totalChecks": 42,
  "timestamp": 1712764800342
}
```

#### `scan:complete`
```json
{
  "type": "scan:complete",
  "scanId": "uuid",
  "passedCount": 42,
  "failedCount": 0,
  "totalChecks": 42,
  "totalDuration": 8023,
  "timestamp": 1712764808023
}
```

### Using with JavaScript

```javascript
const evtSource = new EventSource('/api/v1/scan?url=github.com');

evtSource.addEventListener('check:complete', (e) => {
  const data = JSON.parse(e.data);
  console.log(`✅ ${data.checkName} — ${data.result.duration}ms`);
});

evtSource.addEventListener('scan:complete', (e) => {
  const data = JSON.parse(e.data);
  console.log(`🔱 Scan complete: ${data.passedCount}/${data.totalChecks} passed`);
  evtSource.close();
});
```

---

## 🏗️ Architecture

```
argus/
├── packages/
│   ├── shared/              # Shared TypeScript types & interfaces
│   │   └── src/types.ts
│   ├── backend/             # Express API server
│   │   └── src/
│   │       ├── index.ts           # Express app + health endpoint
│   │       ├── config/            # Zod-validated env config
│   │       ├── checks/            # 42 check modules (each exports CheckModule)
│   │       ├── routes/v1/         # SSE scan endpoint
│   │       ├── services/          # Check runner with timeout + caching
│   │       ├── middleware/        # CORS, rate limiting, logging
│   │       └── utils/             # safeFetch, parseTarget, logger
│   └── frontend/            # React + Vite SPA
│       └── src/
│           ├── pages/             # HomePage, ResultsPage, HistoryPage
│           ├── components/
│           │   ├── layout/        # TopBar, Sidebar
│           │   ├── renderers/     # 20+ check-specific card renderers
│           │   └── ui/            # CircularGauge, MiniBar, etc.
│           └── hooks/             # useEventSourceScan
├── .env.example             # Environment template
├── Dockerfile               # Multi-stage production build
├── docker-compose.yml       # One-command deployment
└── .github/workflows/ci.yml # CI pipeline
```

### Key Design Decisions

- **Server-Sent Events** over WebSockets — simpler, unidirectional, automatic reconnection
- **Parallel execution** — all 42 checks run concurrently with individual timeouts
- **In-memory LRU cache** with optional Redis upgrade path
- **Zod validation** for both config and API inputs
- **Monorepo** with shared types for end-to-end type safety

---

## 🧩 Adding a New Check

1. **Create the check file** in `packages/backend/src/checks/`:

```typescript
// packages/backend/src/checks/my-check.ts
import type { CheckModule } from './index.js';

export const myCheck: CheckModule = {
  id: 'my-check',
  name: 'My Custom Check',
  description: 'What this check does',
  category: 'security',  // security | network | dns | content | performance | threats | infrastructure
  icon: 'shield',         // Lucide icon name
  run: async (target) => {
    const start = Date.now();
    try {
      // Your check logic here
      // target.hostname, target.url, target.protocol, target.port
      const data = { /* your results */ };
      return { success: true, data, duration: Date.now() - start };
    } catch (error) {
      return { success: false, error: error.message, duration: Date.now() - start };
    }
  },
};
```

2. **Register it** in `packages/backend/src/checks/index.ts`:

```typescript
import { myCheck } from './my-check.js';

export const checks: CheckModule[] = [
  // ... existing checks
  myCheck,
];
```

3. **Optionally add a custom renderer** in `packages/frontend/src/components/renderers/`:

```typescript
// MyCheckRenderer.tsx
export function MyCheckRenderer({ data }: RendererProps) {
  return <div>{/* Custom visualization */}</div>;
}
```

Register it in the renderer index to enable rich card rendering.

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/my-new-check`
3. **Commit** your changes: `git commit -m "feat: add my-new-check"`
4. **Push** to the branch: `git push origin feat/my-new-check`
5. **Open** a Pull Request

### Development Commands

```bash
npm run dev          # Start all services in watch mode
npm run build        # Build everything for production
npm run lint         # Lint all packages
npm run type-check   # TypeScript type checking
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>🔱 Nothing escapes ARGUS.</b><br/>
  <sub>Built with TypeScript, React, Express, and pure determination.</sub>
</p>
