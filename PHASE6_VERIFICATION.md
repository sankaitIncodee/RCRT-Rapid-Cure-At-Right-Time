# RCRT Phase 6 — implementation and verification

24 October 2026 · Team NOVAMIND · NAVDHARA 2026

## Outcome and scope

Phase 6 improves the existing application without replacing its architecture or emergency workflow. All critical actions still require the appropriate human confirmation. No real emergency service, IoT device, AI diagnosis, global reset or deployment was added. Phase 7 requires approval.

The audit is in PHASE6_AUDIT.md. No P0 defect was demonstrated by the completed inspection and automated checks. Important findings were fixed or explicitly documented. This is a local hackathon verification, not penetration testing, clinical validation or certification for real emergencies.

## Implementation and UI changes

- Public landing page now explains the full seven-stage workflow and key features, with visible fictional-service disclaimer, emergency reporting, demo entry and learn-how-it-works navigation.
- `/demo` explains four reproducible scenarios, role access and simulated data. It cannot sign a user in or grant privileges. Signed-in users get real backend/database/socket readiness and counts limited to their role. Hospital active-case counts exclude rejected/cancelled/historical admissions.
- Separate judge workspace preparation creates a randomly named local PostgreSQL database and its own app ports. Repeated preparation preserves its records/quantities; there is no reset button. Passwords remain in ignored local configuration.
- Shared typography, surfaces, spacing, status badges, form focus/contrast and 44-pixel touch controls extend the existing navy/blue design. Patient/Bystander, Operator, Crew, Hospital and Administrator layouts were rendered at all six requested widths. Crew controls include a stationary-operator/other-crew-member notice.
- One reusable confirmation dialog provides a named modal, focus containment, Escape, inert background and focus return. Existing dispatch, patient arrival, preferred hospital, admission, acceptance/rejection, hospital arrival and handover confirmations remain explicit. Busy states remain disabled after moving dialogs into a portal.
- Login field errors have linked descriptions and invalid states. Reporting errors describe the form. Loading/error boundaries, skip navigation, reduced-motion behavior and accessible preparation progress were added. Actual state labels remain visible alongside color.
- Admission history now has authorized pagination with stable ordering; old unacknowledged pending alerts remain available independently of the history page. Request/assignment lookup uses a map rather than repeated array scans.

## Security changes and evidence

| Area | Implemented / tested |
| --- | --- |
| Error privacy | Unexpected server errors use a generic message, not raw database/query/payload messages. Unit regression confirms private marker/secret text is absent from logs and responses. Excessive JSON returns 413. |
| Sessions | HTTP-only cookie sessions, expiry and role checks preserved. Logout disconnects sockets for that exact hashed session immediately. Private unauthorized views clear stale data. |
| Socket scopes | Changed hospital/ambulance/role identity disconnects during the existing maintenance pass. Integration tests explicitly revalidate changed hospital scope and assert disconnect; logout is tested without waiting for maintenance. |
| API caching / client sharing | Private APIs use no-store. Only in-flight GETs share a promise; completed responses are not cached. Login/logout clear in-flight sharing. Unit tests cover fresh reads, login boundaries, network errors and expiry. |
| Clinical privacy | Existing tests deny patient/admin/anonymous/wrong-crew/wrong-hospital clinical access, protect media, and keep public tracking free of assessments, reservation internals, staff and handover notes. |
| Inputs / concurrency | Existing origin, signature/media, numeric/version and transaction tests retained. New tests cover paginated scope, simultaneous handover and duplicate arrival. |
| Dependency review | Actual npm audit returned zero findings at all severities after unused Recharts and 37 installed packages were removed. This is not a complete security audit. |
| Secrets / fixtures | `.env`, `.local/demo.env`, generated artifacts and persistent database files remain ignored. No credentials are rendered on public demo pages. |

Scope changes are checked periodically (15 seconds), not through a database lookup on every position broadcast. Payloads remain IDs/references and private API authorization is current on every fetch. A future staff-management feature should revoke changed sessions immediately.

Remaining P1 production decision: bcrypt considers only the first 72 UTF-8 password bytes while the existing login contract accepts 12–128 characters. Generated local demo credentials fit within the byte limit. Account hash format/login compatibility was not silently migrated. A byte-limit/versioned hashing and migration policy is required before accepting real credentials; this limitation is documented in the audit, README and deployment checklist.

