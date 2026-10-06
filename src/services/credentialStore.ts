/**
 * Credential storage for deployment and GitHub tokens.
 *
 * ## Why this exists
 *
 * Deploying to Vercel/Netlify and syncing to GitHub all need a personal access
 * token that the user pastes in. Those tokens are high-value — a Vercel token
 * can publish to any of the user's projects, a `repo`-scoped GitHub token can
 * write to every repository they can reach — so a token left in plaintext in
 * `localStorage` is a real liability: it is readable by any script on the
 * origin, swept up by browser-profile backups, synced between machines by some
 * browsers, and visible to anyone who gets the profile directory.
 *
 * Both feature services therefore come to this module rather than reaching for
 * `localStorage` themselves.
 *
 * ## What the encryption does and does not buy
 *
 * Values are sealed with AES-GCM under a random per-install key. Be clear about
 * the threat model, because "encrypted" invites over-trust:
 *
 *  - **It does protect against** the token appearing as readable text in a
 *    profile backup, a synced browser profile, a shared machine, a screenshot of
 *    devtools, or a support bundle containing `localStorage`.
 *  - **It does not protect against** anything that can run script on this
 *    origin. Such a script can simply call this module, and the AES key has to
 *    be reachable by this module for "remember on this device" to work at all.
 *
 * No browser-only scheme can do better than that. Anything stronger means the
 * key lives somewhere the page cannot reach — a server session, or a WebAuthn
 * credential — which is a different (and much larger) piece of infrastructure.
 *
 * Because of that, this module also keeps session-only values *out* of storage
 * entirely: the default is a token that lives in a module-scoped `Map` and dies
 * with the tab. "Remember on this device" is the opt-in to ciphertext on disk.
 *
 * Tokens must still be scoped as tightly as the host allows. A Vercel token
 * limited to one team, or a GitHub token with `repo` on a single account, limits
 * the damage well below what full-account access would.
 */

/** Slot holding the raw AES key. Distinct from a credential id. */
const KEY_SLOT = 'gbcoder_credkey_v1';
/** Every persisted ciphertext is `prefix + id`. */
const VALUE_PREFIX = 'gbcoder_cred_v1:';

const ALGORITHM = 'AES-GCM';
const KEY_BYTES = 32;
const IV_BYTES = 12;

/**
 * Session-only secrets, keyed by credential id.
 *
 * Module-scoped, so a full reload drops them — which is the point. A user who
 * pastes a token for one deploy should not find it waiting for them a week
 * later on a shared machine.
 */
const sessionSecrets = new Map<string, string>();

/**
 * Resolves once a key exists, so two concurrent saves cannot each generate a key
 * and leave one orphaned in storage.
 */
let keyPromise: Promise<CryptoKey | null> | null = null;

// ─── Base64 helpers ───────────────────────────────────────────────────────────

const toBase64 = (bytes: Uint8Array): string => {
  // Chunked because `String.fromCharCode(...bytes)` blows the argument limit on
  // anything larger than a few tens of kilobytes, and keys can be small but
  // payloads (tokens, errors) are not.
  let binary = '';
  const CHUNK = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + CHUNK));
  }
  return btoa(binary);
};

const fromBase64 = (value: string): Uint8Array => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
};

// ─── Storage primitives ───────────────────────────────────────────────────────

/**
 * `localStorage` throws rather than returning null in a few real situations:
 * Safari private mode, a profile at quota, and any origin with storage blocked
 * by policy. Callers must not treat a throw as a programming error.
 */
const readStorage = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string): boolean => {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const removeStorage = (key: string): void => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* nothing to do; the value is already unreachable */
  }
};

/**
 * Whether real encryption is available.
 *
 * `crypto.subtle` only exists in a secure context, so this is false on a plain
 * http origin. The app itself is served over https (or from localhost in dev),
 * but a LAN-IP preview — which GB Coder does offer — is not.
 *
 * The UI reads this to tell the user plainly that a remembered token will be
 * stored unencrypted rather than quietly downgrading.
 */
export const isEncryptionAvailable = (): boolean =>
  typeof crypto !== 'undefined' && typeof crypto.subtle?.encrypt === 'function';

