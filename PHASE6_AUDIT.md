# Phase 6 initial audit and plan

Inspected frontend routes, reporting/evidence, styling, role dashboards, useLive, HTTP sessions/origins/errors, emergency/coordination/medical/admission APIs, Socket.IO rooms, shared simulator, Prisma schema/migrations, isolated runners and existing tests/docs.

No P0 defect was demonstrated at inspection. Existing row locks, partial unique assignment/admission indexes, assessment versions, conditional inventory updates and unique handover receipts are preserved.

| Priority | Finding | Planned action |
| --- | --- | --- |
| P1 | Unexpected error logging uses raw error.message; database errors can include query/context | Generic server log and regression asserting private values never appear in logs/responses |
| P1 | Role/organization changes are not reconciled with existing socket rooms | Disconnect changed identities in the existing 15-second maintenance pass; revoke logout sockets immediately; test both |
| P1 | Each useLive hook opens a socket and refetches on overlapping events/session-ready | Shared scoped socket connections, coalesced refreshes, in-flight read sharing, event filtering; measure requests/connections |
| P1 | Server errors are unclear for offline/expired sessions; stale protected data can remain rendered | Clear unauthorized results, actionable network errors, no-store API responses |
| P1 | Existing inline dialogs lack consistent focus trap/Escape/focus return | Shared accessible confirmation dialog; preserve existing confirmation actions and names |
| P1 | Admission queue silently stops at 100 rows | Authorized backend pagination and accessible page controls |
| P1 | Judges lack an integrated controlled demo entry | Public information-only demo page with authenticated readiness/scenario panel and safe isolated fixture setup |
| P2 | Eager reporting, maps and role workspaces in a ~665 KB JS bundle | Lazy route/workspace modules; measure build bytes/gzip before/after |
| P2 | Small muted text, select focus, inconsistent disabled cursors and field metadata | Shared tokens/focus/touch sizes, responsive overrides, semantic states and linked errors |
| P2 | Landing page and role navigation under-explain the complete workflow | Complete seven-stage explanation, demo link, role navigation without auth bypass |
| P2 | Cross-browser and six-width responsive coverage absent | Inspect installed engines, test supported engines and actual widths; disclose unavailable engines |

Order: baseline measurements/tests → security and race fixes → shared accessibility and UI → responsive dashboards → measured performance → isolated demo experience → full verification and deployment-readiness documentation. No architecture replacement, new UI framework, development reset or deployment.

## Resolution

The listed implementation findings are addressed and regression-tested. Socket scope reconciliation is periodic rather than a database lookup on every high-frequency publication; logout is immediate and every private HTTP fetch checks current permissions. Admissions are paginated and unacknowledged alerts are independent of the selected history page. The demo has its own database and no reset endpoint. Recharts was unused in source and removed (37 installed packages removed).

P1 deployment limitation identified in the installed bcryptjs documentation: bcrypt uses the first 72 UTF-8 bytes, while the legacy login contract accepts up to 128 characters. Existing account hashing was preserved for compatibility. The locally generated demo password is within the byte limit; use generated local credentials, not long real passwords. Before production, decide and test a byte-limit or versioned hashing/migration policy without silently invalidating existing accounts. This is explicitly outstanding, not a claim of a complete security audit.

No P0 defect was demonstrated by inspection and the passing workflow/concurrency/privacy tests. Physical hardware, assistive-technology certification, load testing, Firefox/WebKit, production proxy topology and deployment security remain outside the completed local verification; see the deployment checklist.
