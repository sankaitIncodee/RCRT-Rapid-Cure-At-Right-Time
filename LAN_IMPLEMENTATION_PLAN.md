# LAN demo extension plan

1. Preserve the isolated judge database and all existing workflows. Add no public deployment or data reset.
2. Serve the built frontend from a dedicated HTTPS gateway on the configured LAN port. Proxy API and Socket.IO to loopback Express; PostgreSQL stays on loopback. Serving only the build avoids exposing Vite source/filesystem tooling to LAN clients.
3. Detect private IPv4 adapters, require an explicit choice when ambiguous, validate local IP/ports and certificate SAN/key/validity, and use exact HTTPS origins plus Secure HTTP-only cookies.
4. Provide one launcher with database/config/port/build/readiness checks. No automatic certificate trust, firewall edits or credential generation. Document mkcert setup and device trust explicitly.
5. Make missing map backgrounds explicit while preserving markers, coordinates, manual selection and all offline-LAN core operations.
6. Test configuration, verified TLS, API/socket proxy, cookies, role isolation/reconnect and existing suites. Use temporary test certificates without modifying trust stores; disclose physical-device/trusted-browser prerequisites that cannot be verified here.