## Reliability and data preservation

- Shared scoped sockets replace one socket per hook; reference counting cleans listeners, browser online/offline handlers and room subscriptions. StrictMode remounts reuse the connection. Last-subscriber cleanup disconnects it.
- Initial loads no longer repeat solely on first socket-ready. Overlapping events coalesce before refetch. Movement does not refetch aggregate dashboard data, clinical forms or whole admission history; live detail maps continue updating and recovery polling remains.
- Existing latest-response/version protection and synchronous medical dirty-edit guard remain. Browser regression triggers a live operator event during unsaved ICU edits and asserts preservation.
- Request IDs still deduplicate alarms; acknowledgement persists, disabled/denied audio retains visual alerts, and failed browser storage does not crash emergency review.
- Dispatch races, final-ICU races and simultaneous handovers are tested with real PostgreSQL. Exactly one handover receipt/audit completion is created. Occupied resources remain consumed; the vehicle becomes available only after handover.
- Simulation progress/state/version is persistent. Pause/resume/reset, restarted scheduler, reconnect and stale-tick rejection remain covered. No simulation automatically confirms arrival or handover.
- All five existing migration files match their applied SHA-256 checksums. No Phase 6 schema migration or reset was needed. Existing hospital seed quantities are preserved. Demo/test fixtures use separate databases or captured fixture IDs.

The first database baseline attempt found PostgreSQL stopped; the existing persistent instance was restarted and checks rerun. An early automatic approval-service usage-limit failure prevented one test command from executing; it was retried successfully after the reviewer became available. Neither blocked attempt is counted as passing.

## Automated check results

| Command / check | Actual result |
| --- | --- |
| `npm.cmd run check` | Passed: client, server, tools, seeds and tests |
| `npm.cmd run lint` | Passed |
| `npm.cmd test` | 45 passed, 6 unit/API suites; 51 integration tests intentionally skipped here |
| `npm.cmd run test:integration` | 51 passed, 4 PostgreSQL suites, run separately |
| `npm.cmd run test:e2e` — Microsoft Edge | 15 passed; final repeat also passed all 15 in 2.5 minutes |
| `RCRT_BROWSER_CHANNEL=chrome` browser run | 15 passed in installed Google Chrome |
| Frontend/backend production build | Passed; no >500 KB JavaScript chunk warning |
| Prisma schema validation | Passed |
| Full Prisma client generation | Passed in isolated output `.local/phase6-prisma/client` |
| Prisma migration status | Up to date: 5 migrations; all applied checksums match |
| `npm.cmd audit --json` | Exit 0, zero vulnerabilities at every severity |
| Judge setup / repeated prepare / readiness | Passed: own database, idempotent prepare, authenticated readiness HTTP 200, 0 active fixtures / 3 free fictional vehicles initially |

The normal Prisma engine is in use by active Windows app processes. The permitted safe generation check copied the identical schema with only its generator output changed, and generated the complete client successfully. No locked DLL was deleted. The ordinary project client remains the valid Phase 5 schema client; Phase 6 added no schema changes.

Final runtime checks: both the standard backend (4000) and isolated judge backend (4200) return HTTP 200, database connected and phase 6. There are zero temporary browser databases remaining. The prepared judge database is intentionally retained. The local generated demo password was checked without displaying it and is within bcrypt's 72-byte limit.

An early 241-read integration regression exceeded its default five-second test budget while browsers/builds competed for resources. Its same 241 read assertions now run in batches of ten independent requests; the authenticated write assertion is unchanged. The full 51-test database suite then passed. No prior assertion was removed or weakened.

## End-to-end and browser coverage

The original 12 browser workflows remain, plus 3 readiness/accessibility tests. Separate authenticated contexts exercise real SOS → operator review/dispatch → crew acceptance/patient trip/arrival → assessment and matching → hospital selection/request → hospital alert/acknowledgement/acceptance/preparation → transport/location → arrival → hospital-confirmed handover → resolved case, correct consumed capacity and available ambulance. No backend response is mocked for that main workflow.

