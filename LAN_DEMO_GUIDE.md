# RCRT four-device local-network demonstration

This is a fictional prototype. It does not contact emergency services or replace professional assistance. No public hosting, paid resources, router forwarding or database reset is involved.

## Hardware and network

Use the main Windows laptop for hosting/operator, one Patient/Bystander phone, one Crew phone and a Hospital laptop. Install project dependencies before going offline. Node 22.12+ (tested on 24), the existing local PostgreSQL runtime and modern browsers are required. PowerShell commands below run from the repository folder; use `npm.cmd` to avoid execution-policy errors.

Connect all devices to the same trusted Wi-Fi/hotspot. Avoid guest networks with peer/client isolation. A VPN, managed-device policy, firewall or hotspot may block local peers. The hotspot's own phone may not behave like another client: verify its reachability rather than assume it works. Core operations need a functioning LAN, not internet access. Keep device clocks correct for timestamped GPS updates.

## Architecture and ports

```text
All four browsers: https://<selected-laptop-IPv4>:5180
                         |
                 HTTPS built-frontend gateway (0.0.0.0)
                    /api + /socket.io
                         |
                 Express / Socket.IO (127.0.0.1:4200)
                         |
                 isolated judge PostgreSQL (loopback)
```

Only the HTTPS entry port needs a firewall rule. The backend is deliberately private behind the same-origin proxy; do not expose 4200 or the database port. PostgreSQL remains bound to 127.0.0.1. The gateway serves `client/dist`, not Vite source, private keys, environment files or database files. It rejects nonprivate remote clients, unexpected Host and WebSocket origins. It forwards device IPs itself and the private backend trusts only loopback proxies.

## 1. Find the Wi-Fi address

```powershell
npm.cmd run demo:lan:addresses
Get-NetConnectionProfile
Get-NetIPAddress -AddressFamily IPv4 | Format-Table InterfaceAlias,IPAddress
```

Choose the active Wi-Fi/hotspot adapter, not a VM/Ethernet-only adapter. Enter its current IPv4 address:

```powershell
$lanAddress = Read-Host 'Enter the active Wi-Fi IPv4 address shown above'
```

No example address is hardcoded. With several private adapters the launcher requires an explicit choice. If DHCP changes the address, update configuration and issue a new leaf certificate for it. Do not replace the CA unnecessarily.

## 2. Prepare the existing isolated database

Terminal 1, unless PostgreSQL is already running:

```powershell
npm.cmd run db:local
```

Terminal 2:

```powershell
npm.cmd run demo:prepare
```

Repeated preparation preserves the existing judge workspace. The LAN launcher never runs seed/reset. It uses the database and credentials already stored in ignored `.local/demo.env`. It refuses a main, remote or non-judge database. Stop `npm.cmd run demo` first if its local judge app already occupies 5180/4200. The standard app on 5173/4000 can remain running.

## 3. Create and trust local HTTPS certificates

