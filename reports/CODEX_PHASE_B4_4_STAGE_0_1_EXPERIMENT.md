# GB Coder — Phase B.4.4 Stage 0/1 Experiment

Verdict: **B4_4_STAGE_1_NOT_FEASIBLE**.

The first React producer's JSON dependency tree exceeded the approved **32 MiB accounted payload/inventory limit** during validation. The artifact was rejected before admission. The campaign stopped immediately: **one boot, one failed observation, three observations not run, no retries**. This is a negative feasibility result for the chosen fixtures, representation and admission policy. It is **not** evidence that the public export/mount API is generally incapable of cross-runtime restoration; restoration was never reached.

Stage 0 passed **41/41** offline policy tests. The producer's actual npm process exited **0**, and public JSON export returned in **1,021.835 ms**. Installation success did not become artifact success or Preview readiness. No artifact was published, no dev server started, and no installed proof was created.

Production remains **HOLD**. No application caching, product source change, commit, push or deployment occurred.

## 1. Scope and exact identity

This was the authorized standalone local JSON FileSystemTree experiment, not GB Coder's application startup path. It used only the installed WebContainer 1.6.4 public boot, mount, export, filesystem, process and teardown interfaces. There was no product-service import, interactive jsh replacement, binary snapshot optimization, new repository dependency or persistent dependency cache.

- Git branch/HEAD: `phase-2.2-webcontainer-reliability` / `30804ea3e3f94814b46b7a9934fb477f91354615`.
- Browser: Chromium `151.0.7922.34`, one disposable context/environment, local origin `http://127.0.0.1:42997`, COOP same-origin / COEP require-corp. The standalone page was cross-origin isolated.
- Campaign start/end: **2026-10-15T11:07:58.662Z → 11:08:23.591Z**, **24.929 seconds**, including failure handling/cleanup.
- First observation elapsed to failure: **23.499 seconds**, below its 240-second limit. The campaign did not consume its 20-minute ceiling.
- Capture failed by admission policy, not its 10-second timeout. No restore operation or 15-second restore deadline was exercised. No reconnect controls were used.
- The approved product build was not rebuilt. Its build-manifest SHA-256 remains `cdaacfc70ef93643ea70ef5732bedc97fdeae7d7b7390f362bf0d48afa2ae136`.

Executed harness identities:

| File | SHA-256 |
| --- | --- |
| policy.mjs | `26fd0f1e97e7587719e873a48ef56fe6cede208e37bf148b6b5d223366cb0292` |
| browser.mjs | `fe725e8e63f3d4d44a158a8c0ba9fc375834ef9bc0aee71417e384f56bfabe3a` |
| run.mjs | `475317ab510a6722c6b00cc12281104fc2e357fbb1b1bc814cdff8f6470a011b` |
| fixtures.json | `b20447d0a8b754938271826e3d75150d0db49d2c38bf924b35d70d44036e683a` |

These files are under [scripts/.tmp-b4-4](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/scripts/.tmp-b4-4>). The raw ledger records the generated browser-bundle hash and every fixture manifest/lock hash. The Stage 0 script hash is in the derived summary. Temporary-harness syntax issues were corrected during preparation before the single browser campaign; they involved no additional runtime boot. No failed browser observation was replaced.

## 2. Synthetic fixtures and lifecycle/native-tooling policy

Both fixtures were frozen before the campaign. They contain pinned public packages and complete npm lockfileVersion 3 files, generated only in the disposable fixture directories. Lock generation used package-lock-only mode, disabled scripts, public registry selection, empty isolated npm configuration and temporary resolution metadata that was subsequently removed. It installed no host fixture node_modules and changed no repository manifest or lockfile.

| Fixture | Root dependencies | Dev dependency | Locked package entries | Manifest SHA-256 | Lock SHA-256 |
| --- | --- | --- | ---: | --- | --- |
| React A | react 18.3.1; react-dom 18.3.1 | vite 5.4.21 | 64 | `270a46f542ce8b01523fda3f5bd7333ad28734446815c0750c980f9162503570` | `2d49b9349752521c344fe0d5091f46eabfd4718c7f6c52f3df92fdf6b8f61734` |
| Vue B | vue 3.5.13 | vite 5.4.21 | 78 | `82bb171c0deb4422bf7a259b2497127d06f8213fa25bec2fcfd464e53e404b7a` | `e0a32ce64578f02feea91775c0b9d56b8cae869dd41424e1b096954fa8d9bedb` |