Additional coverage includes rejection/reselection at a second hospital, hospital disconnect/reconnect, disabled audio and simulated AudioContext denial, native Web Audio playback counts, actual MediaRecorder upload/playback and protected media, anonymous SOS, denied GPS/microphone, manual map fallback, late GPS protection, assessment drafts/refresh/conflicts, filters, simulation controls, tracking expiry and privacy.

Both Edge and Chrome rendered 360, 390, 768, 1024, 1366 and 1920 pixel widths. Tests assert no horizontal document overflow and no horizontally clipped visible controls for public pages and role dashboards; the live assessment/matching view also checks all six widths. Keyboard tests verify modal focus loop, Escape, inert background, focus return and no dispatch performed on cancellation. The operator dashboard asserts one shared socket.

Bundled Chromium, Firefox and WebKit executables were checked and are not installed. They were not tested or downloaded. Edge and Chrome both use Chromium-based engines; these results do not establish Firefox/WebKit compatibility. Hospital desktop, crew tablet and public demo mobile screenshots were visually inspected. Tiles were deliberately blocked in clinical tests, so gray map backgrounds in those screenshots are expected.

## Measured performance

Before/after artifacts are stored privately under `.local/phase6-performance-before.json` and `...after.json`. No performance figures were invented.

| Measurement | Before | After |
| --- | ---: | ---: |
| Main production JavaScript | 665,503 bytes | 324,365 bytes |
| Main JavaScript gzip | 203,189 bytes | 103,747 bytes |
| Initial stylesheet | 38,379 bytes | 29,926 bytes |
| Operator initialization API GETs, through ready + 5 seconds | 12 | 4 |
| Operator socket connections | 3 | 1 |
| Single local development-server operator-ready sample | 2,536 ms | 6,641 ms |

The main script is about 51% smaller; reads/connections fell by two thirds. These compare main entry assets, not every lazy chunk downloaded throughout a complete emergency workflow. Reporting, login, maps and operational pages load separately; new UI code means total all-route bytes need not decrease. No SQL latency or controlled wall-clock speedup is claimed. The single after sample was slower and was collected after restarting the dev app while Chrome verification was running. Cold transforms, caching and machine load were not controlled.

The build now has no JavaScript chunk above 500 KB. Upstream Zod annotation warnings and Prisma 6 package-configuration deprecation remain non-fatal. There was no blanket memoization or removal of essential live updates.

## Demo launch and manual verification

Standard app: keep `npm.cmd run db:local` running, then `npm.cmd run dev`; open http://localhost:5173/demo.

Isolated judge app: `npm.cmd run demo:prepare`, then `npm.cmd run demo`; open http://localhost:5180/demo. Its local password/configuration is in ignored `.local/demo.env`. Existing prepared data is preserved, including consumed resources. No public credentials or automatic confirmations are provided. The README explains all four scenarios and each hospital account.

Manual checklist: desktop operator queue/evidence/maps and hospital acceptance/preparation/handover; tablet crew form, hospital cards and transport actions; mobile Patient/Bystander SOS, fallback location, evidence and token tracking. On physical devices test GPS grants/denials, microphone recording/playback, actual alarm audibility, background tabs, network loss and assistive technology. These physical/human-operated tests were not performed by this automated pass.

## Deployment readiness and remaining limits

DEPLOYMENT_READINESS.md lists the Phase 7 prerequisites: hosting approval, managed database/TLS/backups/restore, private secrets, HTTPS and cookie/origin configuration, frontend SPA hosting and API proxy, WebSocket support, trusted proxy/rate-limit settings, single-instance simulator or coordinated scaling, evidence quotas/storage/retention, tile policy, monitoring, password-byte migration policy, load/accessibility/hardware/alternate-engine testing.

Not implemented/tested: real emergency-service integration, AI diagnosis, IoT, road routing, live hospital feeds, external family messaging, discharge/replenishment, safe in-transit destination changes, automatic expiry, real-device verification, clinical certification or deployment. Public health/readiness exposes no credentials or database connection details. Pending alert metadata is currently fetched for the authorized pending set; production-scale queue limits/load behavior need further measurement.

Phase 6 stops here. No Phase 7 deployment has started.
