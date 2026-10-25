# Phase 4 verification — 24 October 2026

## Checks

| Check | Result |
| --- | --- |
| TypeScript: client, server, seed, tools and tests | Passed |
| ESLint | Passed |
| Unit/API tests | 37 passed; 34 integration tests intentionally skipped here |
| PostgreSQL integration tests | 34 passed separately; 3 suites |
| Edge browser workflows, including previous phases | 10 passed |
| Frontend/backend production builds | Passed |
| Prisma schema validation, migration deploy and status | Passed; 4 migrations, no pending changes |
| Prisma client generation | Full generation passed in isolated output; default output blocked by running-app DLL lock |
| Idempotent fictional hospital seed | Passed |
| npm dependency security audit | Passed; 0 vulnerabilities (all severities) |

Ordinary `npm test` intentionally skips the 34 database integration tests in 3 suites. All 34 passed separately with `npm run test:integration` against isolated `rcrt_test`. The 37 unit/API tests passed across 4 suites. All 10 Edge browser tests passed in a separate newly created database. No development database reset was performed. TypeScript, ESLint and the production builds were rerun after the verification changes.

## Inspection and matching scenarios

Reviewed medical validation/API, crew and operator UI, hospital discovery, matching, hospital seed/catalog, Prisma schema/migrations, authentication, public tracking, and Socket.IO publication/room authorization.

| Requested scenario | Automated evidence and result |
| --- | --- |
| A: 2 km lacks ICU/ventilator; 4 and 6 km meet ICU/ventilator/oxygen | Added exact-distance unit scenario. B and C are potential matches, B ranks first; A lists both missing essentials. Passed. |
| B: every hospital lacks essential ICU | Added isolated catalog unit scenario. Every result is REQUIREMENTS_NOT_MET with ICU missing. Passed. API noSuitable flag also tested with an unmodeled essential requirement. |
| C: essential availability changes to zero | Unit recomputation and real PostgreSQL update/refetch change results. Selection also rechecks current availability. Passed. |
| D: no ambulance position | API rejects search with 409; browser requires an explicit manual search origin. No fabricated origin or GPS overwrite. Passed. |
| E: required specialist not confirmed available | ON_CALL fails essential matching; algorithm accepts only AVAILABLE and therefore also excludes missing/UNKNOWN/UNAVAILABLE specialists. Unit test and code inspection. |

Essential compatibility precedes proximity. Preferred shortages remain LIMITED_RESOURCES. An emergency bed is always essential. Closed/inactive providers are UNAVAILABLE. Suitability is a recommendation, never hospital acceptance.

## Findings and targeted changes

1. **Browser tests shared the user's live demo fleet.** The first verification attempt timed out looking for DEMO-AMB-101 because it was unavailable in existing demo state. That run was interrupted after the failure. No existing assignment was cleared. Added `scripts/browser-test.ts` to create/migrate/seed an isolated randomly named database and start independent servers on 4100/5175. It drops only its own newly created database after Playwright exits. Tests now use the configured browser base URL for explicit request origins and protected-media requests. No previous assertion was removed or weakened. The final isolated run passed all 10 workflows.
2. **Coverage gaps.** Added 2 unit scenarios for the exact requested distances and all-ICU-shortage/resource-change cases. Added 2 PostgreSQL tests for negative/over-capacity constraints, multi-symptom persistence, assignment/case linkage, dynamic recommendation refresh, unauthorized assessment/selection writes and assessment audit history. All passed.
3. **Previously fixed local sign-in origin mismatch.** Reverified localhost/numeric-loopback acceptance plus rejection of other ports, lookalike hosts and absent origins. Frontend strict-port behavior and HTTP/socket origin checks remain in place. The patient account/password comparison was separately verified without printing credentials.
4. **Windows Prisma engine lock.** Default `npm run db:generate` returned EPERM while replacing the active engine DLL. Did not stop the user's application. Copied the unchanged schema to ignored `.local/verification-prisma/schema.prisma` with only a separate generator output, then ran full `prisma generate` successfully (v6.19.0). Stop the development app before regenerating its normal client. Database migration deployment/status and schema validation all passed independently.

No additional product defect was demonstrated by the final clinical/regression suites. This report verifies the tested critical Phase 4 workflows; it does not claim every possible state or physical device was manually tested.

## Phase 4 coverage

- Assigned arrived crews create/edit assessments; unrelated crews, patients, anonymous viewers, administrators and hospital users cannot read clinical records. Operators have read access and cannot edit.
- Unknown identity is accepted. Optional vitals remain null rather than being generated. Numeric constraints and version checks reject invalid/stale writes.
- Drafts survive refetch and browser refresh. Completion records a timestamp and advances the case to PATIENT_ASSESSED. Authorized updates persist equipment levels, specialist requirements and observations.
- Concurrent assessment saves with the same version produce one success and one conflict.
- Multiple symptoms, essential/preferred requirements, specialists and correct case/assignment linkage survive database refetch. Unauthorized writes are rejected. Completion/update audit actions and status history persist.
- PostgreSQL rejects negative available/total quantities and available values above capacity; failed writes leave the original resource unchanged.
- Five fictional hospital catalogs have resources and specialist availability. Repeat seeding preserves changed quantities and specialist statuses.
- Essential-compatible hospitals rank before nearer incompatible hospitals. Preferred shortages and LIMITED emergency departments remain distinct from missing essentials.
- ON_CALL/UNKNOWN specialists are not treated as confirmed availability. Unmodeled essential requirements produce a manual-coordination warning rather than fabricated compatibility.
- Matching uses the latest recorded ambulance location and the existing Haversine helper. Missing location requires an explicit staff-selected origin and does not overwrite GPS.
- Hospital cards, category/bed/equipment/specialty/distance filters, suitability/distance sorting, map markers and explanations are exercised in the browser.
- Preferred selection and changes persist with timestamps/history. Selection rechecks requirements and assessment version.
- Selecting a hospital leaves admission records, acceptance timestamps and resource reservations untouched; available quantities are unchanged.
- Assessment edits invalidate a prior selection. Selection/edit requests are rejected after admission has started.
- Medical/selection events go only to operators and the assigned crew, with ID/reference payloads and authorized API refetches. Patient/admin/anonymous/wrong-crew sockets do not receive those events.
- The operator receives selection changes without refresh and sees “Hospital Selected — Admission Not Yet Confirmed.”