React uses createElement and Vue uses a render function, so no JSX/SFC plugin was added. The intended DOM markers were `B44_REACT_A` and `B44_VUE_B`. Project-specific source sentinel files distinguish A from B.

All non-root lock entries were checked for public registry URLs, integrity metadata and absence of linked/local dependencies. No workspace, private registry, credential or real user project was used. Lock entries marked with lifecycle scripts were esbuild 0.21.5 and optional fsevents 2.3.3. **All lifecycle execution was disabled**, including npm fetch retries set to zero. Esbuild's installed 0.21.5 installer was inspected; its binary-download/install fallback was not permitted to execute in this experiment. fsevents is optional Darwin tooling; the observed runtime was Linux.

The explicit platform-sensitive-tooling justification was limited to Vite's esbuild/rollup helpers: installation occurs inside WebContainer, never by copying host node_modules, and any consumer would have required matching compatibility observations plus actual package/bin/server execution. No arbitrary native addon was admitted. Because the campaign stopped before Vite execution, this justification did not become a successful binary-compatibility finding.

The effective npm configuration explicitly selected the public registry and disabled scripts, audit, funding, progress, update notices and fetch retries. Empty synthetic user/global npmrc files were used. The controlled install was:

```text
npm ci --ignore-scripts --no-audit --no-fund --fetch-retries=0
```

This fixture/script policy differs from the accepted application's usual installation flow. Its install timing must not be compared as an optimization of the product's historical timings.

## 3. Stage 0 policy results

**41 PASS, 0 FAIL**, with zero WebContainer boots. Full named cases are retained in [b4-4-stage0.json](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-4-stage0.json>).

Coverage includes:

- Canonical SHA-256 key stability; changes to complete manifest/lock/config digests, flags, runtime/API/policy, project and incarnation invalidate the key. A same-length lockfile-tail change is detected.
- Typed-array bytes and internal `.bin` link inventory; corruption changes the digest; clones do not share the retained binary bytes.
- Rejection of absolute/traversal/backslash/drive/unsafe object keys, custom prototypes, accessors, inherited file contents, dangling/escaping/cyclic symlinks and invalid byte representations.
- Entry, depth and per-artifact admission bounds; two-artifact LRU behavior and quarantine.
- Missing/stale artifacts select a clean reference before restore; wrong-owner/quarantined records fail closed; corrupted payloads fail validation before mount.
- Fresh consumer generations may look up the same project's artifact, but late producer publication is rejected when epoch, generation or instance changes. An artifact's presence is not installed proof.
- Timed-out operations' late fulfillment/rejection is consumed without publication; no assumption of underlying cancellation.

These are offline policy tests against the standalone policy module. They are not browser proof of restored dependency execution or GB Coder product integration.

## 4. Stage 1 observation ledger

| Authorized observation | Result | Actual execution |
| --- | --- | --- |
| 1. Fresh React A producer | **FAIL / INELIGIBLE** | Fresh runtime booted; source/config hashes checked; clean npm exited 0; JSON export returned; first inventory exceeded 32 MiB accounting limit. Stopped before capture admission and DOM. |
| 2. Fresh Vue B producer | **NOT RUN** | Required stop after observation 1. |
| 3. Fresh React A consumer | **NOT RUN** | No admitted artifact; no restore or additional boot. |
| 4. Fresh Vue B consumer | **NOT RUN** | Required stop; no restore or additional boot. |

Exactly **one WebContainer.boot invocation and one runtime instance** were recorded. The runtime was retired through public teardown during cleanup. Browser, context and local server were closed. The final private artifact map contained zero artifacts / zero retained accounted bytes. No repeated installation, fallback consumer, hidden startup, replacement sample or retry occurred.

Observed producer compatibility:

