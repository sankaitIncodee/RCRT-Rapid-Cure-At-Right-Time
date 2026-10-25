# Phase 7 addition: private LAN demonstration verification

Verified on Windows with Node 24.14.1, 24 October 2026. Scope is local-network hackathon demonstration only. No public deployment or real emergency-service integration occurred.

## Implemented

- `demo:lan` serves the production frontend over HTTPS and proxies API/Socket.IO to a loopback-only backend. PostgreSQL stays on loopback. All participating roles share the existing isolated judge database.
- Private IPv4 discovery, explicit selection for ambiguous adapters, validated ports, certificate SAN/signature/key/validity checks, preflight database/build checks and verified HTTPS readiness.
- Exact HTTPS origin, Secure/HTTP-only/Strict sessions, host/origin validation, sanitized forwarding headers, loopback proxy trust, protected static-file boundaries and existing role-scoped APIs/events.
- Private configuration/certificate files remain ignored. No automatic certificate trust, firewall changes, database reset, resource replacement, admission acceptance or handover.
- Explicit unavailable-map background while preserving coordinates/markers/manual pin selection. LAN socket attempts continue when the browser reports no internet; reconnect listeners/timers clean up.
- LAN readiness information stays authenticated. Public demo guidance exposes no passwords or infrastructure secrets.
- Setup, manual trust, restricted firewall, four-device walkthrough, offline limitations, troubleshooting and cleanup documented in LAN_DEMO_GUIDE.md and HACKATHON_DEMO_GUIDE.md.

## Automated verification

| Command | Actual result |
| --- | --- |
| `npm.cmd run check` | Passed frontend, backend and tools TypeScript |
| `npm.cmd run lint` | Passed |
| `npm.cmd test` | 48 passed; 51 separate integration tests intentionally skipped |
| `npm.cmd run test:integration` | 51 passed, PostgreSQL persistence/concurrency/authorization |
| `npm.cmd run test:lan` | 16 named checks passed against the real launcher, selected adapter, HTTPS/WSS and persistent database |
| `npm.cmd run build` | Backend and frontend passed |
| `npx.cmd prisma validate` | Passed |
| `npx.cmd prisma migrate status` | All five migrations applied; development schema up to date |
| `npx.cmd prisma generate --schema .local/lan-prisma-check/schema.prisma` | Passed using an identical schema with isolated generator output; active engine DLL untouched |
| `npm.cmd audit` | 0 vulnerabilities |

Google Chrome: **16 passed (2.6 minutes)** using the isolated browser runner. Microsoft Edge: **16 passed (2.7 minutes)** using `npm.cmd run test:e2e`; Chrome used `$env:RCRT_BROWSER_CHANNEL='chrome'` with the same command. Existing browser coverage is preserved and extended for missing map tiles and an internet-offline indicator with a reachable LAN backend. Responsive assertions cover 360, 390, 768, 1024, 1366 and 1920 pixels. These browser runs use loopback HTTP; verified LAN HTTPS/WSS is covered separately by the Node LAN suite, not by a phone or trusted browser.

Sandbox-only attempts could not connect to local sockets/PostgreSQL or resolve the npm registry. Authorized reruns outside that restriction passed; these infrastructure errors were not hidden as application successes. A redundant database start found the existing persistent service already present; no files or locks were deleted.

### Real HTTPS/WSS workflow

The LAN suite generated an ephemeral test CA without installing it, then launched the actual gateway on the detected Wi-Fi address `172.20.10.2` and a temporary free port. This is an observation, not a configured permanent address. Runtime configuration must use the current adapter address.

Sixteen checks covered certificate mismatch/expiry/signature validation; verified HTTPS; unknown-CA and wrong-host rejection; private-file denial; separate role cookies; exact origin; WSS upgrades; multipart SOS/photo and operator event; dispatch/explicit crew acceptance; assessment/matching; admission retries and hospital event; hospital/clinical/public privacy; acceptance/reservations/preparation; transport disconnect/reconnect with persisted simulation; separate arrival/handover; retained resource consumption; unique receipt/audit and scoped logout.