## Regression coverage

Earlier tests cover authentication, session refresh rate limiting, Patient/Bystander SOS, unknown identity, coordinates, concurrent duplicate submissions, protected media, limited tracking, dispatch conflicts/acceptance/decline, reassignment, GPS watches, simulation controls, offline recovery, arrival and mobile reporting.

The synthetic microphone fixture now waits for several actual native MediaRecorder chunks and retains its AudioContext, rather than relying on a fixed short delay. Protected playback is checked in a foreground browser page. Empty recordings give a recoverable in-app error and never become mandatory for SOS.

Clinical and hospital filter controls have explicit accessible names. New medical browser tests block external map-tile requests to verify Leaflet overlays and fallback operation deterministically. Screenshots of the tablet assessment and hospital-discovery page were inspected; external road routing is not configured.

## Migration and files

`202610240003_assessment_matching` is additive:
- Extends PatientAssessment with assignment linkage, identification/condition/vital fields, draft/completed status, equipment-priority JSON, timestamps and optimistic version.
- Adds a unique assessment-per-assignment constraint and vital/status checks; existing columns/rows remain.
- Extends Hospital metadata and adds HospitalSpecialist availability records.
- Adds preferred-hospital/timestamp/version fields on EmergencyCase and HOSPITAL_SELECTED.
- Does not reserve resources or create admission requests.

Added:
- `server/src/medical/`: validation, deterministic matching, protected API and unit tests.
- `server/src/medical.integration.test.ts`: real database/privacy/event tests.
- `prisma/hospital-data.ts`: idempotent fictional catalog supplement.
- `client/src/pages/PatientAssessment.tsx`, `components/HospitalDiscovery.tsx`, medical types/styles and medical browser tests.
- `server/tsconfig.build.json`: excludes test-only imports from production output.

Extended existing crew/case interfaces, emergency metadata API, private Socket.IO delivery, schema/seed, integration runner and documentation. Integration suites run sequentially to avoid unrelated fixtures changing global dashboard statistics; explicit concurrent dispatch/assessment races remain tested.

## Environment and limits

Tests use workspace-local PostgreSQL 18 on loopback because Docker could not start earlier. PostgreSQL 17 Compose remains available but was not exercised here. Data persists in ignored `.local/postgres`; local credentials remain in ignored `.env`.

Location and microphone permissions are simulated in browser tests. Real MediaRecorder, playback, HTTP uploads, PostgreSQL persistence and sockets are exercised. Physical GPS/microphone hardware and all browsers/codecs need manual verification.

Resource availability is fictional and a snapshot. Matching is deterministic decision support, not diagnosis, triage or hospital acceptance. Straight-line distance and simulated ETA are labeled. Clinical judgment and real-service coordination are outside this demonstration.

Non-fatal upstream Zod annotation/bundle-size warnings and Prisma 6 configuration deprecation messages remain. The npm registry was reachable for this verification: `npm.cmd audit --json` exited 0 with an empty vulnerability list and zero info/low/moderate/high/critical findings. No dependency versions were changed. The audit is a point-in-time dependency check, not a complete security assessment.

The final browser runner creates and removes only its own randomly named database; existing development users, emergency records and fleet state are preserved. The earlier interrupted run against development created fictional browser reports; those were not used as a reason to reset or clear user data. Integration cleanup uses captured fixture IDs; catalog seed checks restore modified resource/specialist values and remove only catalog entries created by their suite.

## Automated versus manual verification and remaining limits

All counts above are automated checks. Browser automation uses real Edge, database sessions, native MediaRecorder, HTTP media upload/playback, sockets and persistence. Earlier Phase 4 tablet/discovery screenshots were inspected; this verification pass did not perform a new human-operated clinical workflow or physical GPS/microphone test.

Security coverage includes anonymous/role/assignment rejection, operator read-only behavior, strict clinical inputs, stale/concurrent writes, token expiry and limited public responses, protected media and private medical events. Public tracking never includes assessment objects. Assessment history currently records audit actions, version numbers and case status transitions; it does not store an immutable copy of every prior medical value. The role/crew checks and current snapshot should not be represented as a complete clinical revision archive.

Availability changes are reflected on a new search and revalidated at selection; displayed recommendations are snapshots, not resource reservations. Straight-line distance and simulated ETA are not road routing. Docker/PostgreSQL 17, other browsers/codecs, physical permissions/devices, deployment/HTTPS and external map-tile reliability were not exercised. The normal in-use Prisma client regeneration remains blocked by the DLL lock described above; the isolated generation check passed. No other requested automated check remains skipped or blocked beyond the intentional unit-run integration skips that passed separately.

Admission requests, hospital acceptance/rejection, resource reservations, emergency alarms and handover are not implemented. Phase 4 stops at preferred hospital selection; Phase 5 requires approval.