| Field | Value |
| --- | --- |
| API | 1.6.4 |
| Node | 22.22.3 |
| npm | 10.8.2 |
| Platform / architecture | linux / x64 |
| Node module ABI / N-API | 127 / 10 |
| V8 | 12.4.254.21-node.56 |
| Workdir | /home/gb-b4-4-react |
| Additional Node versions field | webcontainer=2ed8f36d |

The last field was observed through ordinary spawned Node code, not private SDK/kernel access. It is a provider-specific observation, not a public engine-version pinning guarantee. No consumer compatibility comparison occurred.

## 5. Costs and exact failure

| Measurement | Actual result |
| --- | --- |
| Public boot | 11,032.725 ms |
| Node compatibility command | exit 0; 652 ms |
| npm version command | exit 0; 1,095 ms |
| Clean installation | **exit 0; 5,914 ms**; output reported 14 packages added |
| Synthetic internal-symlink creation | exit 0; 577 ms |
| JSON node_modules export | returned in **1,021.835 ms** |
| Complete SHA-256 inventory validation | **did not finish**; admission guard threw |
| Accounted size | **strictly greater than 33,554,432 bytes** at rejection; exact counter was not captured |
| Full file-byte total / full entry count | **not measured to completion** |
| Lossless JSON serialization size/cost | **not reached** |
| Second inventory/stability export | **not reached** |
| Mount/restore/consumer validation | **not run** |
| Vite execution/server-ready/real DOM | **not run** |

Exact failure: `Error: Artifact byte admission limit`, thrown by the first inventory traversal in the capture phase. The host received the failure approximately 1.206 seconds after the capture-before checkpoint; that interval includes validation and automation transport, and is not a completed capture/validation timing.

Accounting counted UTF-16 storage for string contents, byteLength for typed-array contents, encoded inventory metadata and a 128-byte per-entry allowance. Thus the finding is about **accounted retained payload/inventory**, not a demonstrated 32 MiB raw export, serialized JSON size, browser quota exception or OS-memory measurement. The validator did not record its exact partial counter, entry count or last file before throwing. Those values cannot be recovered from the saved evidence because the dependency tree was deliberately never persisted. No exact full-size number is invented.

This instrumentation limitation does not negate the observed admission failure, but prevents attributing it to a particular package, determining the raw-size/accounting ratio, or claiming a specific memory saving. The allowance and accounting rules were not relaxed after failure.

## 6. Binary, symlink and capture-consistency findings

- Offline typed-array, symlink and mutation/corruption tests passed.
- In the producer, a deterministic 1,024-byte probe spanning byte values 0–255 was written inside node_modules and a relative internal link to it was created by a successful controlled Node process. These were disposable dependency-tree test probes, not user source.
- Full browser inventory validation failed before the subsequent complete probe/bin/hidden-metadata assertions and before a second stable-tree comparison. **Complete browser binary integrity and symlink integrity are therefore unverified.**
- Export-root versus mountPoint behavior, executable modes, actual `.bin/vite` behavior and repeated independent mounts remain unverified. JSON export returning is not a successful export/mount round trip.
- Before export, npm and every other tracked controlled process had exited 0; lifecycle scripts were disabled, no Vite process had started, and the explicit probe writes were complete. These support the intended quiet-capture setup. The planned consecutive matching inventories did not complete, so no full stability certificate is claimed.

## 7. Ownership, security and memory coverage

The producer had project A / incarnation synthetic-react-1 / epoch 1 / generation 1 / runtime ID 1. Manifest, complete root lock and effective npmrc hashes matched the frozen fixture before install; source and root lock were checked again after install. The cache key included those digests, exact flags, project/incarnation, API and runtime observations. It was `45e71327b503fd2b8f67b218fb5da0e484acb745668c6b35ed1c9ad9b4530d4d`.

No artifact reached the publication step. Proof remained **false**, there were zero dev-server dispatches, and no readiness was fabricated from a directory, npm output hint or export return. There was no consumer to inherit stale proof or demonstrate cross-project contamination. Offline owner tests passed; runtime cross-project isolation remains unexercised by this campaign.

