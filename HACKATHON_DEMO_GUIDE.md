# RCRT demonstration entry points

All data and services are fictional. No real emergency provider is contacted. Dispatch, hospital acceptance, arrival and handover always require authorized human confirmation.

| Mode | Command | Browser entry |
| --- | --- | --- |
| Existing development app | `npm.cmd run dev` | http://localhost:5173 |
| Isolated host-only judge app | `npm.cmd run demo:prepare`, then `npm.cmd run demo` | http://localhost:5180/demo |
| Four-device private LAN | One-time LAN guide setup, then `npm.cmd run demo:lan` | The exact HTTPS URL printed at runtime |

Keep the existing PostgreSQL process running with `npm.cmd run db:local`; do not launch a duplicate instance. Both judge modes use the same preserved isolated judge database, so stop one before starting the other on its default ports. Standard development data stays separate.

For four-device roles, Windows/private-subnet firewall setup, certificate issuance and device trust, offline operation, fallback and cleanup follow [LAN_DEMO_GUIDE.md](LAN_DEMO_GUIDE.md). Do not bypass certificate warnings, expose PostgreSQL, enable router forwarding or publish local passwords/keys.

The `/demo` guide explains successful response, hospital rejection, final-ICU competition and reconnect scenarios. Use each role's authorized account from README and the private local DEMO_PASSWORD. Never manually alter database states to claim a successful handover. If resources have been consumed, they remain occupied; use another suitable fictional provider or a deliberately separate fresh judge workspace rather than resetting existing records.

Tests: `npm.cmd test`, `npm.cmd run test:integration`, `npm.cmd run test:e2e`, and Windows/PowerShell-7-specific `npm.cmd run test:lan`. The LAN test creates its own ephemeral certificate files and isolated database, does not modify trust/firewall settings, and never disables TLS verification. Physical-device checks are separate and must be recorded honestly.
