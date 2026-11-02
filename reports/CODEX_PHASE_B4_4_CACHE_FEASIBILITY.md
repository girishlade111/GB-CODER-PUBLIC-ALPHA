# GB Coder — Phase B.4.4 Dependency Reuse Feasibility

Recommendation: **NEEDS_EXPERIMENT**.

The installed WebContainer API 1.6.4 has supported filesystem export and mount primitives suitable for investigating a project-scoped dependency artifact. It does not establish that an arbitrary installed dependency tree is portable, complete, consistent or faster to restore than reinstall. Keep the accepted clean-install architecture unchanged. Do not enable B.4.4 in Preview or Production on the strength of this inspection.

The most defensible first experiment is a **tab-memory, project-scoped, dependency-only FileSystemTree**, captured from a quiescent installation in a disposable producer runtime and restored into a different, newly booted runtime. Inspectable JSON-format trees should be the initial correctness oracle; evaluate binary representation separately only after correctness is established. This is filesystem data reuse, not reuse of a running container, process, filesystem handle or writable dependency directory.

This report is planning/source inspection only. No application source changes, dependency installation, export, snapshot generation, runtime boot, browser campaign, Git mutation, deployment, project-data operation, credential access or settings change was performed. Production remains **HOLD**.

## 1. Inspected identity and existing evidence