The exported tree existed only in the page's transient memory during validation. The harness's persistent evidence contains hashes, metadata, timings and controlled process output, not the exported FileSystemTree or dependency file bytes. No artifact was written to IndexedDB, localStorage, sessionStorage, Cache Storage, a Service Worker cache, a source file, a backup or a server. No auth/credential configuration or private package access was used. Public runtime implementation internals were not modified.

Admission policy remained: two artifacts, 32 MiB each, 64 MiB total, 10-minute TTL, 20,000 entries, depth 64. Only the per-artifact byte admission boundary was reached. No admitted retained data survived cleanup.

Measured memory checkpoints, using Chromium's precise-memory flag:

| Checkpoint | Page JS heap |
| --- | ---: |
| Before boot | 1,883,958 bytes |
| Before export/capture | 8,265,263 bytes |

These two checkpoints cover boot/source/setup overhead, **not measured artifact overhead**. Because capture failed before its post-capture checkpoint, neither capture heap delta nor peak allocation was obtained. The provisional 128 MiB incremental ceiling was therefore not demonstrated as met or exceeded. `performance.memory.usedJSHeapSize` is only partial coverage: it does not establish whole-browser worker/Wasm/native/backing-store memory, and checkpoint sampling is not a peak measurement. No out-of-memory or storage-quota exception was observed. Materializing an export precedes admission, so the policy is not a hard allocation-prevention mechanism.

Captured browser console errors, uncaught page errors, failed network requests and HTTP error responses were all **zero**. The policy exception propagated to the controlling page.evaluate call and was recorded as the required experiment failure; it was not an uncaught application pageerror. Browser network capture does not prove complete visibility into every provider-internal npm transport operation.

## 8. Clean-install versus restored-start observations

Only the clean npm interval of the first synthetic producer is available. No producer reached Vite/DOM and no restored consumer started. Therefore there is **no** clean-versus-restored startup comparison, break-even estimate, speedup percentage or reliability conclusion.

The 5.914-second installation must not be substituted for prior product timings: package selection, lockfiles, scripts, flags and environment differ. The Stage 1 objective was safe portability; that objective was blocked by admission before restoration.

## 9. Stage 2 and remaining limitations

**Stage 2 benchmarking is not justified yet.** The representative first fixture is ineligible under the agreed JSON accounting cap, and no consumer round trip passed. Larger benchmarking would not resolve that prerequisite.

A separately authorized diagnostic proposal could improve failure evidence by recording the partial accounting counter, entry/path/type and post-failure memory checkpoints before rejection. Any new producer observation would need a new explicit startup budget. Selecting a different fixture/representation, changing accounting or raising a limit would be a policy change requiring owner approval. Do not trim required dependency files, introduce binary optimization, rerun the failed observation or widen the budget to obtain a favorable result under this authorization.

Remaining unknowns include full artifact size/composition, complete validation and serialization costs, stable quiescent capture, fresh-instance restoration, executable/symlink preservation, runtime compatibility across two instances, memory peaks, real DOM behavior and useful performance benefit. General JSON portability is **inconclusive**; the approved Stage 1 candidate is **not feasible under its current admission contract**.

## 10. Git, deployment status and evidence

HEAD remains `30804ea3e3f94814b46b7a9934fb477f91354615`; tracked working tree and staging area remain clean. Application source, root dependency manifests/lockfile, accepted build, IndexedDB schemas and backup formats were untouched. Existing reports/unrelated files were preserved; only temporary standalone harnesses, synthetic fixture locks and new experiment evidence were added.

No remote Git, GitHub, Vercel, DNS, authentication or credential action was performed during this experiment. Existing Preview/Production deployments were not reverified or redeployed here. Their previous acceptance report is historical context, not a new deployment check. No Stage 2 work was started. **Production remains HOLD.**

- [Stage 0 results](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-4-stage0.json>).
- [Raw Stage 1 ledger, failed observation and cleanup](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-4-stage1.json>), [execution log](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-4-stage1.log>).
- [Fixture identity and policy](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-4-fixture-identity.json>).
- [Derived summary and evidence hashes](<C:/Users/Girish Lade/OneDrive/Desktop/GB-CODER-PUBLIC-ALPHA/reports/b4-4-stage0-1-summary.json>).

Stop after this report. No further experiment, source integration, commit, publication or release is authorized.