TLS verification was enabled throughout. The suite explicitly trusted only its ephemeral public CA in its own Node clients. No operating-system/browser trust store was changed. Its random isolated test database alone was dropped. Development and prepared judge records/resources were preserved.

### Build observations

Production main JavaScript: 324.46 kB (103.78 kB gzip); main CSS: 30.17 kB (7.37 kB gzip). Leaflet remains a separate 154.58 kB JavaScript chunk. No JavaScript chunk exceeds 500 kB. The launcher explicitly builds with production NODE_ENV to avoid inheriting a development React bundle. No controlled page-load latency improvement is claimed.

Remaining non-fatal warnings: upstream Zod pure-comment annotations, Prisma 6 package-configuration deprecation and browser runner NO_COLOR/FORCE_COLOR messages. Edge also logged a Vite WebSocket ECONNRESET during browser-context teardown; reconnect assertions and all 16 tests passed. No dependency was added for the LAN gateway or certificate checks.

## Partially tested / not tested

- Host-level TLS/API/socket verification passed. A physical patient phone, crew phone and second laptop were not available for this automated pass.
- Warning-free HTTPS on participating browsers requires their explicit public-CA trust setup. mkcert installation, trust changes and firewall edits were not performed automatically.
- Physical GPS accuracy/permission prompts, microphone hardware/codecs, audible alarms, background-tab suspension, hotspot peer isolation, real Wi-Fi loss and managed-device CA policies remain manual checks.
- Firefox and WebKit were not run. No claim of physical four-device or cross-engine certification is made.
- Internet-free core behavior is supported; external OpenStreetMap tiles/links need internet. No offline tile package was downloaded. Actual loss of WAN while four devices remain connected still needs rehearsal.
- This is a fictional demonstration, not a clinically certified emergency system. Existing public-deployment blockers in DEPLOYMENT_READINESS.md remain applicable.

## Launch and acceptance

Keep `npm.cmd run db:local` running. Prepare the isolated workspace once with `npm.cmd run demo:prepare`. Follow LAN_DEMO_GUIDE.md to select the adapter, issue the correct certificate, trust its public CA on each device, configure `.local/lan.env` and manually scope the firewall rule. Run `npm.cmd run demo:lan`; all four roles use its printed HTTPS URL and separate authorized accounts.

Do not run the HTTP judge launcher simultaneously on the same ports. Ctrl+C stops only the LAN gateway/backend, preserving data. Complete the physical-device checklist before presenting this as a verified four-device demonstration. No public deployment was performed.

## Files changed for this addition

- Launcher/config/proxy: `scripts/lan-demo.ts`, `scripts/lan-config.ts`, `scripts/lan-gateway.ts`, `.env.lan.example`, `package.json`, `.gitignore`.
- Backend: `server/src/config.ts`, `server/src/index.ts`, `server/src/app.ts` (binding, HTTPS-mode origin/cookies/proxy trust, scoped readiness).
- Frontend: `client/src/components/MapBackground.tsx`, `LocationPicker.tsx`, `EmergencyMap.tsx`, `HospitalDiscovery.tsx`, `client/src/pages/PatientAssessment.tsx`, `Demo.tsx`, `client/src/services/live.ts`, `client/src/polish.css`.
- Tests: `scripts/lan-verification.ts`, `scripts/create-lan-test-cert.ps1`, `server/src/lan-config.test.ts`, `tests/medical.spec.ts`, `tests/readiness.spec.ts`.
- Documentation: `README.md`, `LAN_IMPLEMENTATION_PLAN.md`, `LAN_DEMO_GUIDE.md`, `HACKATHON_DEMO_GUIDE.md`, this report.

No Prisma schema or migration changes were required. No existing test was removed or weakened.