- Branch: `phase-2.2-webcontainer-reliability`.
- HEAD: `30804ea3e3f94814b46b7a9934fb477f91354615`; tracked working tree/index clean at inspection.
- Accepted Preview: [gb-coder-public-alpha-6l37qqpda.vercel.app](https://gb-coder-public-alpha-6l37qqpda.vercel.app).
- Installed `node_modules/@webcontainer/api/package.json`: **1.6.4**. The lockfile resolves 1.6.4; the application manifest declares `^1.6.4`, which is not an exact version pin. No package file was changed.
- Historical [deployed acceptance report](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/CODEX_PHASE_B4_DEPLOYED_PREVIEW_ACCEPTANCE.md>) and raw evidence were preserved. Its retained automation failures and separately completed retention check remain relevant qualifications; they were not rerun here.

Previously measured deployed timings, not new measurements:

| Fresh-runtime observation | npm completion hint | Boot | Source mount | Real Preview DOM |
| --- | ---: | ---: | ---: | ---: |
| React A | 41.604 s | 9.350 s | 8.786 s | 69.505 s |
| Vue B | 22.946 s | 9.895 s | 7.909 s | 49.333 s |
| Return to React A | 34.872 s | 2.833 s | 7.739 s | 56.249 s |

Confirmed: returning to A retires the previous runtime, creates another runtime and installs again. Installation occupies a substantial observed interval, but download, resolution, extraction and lifecycle-script contributions were not separately measured. Existing hint timings are not independently observed numeric npm exits. No cache/export/restore sizes, durations, memory costs or speedups have been measured. External transport failures remain an independent reliability risk.

## 2. Verified public API support and limitations

Version-specific installed declarations and implementation were the primary inspection evidence. Current official documentation was used to corroborate the public contract, not to assume an uninstalled feature exists.

| Capability | Verified support | Consequence |
| --- | --- | --- |
| Export a directory | `WebContainer.export(path)`; options support `json`, `binary`, `zip`, `includes`, `excludes` | A dependency subtree can be selected without exporting the whole project. JSON yields a FileSystemTree; other formats yield bytes. |
| Import filesystem data | `mount(FileSystemTree | Uint8Array | ArrayBuffer, {mountPoint?})` | JSON and binary exports are documented mount inputs. ZIP is not documented as a directly mountable export format. |
| Binary/file/link representation | FileSystemTree supports strings, Uint8Array contents and SymlinkNode targets | Avoid a hand-written UTF-8 copier. Binary files and `.bin` links must survive a real round trip. No explicit mode/uid/gid field exists in the public tree type. |
| Mount destination | Public `mountPoint`; target directory must already exist | Test export-root/mount-root semantics. Never assume a merge replaces all existing destination files. |
| Runtime replacement | Public `teardown()` then `boot()`; one concurrent instance | Old handles/processes cannot be retained as a reuse mechanism. New runtime ownership must be established. |
| Binary transfer | Installed `mount` transfers the payload's backing ArrayBuffer | Treat the passed buffer as consumed/detached. Clone retained bytes before each mount; a typed-array subarray can share the transferred backing buffer. |
| Export/mount cancellation and streaming | No AbortSignal or stream-based export/mount in the installed public signatures | A timed-out Promise is not proof that underlying work stopped. Budget full materialization/copies and handle late settlements. |
| Atomic/quiescent snapshot | No public filesystem freeze, transactional export or process checkpoint API found | A live, concurrently written dependency tree cannot be assumed consistent. |
| Persistent npm cache or shared volume | No public boot cache-directory/persistent-volume option found | `--prefer-offline` is not a cross-runtime persistence contract. |
| Exact hosted-engine version | No public engine build ID/pinning option in installed BootOptions | Client package version alone cannot prove engine/ABI compatibility. |

Public-contract corroboration: [WebContainer API reference](https://webcontainers.io/api#exportoptions), [filesystem and mount-point guide](https://webcontainers.io/guides/working-with-the-file-system). The guide also documents server-generated filesystem snapshots through `@webcontainer/snapshot`; that package is not installed here and is unnecessary for a first experiment using the installed API's own export method.

Installed references:

- [index.d.ts:55](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/node_modules/@webcontainer/api/dist/index.d.ts:55>): export overloads; mount at line 102; teardown/boot at lines 133/140; BootOptions at 148.
- [entities.d.ts:28](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/node_modules/@webcontainer/api/dist/entities.d.ts:28>): filesystem nodes; ExportOptions near the file's end.
- [index.js:102](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/node_modules/@webcontainer/api/dist/index.js:102>): public export implementation; mount transfer at 135. These observations explain costs, not permission to call private `_instance` or kernel APIs.
- [utils/file-system.js](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/node_modules/@webcontainer/api/dist/utils/file-system.js>): public tree conversion preserves binary/link representations but does not express all POSIX metadata. Plain JSON.stringify/parse of an exported tree is not a typed-array-preserving storage codec.

The official [version-support guide](https://webcontainers.io/guides/api-support) distinguishes the versioned client from the separately hosted runtime. Its policy page is dated January 2024; it supplies no durable snapshot-compatibility guarantee. Future experiments should obtain Node `process.versions`, platform/architecture and npm version through supported spawned processes. A new workdir can also differ, so absolute paths and installation-generated path references are a compatibility concern. Do not use undocumented engine fields or observed vendor asset filenames as authoritative compatibility identifiers.

## 3. Current architecture and relevant source locations

| Source | Existing behavior / potential future seam |
| --- | --- |
| [webcontainerService.ts:41](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/webcontainer/webcontainerService.ts:41>) | Full-input, order-stable dependency fingerprint. Its two noncryptographic hashes plus length are in-runtime invalidation tokens, not artifact integrity/authenticity keys. |
| [webcontainerService.ts:121](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/webcontainer/webcontainerService.ts:121>) | `filesToFileSystemTree` preserves/merges manifests, handles fallback metadata and adds `.bin/help`. Artifact restore must not replace current authoritative source or break the help command. |
| [webcontainerService.ts:322](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/webcontainer/webcontainerService.ts:322>) | Startup ownership, automatic-operation state, watchdog and installed-owner proof. Every future artifact await needs equivalent owner checks. |
| [webcontainerService.ts:694](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/webcontainer/webcontainerService.ts:694>) | Retirement clears operation/proof, increments generation, removes listeners/shell and tears down the instance. Preserve this invariant. |
| [webcontainerService.ts:979](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/webcontainer/webcontainerService.ts:979>) | Genuine server-ready accepts an owned install completion and records proof. Restored dependencies currently have no separate proof pathway. |
| [webcontainerService.ts:1209](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/webcontainer/webcontainerService.ts:1209>) | Boot and pending-retirement serialization. No persistent dependency volume is configured. |
| [webcontainerService.ts:1342](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/webcontainer/webcontainerService.ts:1342>) | Source mounting is serialized behind a file-sync barrier and scope guards. Effective `.npmrc` is subsequently written from `OPTIMIZED_NPMRC`; input hashing alone must not ignore this effective configuration. |
| [webcontainerService.ts:1464](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/webcontainer/webcontainerService.ts:1464>) | Same-runtime proof/presence checks; installation decision at 1517; proof creation at 1596. Proof reuse checks project/generation/instance and deliberately permits the same runtime across a session restart. |
| [TerminalTab.tsx:235](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/components/Console/TerminalTab.tsx:235>) | One owner-bound automatic dispatch: `npm install --prefer-offline && npm run dev`, or dev-only for already verified same-runtime dependencies. No quiet capture barrier separates npm and Vite. |
| [fileSyncCoordinator.ts](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/webcontainer/fileSyncCoordinator.ts>) | Existing write barriers and cancellation must remain effective. |
| [startupDiagnostics.ts](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/webcontainer/startupDiagnostics.ts>), [startupOutput.ts](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/webcontainer/startupOutput.ts>) | Bounded privacy contract and inferred output classification; an artifact is not an npm exit result. |

Protect unchanged [projectDatabase.ts:59](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/projects/projectDatabase.ts:59>), [vscodeWorkspaceStore.ts](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/vscodeWorkspaceStore.ts>), [backupExportService.ts](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/backup/backupExportService.ts>) and [backupRestoreService.ts](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/src/services/backup/backupRestoreService.ts>). Dependency artifacts must never enter projectFiles, workspace persistence or backups. No schema change is needed for a tab-memory experiment.

Important eligibility constraint: the existing [React/Vue browser fixtures](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/scripts/helpers/b4-fixtures.mjs>) use version ranges and do not include a source package-lock. A proposed locked-project experiment cannot claim those exact fixtures are immediately eligible. Freezing a generated lock only inside a cache could change the resolution behavior of a lockless project. Use separately approved locked synthetic fixtures; do not silently add a lock to owner projects or change their semantics.

## 4. Architecture comparison

Memory retention and filesystem restoration are different dimensions: a project-scoped in-memory artifact still needs a supported mechanism to restore its data into a fresh runtime.

| Option | Correctness/isolation and complexity | Performance opportunity — hypothesis only | Memory/storage and recovery | Tests and rollback |
| --- | --- | --- | --- | --- |
| Current clean install | Lowest new complexity; accepted fresh-runtime isolation. Continues existing network/lifecycle uncertainty. | No additional saving; preserves reference behavior. | No application dependency artifact retained. Existing failure/unknown handling. | Retain B.4 suites and real DOM checks; this is the rollback target. |
| Verified same-runtime reuse | Already implemented; low risk when exact instance/project/input proof remains valid. Does not solve A → B → A retirement. | Avoids redundant install during reconnect or eligible restart. | No extra artifact copy; existing runtime remains allocated only while owned. Proof loss means normal decision path. | Reconnect, input/config change and replaced-instance invalidation; leave existing behavior unchanged. |
| Project-scoped memory artifact | Medium/high: new keys, budgets, lifecycle, capture consistency and restore proof. No live runtime retained. | Could remove repeated install on a later same-project fresh runtime. Capture and validation may erase the benefit. | Extra full dependency data per retained project; lost on reload. Evict/miss before dispatch selects baseline. | Owner/digest/corruption/eviction/race tests; disable candidate path and clear private map. |
| Dependency-only export/mount into a fresh runtime | Supported primitives; portability of a particular dependency tree is unverified. JSON is inspectable but allocation-heavy; binary needs transfer-copy and stronger validation design. | Could replace network/resolution/extraction work with copying, hashing and mounting. | Destination receives independent files; no shared writable node_modules. Partial restore is not transactional. | Exact binary/link/path round trip, package execution and DOM/HMR; discard contaminated runtime on restore failure. |
| Locked `npm ci` / configuration investigation | Public npm alternative, not a snapshot or an automatic speed optimization. Changing dispatch requires separate approval. | May improve determinism; faster execution is unproven. `npm ci` removes existing node_modules, so it defeats a restored-directory skip strategy. | Still installs into each new runtime. Lock mismatch fails rather than silently updating. | Actual runtime npm version, matching flags/locks, script behavior and fixtures; revert dispatch only after approval. |
| Project-scoped npm tarball-cache export | Generic file APIs might copy a configured project-local cache, but no WebContainer-specific durable-cache contract exists. Defer. | Could reduce fetching; still pays install, validation, extraction and scripts. | Potentially large/opaque cache; registry metadata may be sensitive. Must locate it through supported npm configuration, not assume a host path. | Cache integrity/miss, privacy, clean-runtime tests; remove only disposable artifact references, retain baseline. |
| Server/build-generated template snapshot | Documented snapshot tooling, but introduces artifact provenance, hosting, dependency and release work. Not the minimal local experiment. | Could accelerate standardized public templates. | Hosted copies/download cost and access controls. Host Windows/native node_modules are not presumed WebContainer-compatible. | Reproduce inside target runtime, verify provenance/ABI/scripts; disable template artifact. Separate approval required. |

Official npm references: [npm ci](https://docs.npmjs.com/cli/v10/commands/npm-ci/), [npm cache](https://docs.npmjs.com/cli/v10/commands/npm-cache/), [prefer-offline configuration](https://docs.npmjs.com/cli/v11/using-npm/config/#prefer-offline). These describe npm behavior, not the unmeasured version inside this application's WebContainer. In particular, missing cache content can still require network requests; npm's cache is not a reliable persistent data store. No command or cache inspection inside a runtime was executed for this report.

**Prohibited designs:** keeping A's live runtime for B, keeping multiple live project runtimes, shared writable node_modules, global cross-project content-key hits, retaining old fs/process handles, or bypassing retirement/proof invalidation. A dependency graph match does not make project-specific code, environment, server ports, listeners, buffers or mutated package files safe to share. The public API also permits only one concurrent runtime. An immutable byte/tree artifact copied into a new owner is conceptually different, but still requires the safeguards below.

## 5. Proposed artifact contract and safeguards

These are proposed requirements, not implemented guarantees.

**Eligibility first.** Restrict an initial experiment to approved, public, locked React/Vue synthetic fixtures. Exclude private registry/auth configuration, workspaces, `file:`/`link:` dependencies, external symlinks, arbitrary install scripts, native/ABI-sensitive packages not explicitly tested, and install outputs outside node_modules. Review transitive lifecycle scripts and generated outputs; absence of a root postinstall script is insufficient. Root scripts can depend on project source or environment, so source-independent dependency reuse is not generally valid. No user-edited dependency tree or post-manual-install tree may become a trusted capture.

**Strong key.** Use SHA-256 over canonical, length-delimited complete inputs, not the existing fast fingerprint: exact effective manifest after dependency merging; authoritative root lock and lock format; extra dependency map/project type; effective npmrc/policy and install flags; relevant allowlisted environment affecting dependency selection; resolved client/API version; observed Node/V8/module ABI/platform/architecture and npm version; artifact schema/format and capture policy version. Reject conflicting/missing lock metadata. Keep registry/auth-sensitive bytes out of reports; hashing configuration is not a substitute for excluding secrets/private projects from the prototype.

**Two ownership concepts.** Cache lookup must include the same origin/application session, project incarnation and authorization context, never merely the dependency digest. Producer epoch/generation/instance are provenance; requiring the consumer to have the producer's generation would prevent fresh-runtime reuse. Instead capture a new consumer StartupOwner, recheck it around every await, and bind any new validated-restoration proof to that consumer's project/epoch/generation/instance. Do not restore the producer's installedOwner or call recordInstallComplete merely because bytes mounted. The existing server-ready path does not automatically create proof for an imported artifact; an explicit restore-validation state/proof design would need separate implementation approval.

**Integrity and data boundaries.** Keep a full per-entry inventory of type, canonical relative path, binary byte length/hash and exact symlink target, plus a digest of the complete payload/descriptor. Preserve `.bin` and required hidden npm metadata; do not indiscriminately strip hidden files. Reject absolute paths, traversal, NUL/backslashes, dangerous object keys, duplicate/ambiguous paths, escaping/chained symlinks and unsupported file types/metadata. Verify link targets remain inside the isolated dependency tree. SHA-256 detects changed bytes but does not authenticate malicious packages, certify lockfile tarball integrity after extraction, or remove secrets copied into dependencies by install scripts. Public trusted fixtures and a private artifact map are the initial security boundary.

**No source overwrite.** Mount authoritative project data from its current project store independently. Restore only to an empty, owned dependency destination and verify export-root/mountPoint behavior. Handle the existing `.bin/help` stub explicitly; do not accidentally overwrite it with a foreign helper or preserve stale extra destination files. Validate package resolution, binary files, links and executable behavior before running dev-only. Source and IndexedDB digests must remain exact before/after restoration.

**Runtime compatibility.** Public node/npm information can narrow compatibility but cannot identify every hosted-engine change. Confine initial reuse to a short, single-page session under one resolved client version and perform consumer-side probes. A matching Node version alone does not prove executable-mode, native module, absolute-path or binary-format compatibility. If stronger compatibility cannot be established, declare a miss/ineligible project. Do not retain artifacts across reloads or vendor/client upgrades in the prototype.

**Privacy/lifetime.** Keep artifact contents in an unexposed module closure. No IndexedDB, sessionStorage/localStorage, Cache Storage, service-worker cache, backup, upload, analytics, screenshot or trace payload may hold dependency artifacts. Node_modules can contain project/private/generated material; a directory name is not a privacy guarantee. Evict on project deletion/restoration/import replacement, logout/account change, relevant source/config changes, TTL expiry and incompatible policy/version. A restored project reusing an ID must receive a new incarnation, without a project-schema migration. Page closure/reload naturally loses the memory map.

## 6. Capture, restoration and fallback protocol

1. Before install dispatch, decide eligibility and artifact availability. A missing/stale/digest-invalid/evicted artifact is a **cache miss**, selecting exactly one ordinary clean-install startup; it is not an installation retry.
2. For an experiment producer, install with the public process API and observe its actual numeric exit. Require zero plus a reviewed, quiescent dependency tree before export. The prototype may use a standalone harness for this; it must not silently replace the application's interactive jsh architecture.
3. Capture while the producer is still owned and usable. Complete/hash/validate before publishing an artifact. Late exports after ownership change or retirement are discarded and their promises handled. Do not delay every project switch indefinitely to capture.
4. A production integration has an unresolved seam: current `npm install && npm run dev` starts Vite immediately. Server-ready plus an npm output hint does not prove a quiet tree for export, and file-sync barriers do not stop npm/Vite writes. Neither background export during HMR nor a timeout is an atomic checkpoint. A supported capture barrier preserving terminal behavior must be designed and separately approved before application integration.
5. Retire the producer using the existing public path. Boot a distinct consumer. Check key, owner, payload digest, required metadata and destination before mutation. For binary data, clone retained bytes because mount transfers them; for trees preserve typed arrays rather than stringify/parse them into plain objects.
6. Mount once, validate independently, run one dev-server command and require a genuine owned server-ready event plus correct real DOM. Rebind proof only after the designated restore validation succeeds. No fabricated npm completion or numeric exit is permitted for a restore.
7. Capture failure merely means no artifact; the normal successfully installed producer may continue. On a read-only export timeout, ignore/discard late results; do not assume the operation was cancelled or publish a late artifact after Vite starts.
8. **A failed/partial mount or post-restore validation is different from a miss.** No transactional rollback is documented. Quarantine the artifact and fail closed; do not automatically run npm over a partly restored tree or reboot/retry in a loop. Preserve evidence and let the existing explicit reopen path create a clean runtime for a later baseline startup. Any automatic fresh-runtime recovery would require separate approval and is not recommended for the initial prototype.
9. A failed npm process or dev startup remains a failure. No automatic retry, recapture or successful replacement sample. Corruption testing must never affect authoritative project data.

## 7. Costs, limits and performance decision

Let C be retained payload bytes, U the expanded dependency tree, and E export/serialization overhead. A binary restore may transiently need retained C + another C for transfer + consumer U, in addition to engine memory and any other project's retained artifact. JSON export can materialize an internal representation, strings, typed arrays and serialized mount payloads; overhead is unmeasured and can exceed file byte totals. Running JSON and binary export together doubles some work and is not a free validation technique.

Capture pays filesystem traversal, serialization and hashing; restore pays key/runtime probes, cloning, transport, mount, full inventory validation and startup. No public streaming export, hard per-operation allocation limit or guaranteed compression ratio was found. Dropping references does not force immediate garbage collection, and out-of-memory termination is not always catchable. Browser storage-quota APIs do not define tab-heap capacity; an in-memory map avoids persistent quotas but not memory pressure. Do not request persistent storage permission for this experiment.

Proposed conservative experiment policy, requiring owner acceptance: at most **two** project artifacts, **32 MiB of accounted payload/inventory per artifact**, **64 MiB retained payload/inventory total**, **10-minute TTL**, one capture/restore at a time; count every retained representation and byte buffer. For binary payloads use byteLength; for trees define conservative typed-file/path/inventory accounting before admission rather than treating plain JSON.stringify as a lossless codec or a heap measurement. Bound inventory to 20,000 entries/depth 64. These are admission limits, not guarantees about object overhead or total browser memory. Use a provisional **128 MiB incremental memory ceiling** where a whole-browser measurement is available; record measurement coverage. JS heap alone excludes important worker/Wasm/native memory. If a fixture exceeds caps, record it as ineligible rather than silently raising limits. LRU evicts only artifacts; never project source. Do not evict a retained source while its copy is being consumed without a well-defined reference lifecycle.

For N later restores, evaluate measured net benefit as avoided repeated-install time minus lookup/hash/copy/mount/validation/startup differences, minus the initial capture/hash cost. Charge capture to the first-use lifecycle. Report both first-start and A → B → A totals; a faster final A does not alone justify slower overall navigation. Break-even is unknown. Existing npm flags already disable audit/funding/progress and prefer cached content; their source comments contain claimed savings that were not independently established here.

## 8. Ranked recommendation and minimal proposed experiment

1. **Retain accepted behavior and same-runtime reuse now.** No engineering change is approved by this report.
2. **Request a standalone local JSON dependency-artifact feasibility gate.** It is inspectable, uses installed public APIs, introduces no dependency, and can disprove portability before product integration.
3. **Only if correctness passes, evaluate binary representation** with a validated inventory, copy-on-mount handling and explicit admission budgets. Opaque bytes and presumed metadata preservation are not a general safety argument.
4. **Only after measured benefit and a supported quiet capture/proof design**, propose an opt-in application integration that preserves jsh, retirement, ownership and storage contracts. Feature stays off by default until separately accepted.
5. Defer npm-cache copying, host/server snapshots, lockless reuse and arbitrary project support. No cross-project live-runtime/shared-node_modules alternative is acceptable.

Proposed stages, none executed:

| Stage | Scope / proposed budget | Exit condition |
| --- | --- | --- |
| 0 — offline policy tests | Standalone harness design and mocked owner/key/path/typed-array/budget tests; **0 boots** | Invalid, mutated, cross-owner and late artifacts rejected; tests do not require private vendor APIs. |
| 1 — minimal feasibility gate | **4 sequential startup observations**, one local Chromium environment/context: clean locked React A producer → clean locked Vue B producer → fresh React A JSON consumer → fresh Vue B JSON consumer. Capture before Vite in producers; real DOM on all four. Up to 2 reconnect controls with no new boots. **240 s per observation, 20 min campaign cap**; proposed capture observation ceiling 10 s and restore/validation ceiling 15 s within that budget. | Exact bytes/links/commands, fresh instances, no cross-project paths or duplicate installs, valid proof design and bounded memory. Stop at the first required failure; no retries/replacement samples. Timeout is not cancellation. |
| 2 — optional measurement, separately authorized | Only after Stage 1: **14 fresh-runtime observations**: 2 artifact producers with capture cost recorded, then 3 reference clean starts + 3 restores per framework (12 timed samples), counterbalanced. **240 s each, 60 min wall cap**. Binary trials require a separately approved allocation, not hidden extra observations. | Estimate benefit/variance and first-use break-even, not reliability guarantees. Preserve failed samples and distinguish fresh runtime from cold browser/provider caches. |
| 3 — application integration proposal | New approval checkpoint; exact source/test scope and quiet capture/restore-proof state machine first | No implementation follows automatically from the feasibility result. |

Initial approval should cover **Stage 0/1 only**. The proposed initial gate has four boots, not a repeat of the full reliability audit. Historical three-start timings are context, not interchangeable clean controls. If capture cannot be made quiescent, dependencies are incompatible, or admission limits exclude representative fixtures, stop with a negative or inconclusive result; do not spend a larger campaign to seek favorable outcomes.

## 9. Required tests, success/failure criteria and rollback

Required correctness protections:

- Export/mount root semantics; missing destination; full binary byte equality, `.bin` symlinks and executable behavior; repeated use of the same artifact without transferred-buffer loss; required package metadata and hidden files.
- Complete manifest/lock tail changes, effective npmrc/flags, merged dependencies, install policy, client/runtime observations and source-sensitive scripts invalidate eligibility/key. Cache payload mutation, wrong project/incarnation, account changes and forged metadata cannot hit.
- A → B → A freshness; B cannot observe A's files or edits; mutating one restored tree cannot mutate the stored artifact or the next consumer. Stale export/mount/hash callbacks, rejected promises and retired shell output cannot affect replacement state or proof.
- No artifact becomes proof from directory presence alone. No stale proof, duplicate command, false installed success, automatic retry or swallowed install/restore failure. Reconnect preserves the current shell; manual terminal input remains usable.
- Missing/expired/evicted/oversized artifacts use the baseline before dispatch. Corrupt/partial restores stop safely. Deletion/import/backup restore invalidates project incarnation while source, IndexedDB schemas and backup contents remain untouched.
- Retain B.4 startup/output/diagnostic/exit tests plus existing runtime isolation, file/rename/binary, Static Editor, HMR and backup regressions appropriate to any later integration. None were rerun for this planning task.

Proposed advancement thresholds, owner-adjustable before measurement: all correctness/security tests pass with zero ownership leakage or uncaught cancellation errors; both fixtures fit agreed memory/time caps; no failed required observation; later Stage 2 shows median warm real-DOM savings of at least **20% and 10 seconds per framework**, with capture break-even within **two** restores and first-use capture overhead no more than **10% or 5 seconds, whichever is smaller**. These are decision criteria, not predicted results or statistically strong reliability thresholds. Report all timing data and variability; a small sample cannot establish improved network reliability. If benefit only occurs after excluding necessary validation or ignoring capture cost, fail the performance gate.

Rollback is deliberately simple: keep the candidate disabled, drop tab-memory references and select the unchanged clean-install path on a later clean startup. After partial mount, retire that disposable consumer; never restore user source from an artifact or retain its runtime. No database migration, backup conversion, server artifact cleanup, credential change or deployment should be needed to abandon the local experiment.

## 10. Explicit owner decisions and final recommendation

Separate approval is required before creating/executing a prototype or making source changes. The approval should specify:

1. Stage 0/1 only versus any larger measurement budget; four startup observations, time caps, stop-on-failure and no replacement/retry policy.
2. Synthetic locked public fixtures, exclusion of private/lockless/workspace/script-dependent projects, and whether fixture lock generation is authorized in disposable data only.
3. JSON-first representation, memory/TTL/admission limits and permissible memory instrumentation; no persistence or new dependencies.
4. Standalone use of public npm process handles for a quiet capture experiment. This is not approval to replace the product's interactive shell or alter its dispatch architecture.
5. Fail-closed restoration with user-initiated clean reopen; no automatic install/reboot retry. Agree on performance thresholds before observing results.
6. A later independent decision on binary trials, application capture/proof integration, commits, publication or release. None is implied by a successful artifact round trip.

**Final recommendation: NEEDS_EXPERIMENT** for the narrowly scoped filesystem-data approach. **NO_GO for production caching or general project reuse now.** Public API support is sufficient to justify a controlled feasibility experiment, but portability, consistency, eligibility coverage, first-use cost, peak memory and useful speedup remain unverified. Production remains **HOLD**. Stop after this report and await explicit owner approval for any experiment or implementation.
