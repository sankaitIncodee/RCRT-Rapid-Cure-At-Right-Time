# Phase 7 deployment readiness checklist

Phase 6 does not deploy RCRT. The target is a fictional hackathon demonstration, not a service for real medical emergencies.

## Required before publishing

- Choose a hosting environment and obtain explicit Phase 7 approval. No deployment, DNS or public service has been created.
- Provision a supported managed PostgreSQL database with TLS, a least-privilege application account, backups, retention, and a tested restore procedure. Keep the database-creation privilege used by local demo/test preparation out of production.
- Store DATABASE_URL and staff passwords in the host's secret manager. Never publish `.env`, `.local/demo.env`, test traces, recordings, database files or generated clients. Rotate local demo credentials before any public demonstration.
- Resolve the legacy password-byte policy before production. The installed bcrypt library considers only the first 72 UTF-8 bytes; the existing API permits up to 128 characters for compatibility. Current generated demo passwords fit within 72 bytes. Choose and test a byte-limited or versioned hashing/account-migration policy before accepting real credentials.
- Set NODE_ENV=production and CLIENT_ORIGIN to the single exact HTTPS frontend origin. Production does not accept development loopback aliases. Use secure HTTP-only session cookies and an HTTPS origin for microphone/GPS access.
- Build frontend/backend with `npm.cmd run build`; host `client/dist` with SPA route fallback. The backend serves the API, not the SPA bundle. Proxy `/api` and `/socket.io` consistently and preserve credentialed same-origin requests.
- Configure WebSocket upgrades, proxy timeouts and TLS. The current server and simulator are designed for one backend process. Replicas need a shared Socket.IO adapter, coordinated simulator ownership and suitable sticky-session behavior before scaling.
- Configure Express proxy trust for the actual trusted proxy topology before relying on public IP rate limits. Do not blindly trust arbitrary forwarded addresses. Rate-limit state is currently process-local.
- Apply committed migrations with `npm.cmd run db:migrate` against the intended database; never use reset. Generate Prisma before starting the Windows process that locks its engine DLL. Verify all migration checksums and data preservation.
- Do not run the fictional seed or local demo-preparation script as a production bootstrap. Provision authorized staff deliberately. Local demo setup refuses NODE_ENV=production and has no global reset endpoint.
- Establish private evidence storage, quotas and retention. The demo stores validated media bytes in PostgreSQL and buffers uploads in memory; production needs capacity planning and abuse controls. Preserve protected media authorization if storage moves.
- Review a frontend Content Security Policy and the tile provider's usage/privacy requirements. Maps depend on external tiles and have an approximate straight-line fallback; no road-routing contract or live hospital feed exists.
- Monitor health/readiness, generic error codes, failed requests, reservation conflicts and simulator behavior without logging medical payloads, tokens or cookie values. Add structured request correlation, metrics, alerting and error monitoring with sensitive-value filtering.
- Agree on session lifetimes, access revocation, data retention/deletion, fictional-data policy and incident response. Logout disconnects its socket immediately. Organization/role changes are checked by the 15-second socket maintenance pass; APIs enforce current permissions on every request. Any future staff-management feature should revoke affected sessions immediately.
- Complete physical GPS/microphone/audio and background-tab tests, Firefox/WebKit verification, accessibility review with assistive technology, load testing and deployment-specific security testing.

## Verified locally in Phase 6

Production builds; schema/client generation and migration status; protected cookie sessions and origin validation; role/case/hospital isolation; protected media; request validation; dispatch/ICU/handover concurrency; scoped real-time updates and reconnect; duplicate/stale handling; six-width Edge/Chrome rendering; safe isolated demo preparation and readiness; dependency audit.

## Remaining product limits

Fictional inventory and providers, manual operator/crew/hospital decisions, simulated ETA and straight-line routes, optional browser sound, no real dispatch integration, no AI diagnosis, no automatic admission/handover, no discharge/replenishment workflow, no automatic reservation expiry, no in-transit destination-change protocol, no external family messaging or clinical certification. Consumed resources remain occupied after handover.
