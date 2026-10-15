export type StartupPhase =
  | 'attempt'
  | 'boot'
  | 'mount'
  | 'shell'
  | 'install'
  | 'decision'
  | 'server'
  | 'preview';
export type StartupOutcome =
  | 'started'
  | 'observed'
  | 'inferred'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'timed_out'
  | 'unknown';
export type StartupCode =
  | 'ECONNRESET'
  | 'ENOTFOUND'
  | 'ETIMEDOUT'
  | 'ERESOLVE'
  | 'ENOENT'
  | 'EADDRINUSE'
  | 'UNKNOWN'
  | 'TIMEOUT'
  | 'CANCELLED'
  | 'INTERRUPTED';
export type InstallReason =
  | 'unbooted'
  | 'missing_node_modules'
  | 'fingerprint_mismatch'
  | 'owner_mismatch'
  | 'cached_verified'
  | 'no_manifest'
  | 'active_operation'
  | 'scope_changed';
type AttemptState =
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'timed_out'
  | 'unknown';
export interface StartupEvent {
  phase: StartupPhase;
  outcome: StartupOutcome;
  at: number;
  durationMs?: number;
  code?: StartupCode;
  reason?: InstallReason;
  exitCode?: number;
}
export interface StartupAttempt {
  id: string;
  scope: string;
  epoch: number;
  generation: number;
  startedAt: number;
  state: AttemptState;
  events: StartupEvent[];
}
type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
const KEY = 'gbcoder.startup.diagnostics.v1';
const MAX_BYTES = 256 * 1024;
const phases: StartupPhase[] = [
  'attempt',
  'boot',
  'mount',
  'shell',
  'install',
  'decision',
  'server',
  'preview',
];
const outcomes: StartupOutcome[] = [
  'started',
  'observed',
  'inferred',
  'succeeded',
  'failed',
  'cancelled',
  'timed_out',
  'unknown',
];
const codes: StartupCode[] = [
  'ECONNRESET',
  'ENOTFOUND',
  'ETIMEDOUT',
  'ERESOLVE',
  'ENOENT',
  'EADDRINUSE',
  'UNKNOWN',
  'TIMEOUT',
  'CANCELLED',
  'INTERRUPTED',
];
const reasons: InstallReason[] = [
  'unbooted',
  'missing_node_modules',
  'fingerprint_mismatch',
  'owner_mismatch',
  'cached_verified',
  'no_manifest',
  'active_operation',
  'scope_changed',
];
const finite = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n >= 0;

/** Allowlisted records only: never accepts error messages, output, URLs or source. */
export class StartupDiagnostics {
  private attempts: StartupAttempt[] = [];
  private scopes = new Map<string, string>();
  private storage: StoragePort | undefined;
  constructor(storage?: StoragePort) {
    try {
      this.storage =
        storage ??
        (typeof window !== 'undefined' ? window.sessionStorage : undefined);
    } catch {
      /* memory only */
    }
    try {
      const raw = this.storage?.getItem(KEY);
      if (raw && new TextEncoder().encode(raw).length <= MAX_BYTES) {
        const saved: unknown = JSON.parse(raw);
        if (Array.isArray(saved)) {
          for (const item of saved.slice(-5)) {
            if (!item || typeof item !== 'object') continue;
            const a = item as StartupAttempt;
            if (
              !/^a[0-9a-f-]{8,64}$/.test(a.id) ||
              !/^p[0-9a-f-]{8,64}$/.test(a.scope) ||
              !finite(a.epoch) ||
              !finite(a.generation) ||
              !finite(a.startedAt)
            )
              continue;
            if (
              ![
                'running',
                'succeeded',
                'failed',
                'cancelled',
                'timed_out',
                'unknown',
              ].includes(a.state)
            )
              continue;
            const clean: StartupAttempt = {
              id: a.id,
              scope: a.scope,
              epoch: a.epoch,
              generation: a.generation,
              startedAt: a.startedAt,
              state: a.state,
              events: [],
            };
            if (Array.isArray(a.events))
              for (const event of a.events.slice(-200)) {
                const e = this.cleanEvent(event);
                if (e) clean.events.push(e);
              }
            if (clean.state === 'running') {
              clean.state = 'unknown';
              clean.events.push({
                phase: 'attempt',
                outcome: 'unknown',
                code: 'INTERRUPTED',
                at: Date.now(),
              });
            }
            clean.events = clean.events.slice(-200);
            this.attempts.push(clean);
          }
        }
      }
    } catch {
      /* malformed/unavailable storage does not affect startup */
    }
    this.persist();
  }
  private token(prefix: string): string {
    return (
      prefix +
      (globalThis.crypto?.randomUUID?.() ??
        `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`)
    );
  }
  private cleanEvent(input: StartupEvent): StartupEvent | null {
    if (
      !input ||
      !phases.includes(input.phase) ||
      !outcomes.includes(input.outcome) ||
      !finite(input.at)
    )
      return null;
    const event: StartupEvent = {
      phase: input.phase,
      outcome: input.outcome,
      at: input.at,
    };
    if (finite(input.durationMs))
      event.durationMs = Math.min(input.durationMs, 86400000);
    if (codes.includes(input.code!)) event.code = input.code;
    if (reasons.includes(input.reason!)) event.reason = input.reason;
    if (
      input.phase === 'shell' &&
      Number.isInteger(input.exitCode) &&
      input.exitCode! >= 0 &&
      input.exitCode! <= 255
    )
      event.exitCode = input.exitCode;
    return event;
  }
  begin(projectId: string, epoch: number, generation: number): string {
    let scope = this.scopes.get(projectId);
    if (!scope) {
      scope = this.token('p');
      this.scopes.set(projectId, scope);
    }
    while (this.scopes.size > 5)
      this.scopes.delete(this.scopes.keys().next().value!);
    const id = this.token('a');
    this.attempts.push({
      id,
      scope,
      epoch,
      generation,
      startedAt: Date.now(),
      state: 'running',
      events: [],
    });
    this.attempts = this.attempts.slice(-5);
    this.record(id, 'attempt', 'started');
    return id;
  }
  record(
    id: string | null,
    phase: StartupPhase,
    outcome: StartupOutcome,
    details: Pick<
      StartupEvent,
      'code' | 'reason' | 'durationMs' | 'exitCode'
    > = {},
  ): void {
    const attempt = this.attempts.find((a) => a.id === id);
    if (!attempt || attempt.state !== 'running') return;
    const event = this.cleanEvent({
      phase,
      outcome,
      at: Date.now(),
      ...details,
    });
    if (!event) return;
    attempt.events.push(event);
    attempt.events = attempt.events.slice(-200);
    this.persist();
  }
  finish(id: string | null, state: Exclude<AttemptState, 'running'>): void {
    const attempt = this.attempts.find((a) => a.id === id);
    if (!attempt || attempt.state !== 'running') return;
    this.record(id, 'attempt', state);
    attempt.state = state;
    this.persist();
  }
  snapshot(): StartupAttempt[] {
    return JSON.parse(JSON.stringify(this.attempts)) as StartupAttempt[];
  }
  private persist(): void {
    let text = JSON.stringify(this.attempts);
    while (
      new TextEncoder().encode(text).length > MAX_BYTES &&
      this.attempts.length
    ) {
      this.attempts.shift();
      text = JSON.stringify(this.attempts);
    }
    try {
      this.storage?.setItem(KEY, text);
    } catch {
      /* quota/privacy mode: retain bounded memory */
    }
  }
}