mkcert is not bundled or automatically installed. Install it yourself from its [official project/releases](https://github.com/FiloSottile/mkcert). Its documented Windows package-manager options include Chocolatey and Scoop; opening a new terminal may be needed afterward.

The following manual command explicitly installs your development CA on the host. Review the trust prompt; RCRT never executes this automatically:

```powershell
mkcert -install
New-Item -ItemType Directory -Force .local/lan | Out-Null
mkcert -cert-file .local/lan/server.pem -key-file .local/lan/server-key.pem $lanAddress localhost 127.0.0.1
$rcrtCaDirectory = mkcert -CAROOT
Copy-Item -LiteralPath (Join-Path $rcrtCaDirectory 'rootCA.pem') -Destination .local/lan/rootCA.pem
Copy-Item -LiteralPath .local/lan/rootCA.pem -Destination .local/lan/rootCA.crt
```

Transfer **only the public CA certificate** `rootCA.crt` to participating devices through a channel you control. Never transfer `rootCA-key.pem`, `server-key.pem`, `.env` or `demo.env`. Do not use the ephemeral certificates created by `test:lan` as a judge trust setup.

- **Second Windows laptop:** open the public CA file and install it into the current user's Trusted Root Certification Authorities after checking its identity. Restart the browser if needed.
- **iPhone/iPad:** install the downloaded certificate profile, then explicitly enable its SSL trust in Settings → General → About → Certificate Trust Settings. Merely installing the profile is insufficient. See [Apple's instructions](https://support.apple.com/en-gb/102390).
- **Android:** install the public certificate as a user CA using Security/Privacy → credential/certificate settings. Manufacturer labels and managed-device restrictions vary. Use a browser that trusts that user CA and verify a warning-free connection; do not confuse a Wi-Fi authentication certificate with trusting this HTTPS issuer. See [Google's certificate guidance](https://support.google.com/pixelphone/answer/2844832/add-amp-remove-certificates).

Before logging in, every device must open the printed HTTPS URL **without** a certificate warning. Do not click through warnings or disable verification. Check issuer, validity and address if it fails. The launcher's successful CA verification does not install trust in a browser or phone. mkcert's [mobile trust documentation](https://github.com/FiloSottile/mkcert#mobile-devices) describes the distinction.

## 4. Configure the LAN entry

```powershell
Copy-Item .env.lan.example .local/lan.env
notepad .local/lan.env
```

Set `RCRT_LAN_HOST` to the chosen Wi-Fi IPv4 value. Keep the sample certificate paths unless you placed them elsewhere. Ports default to 5180/4200 and must be free. Use the same configured frontend port in the firewall rule. No password belongs in `lan.env`; credentials remain in `demo.env`.

The launcher verifies assigned private IP, distinct valid ports, certificate IP SAN/expiry/signature/key, local CA, isolated database connectivity, free listeners, build success, backend readiness and verified HTTPS proxy readiness. It uses Secure, HTTP-only, SameSite=Strict cookies and an exact HTTPS origin. Browser API and socket URLs are relative to that same origin.

## 5. Windows Defender Firewall

Do not disable the firewall. On the trusted hotspot only, confirm the Wi-Fi connection is categorized **Private**. If it is Public and you control/trust this network, change it in Windows Network settings (or use `Set-NetConnectionProfile` deliberately as administrator).

In an Administrator PowerShell, after setting `$lanAddress` to the current address and choosing the actual adapter name:

```powershell
New-NetFirewallRule -DisplayName 'RCRT HTTPS LAN Demo' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5180 -LocalAddress $lanAddress -Profile Private -RemoteAddress LocalSubnet -InterfaceAlias 'Wi-Fi' -EdgeTraversalPolicy Block
```

This is a manual, temporary Private-profile/LocalSubnet rule, not unrestricted Public access. Adjust the port/adapter if configured differently. The application creates no firewall rules. Keep backend/database ports closed, do not configure router forwarding, and do not use a public tunnel. Microsoft's [firewall command reference](https://learn.microsoft.com/en-us/powershell/module/netsecurity/new-netfirewallrule) explains these scope controls.

## 6. One-command startup

Keep PostgreSQL running, then:

```powershell
npm.cmd run demo:lan
```

Use the printed `https://<actual-address>:<port>/demo` URL on **all** devices, including the host operator. Never enter localhost on a phone: it would mean the phone itself. Do not mix LAN HTTP, localhost and HTTPS addresses during the workflow; cookies belong to the selected origin. The launcher does not generate new credentials, install trust, modify the firewall or alter judge records.

If a port is occupied, stop the previous local judge/LAN process with Ctrl+C or choose different ports in `lan.env`; do not stop PostgreSQL or kill unrelated Node apps. If no trusted certificate can be configured, use the host-only fallback below rather than an insecure credentialed LAN server.

## 7. Accounts and four-device workflow

Use separate devices/profiles so cookies do not overwrite one another. The shared local password is the DEMO_PASSWORD value in `.local/demo.env`; do not publish it. Existing accounts: patient@rcrt.demo, operator@rcrt.demo, ambulance@rcrt.demo and hospital@rcrt.demo (Pinecrest). hospital1 through hospital4 map to the other four fictional providers in README. ambulance1/ambulance2 are the other crews.

1. **Patient phone:** sign in and send a fictional SOS. Grant GPS if desired, or use a manual pin/written landmark. Photo and up-to-15-second voice evidence are optional. Retain secure tracking.
2. **Operator laptop:** receive the alert, review it and request the appropriate available crew. No dispatch is confirmed yet.
3. **Crew phone:** accept, simulate the patient trip, explicitly confirm patient reached, complete assessment and requirements. Operate controls only while stationary or through another crew member.
4. **Crew phone:** refresh hospital matching, choose a compatible provider and request admission. No resource is reserved yet.
5. **Hospital laptop:** sign in to that provider's account, review the request, acknowledge the visual alert, optionally enable sound with a click, accept and inspect reservations. Update applicable preparation tasks.
6. **Crew phone:** start accepted hospital transport; use GPS or labeled simulation, pause/resume as needed, then explicitly mark hospital arrival. Vehicle remains BUSY.
7. **Hospital laptop:** enter receiving staff and explicitly confirm handover. Inspect the private receipt.
8. **All devices:** verify completion, available vehicle, retained history and consumed/occupied hospital resources. Handover does not replenish beds.

Also demonstrate rejection/reselection, an acknowledged request across refresh, and a crew reconnect during transport. Backend simulation continues without the phone; reconnect refetches the persisted position. Do not manually change database records to force workflow transitions.

## 8. Offline LAN and interruption checks

Install dependencies, prepare data, issue certificates and build before removing internet. While devices remain on a working LAN, authentication, reports/media uploads, dispatch, matching, sockets, reservations, simulation and handover are local. There is no cloud API requirement.

OpenStreetMap tiles and external map links require internet. Missing tiles show an explicit message over a plain background; markers, coordinates, manual pin selection and the workflow remain usable. No bulk tiles were downloaded or redistribution/caching assumptions introduced. A browser's internet indicator does not suppress initial LAN socket connection attempts.

Turn off one client device's Wi-Fi temporarily (not the host's hosting adapter), then reconnect. Test patient tracking after SOS, crew during transport, hospital before acceptance and operator refresh. Do not send a different report merely because a response was lost: check the existing reference/secure tracking. Backend idempotency and state checks prevent duplicate dispatch, admission and handover. Acknowledged request alarms do not replay automatically.

## 9. Fallback when device trust is unavailable

Do not bypass TLS warnings or send role credentials over plain LAN HTTP. Instead run `npm.cmd run demo` on the host and use separate local browser profiles at http://localhost:5180. Use manual locations/descriptions, optional photo evidence and server simulation; microphone/GPS are unnecessary. Show mobile-sized views or mirror the host display to judges. This is a host-only fallback, **not** proof of physical multi-device operation.

## 10. Troubleshooting, shutdown and cleanup

- Certificate warning: check the exact address/port, leaf SAN, expiry, correct public CA and explicit device trust; restart the browser. Never disable verification.
- No connection from a phone: check same LAN, current IP, Private-profile rule, LocalSubnet scope, adapter name and hotspot peer isolation. A managed phone may forbid user CAs/local networking.
- Login/origin error: use exactly the printed HTTPS entry address and local demo password; restart LAN mode after configuration changes.
- GPS/microphone denied: verify warning-free HTTPS, secure context and permissions; use manual fallback. Keep clocks correct. Sound needs a user action and may be suspended in background tabs.
- Data unchanged after reconnect: wait for authoritative refetch; inspect the authenticated readiness panel. Do not reset the database.

Ctrl+C in the LAN terminal stops the gateway/private backend and preserves data. Leave PostgreSQL running for another demo, or stop it separately with Ctrl+C when finished. Remove the temporary rule in Administrator PowerShell:

```powershell
Remove-NetFirewallRule -DisplayName 'RCRT HTTPS LAN Demo'
```

Remove only the development CA/profile you installed from participating devices, verifying its identity first. Do not remove unrelated trusted roots. If you no longer need mkcert trust on the host, use its documented uninstall procedure, considering other local projects that may share the CA. Keep private keys private; manually archive/remove only the explicit `.local/lan` certificate directory when no longer needed. No cleanup step should reset RCRT's development or judge database.

## Verification status

See PHASE7_VERIFICATION.md for exact automated results. HTTPS/WSS, secure cookies and the complete API workflow are checked from the host using its real private Wi-Fi IP with explicit CA verification. This does not install a CA on phones or prove hotspot/firewall reachability from another machine. Physical Android/iOS/browser trust, real GPS/microphone and four-device handover remain manual acceptance checks until performed on actual devices.