/** Loads the install key, minting one on first use. `null` means "no crypto". */
const loadKey = (): Promise<CryptoKey | null> => {
  if (keyPromise) return keyPromise;

  keyPromise = (async () => {
    if (!isEncryptionAvailable()) return null;

    try {
      const stored = readStorage(KEY_SLOT);
      const raw = stored ? fromBase64(stored) : crypto.getRandomValues(new Uint8Array(KEY_BYTES));

      // Persist before importing, so a failure here leaves a usable key in memory
      // instead of an orphaned one in storage.
      if (!stored && !writeStorage(KEY_SLOT, toBase64(raw))) return null;

      return await crypto.subtle.importKey('raw', raw as BufferSource, { name: ALGORITHM }, true, [
        'encrypt',
        'decrypt',
      ]);
    } catch {
      return null;
    }
  })();

  return keyPromise;
};

// ─── Public API ───────────────────────────────────────────────────────────────

/** How a credential ended up being held. */
export interface CredentialRecord {
  /**
   * `true` when the value exists only in memory and is gone after a reload.
   *
   * Callers use this to show an honest "held for this tab only" hint rather
   * than implying persistence that is not there.
   */
  sessionOnly: boolean;
  updatedAt: number;
}

const envelope = (id: string) => `${VALUE_PREFIX}${id}`;

/**
 * Stores a token.
 *
 * `remember` decides where it lands: `false` keeps it in memory for this tab,
 * `true` seals it into `localStorage`. Callers must not pass a token that has
 * already been stored — this overwrites.
 */
export const saveCredential = async (
  id: string,
  value: string,
  remember: boolean,
): Promise<CredentialRecord> => {
  sessionSecrets.set(id, value);
  const record: CredentialRecord = { sessionOnly: !remember, updatedAt: Date.now() };

  if (!remember) {
    // Drop any previously remembered copy, otherwise "forget on this device"
    // would be silently undone by the next remember.
    removeStorage(envelope(id));
    return record;
  }

  const key = await loadKey();
  if (!key) return record;

  try {
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    const sealed = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv },
      key,
      new TextEncoder().encode(value) as BufferSource,
    );

    const stored = writeStorage(
      envelope(id),
      JSON.stringify({ iv: toBase64(iv), data: toBase64(new Uint8Array(sealed)), at: record.updatedAt }),
    );

    // Storage refused the write (quota, private mode). The value is still usable
    // from memory, but report it as session-only so the UI does not overclaim.
    if (!stored) record.sessionOnly = true;
  } catch {
    record.sessionOnly = true;
  }

  return record;
};

/**
 * Reads a token, preferring the in-memory copy.
 *
 * Returns `null` rather than throwing: a missing or undecryptable credential is
 * an ordinary state the UI handles by asking for the token again.
 */
export const readCredential = async (id: string): Promise<string | null> => {
  const inMemory = sessionSecrets.get(id);
  if (inMemory !== undefined) return inMemory;

  const raw = readStorage(envelope(id));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { iv?: string; data?: string };
    if (!parsed.iv || !parsed.data) return null;

    const key = await loadKey();
    if (!key) return null;

    const opened = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv: fromBase64(parsed.iv) as BufferSource },
      key,
      fromBase64(parsed.data) as BufferSource,
    );

    const value = new TextDecoder().decode(opened);
    sessionSecrets.set(id, value);
    return value;
  } catch {
    /*
     * The key no longer matches the ciphertext — most likely the profile was
     * copied to another machine, or the app's storage was cleared out from under
     * a live tab. Either way the token is unrecoverable, so drop the ciphertext
     * and let the caller ask again.
     */
    removeStorage(envelope(id));
    return null;
  }
};

/** Removes every trace of a credential, in memory and on disk. */
export const forgetCredential = (id: string): void => {
  sessionSecrets.delete(id);
  removeStorage(envelope(id));
};

/**
 * Whether a token is available without a decrypt round-trip.
 *
 * Only drives UI affordances, so the cheap check is enough.
 */
export const hasCredential = (id: string): boolean =>
  sessionSecrets.has(id) || readStorage(envelope(id)) !== null;

/** Describes how a stored credential is held. `null` when there is none. */
export const describeCredential = (id: string): CredentialRecord | null => {
  const inMemory = sessionSecrets.get(id);
  if (inMemory !== undefined) return { sessionOnly: true, updatedAt: Date.now() };

  const raw = readStorage(envelope(id));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { at?: number };
    return { sessionOnly: false, updatedAt: parsed.at ?? 0 };
  } catch {
    return null;
  }
};