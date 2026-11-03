/**
 * Next.js Security Advisory & Version Verification Service
 *
 * Phase 1 Release Candidate 1: Security Advisory Accuracy & Controlled Release Gate
 *
 * Authoritative, advisory-specific semver evaluation for known Next.js vulnerabilities:
 *
 * 1. GHSA-f82v-jwr5-mffw (CVE-2025-29927): Authorization Bypass in Next.js Middleware
 *    Published: 2025-03-21
 *    Affected:
 *    - >= 12.0.0 < 12.3.5 (Patched: 12.3.5)
 *    - >= 13.0.0 < 13.5.9 (Patched: 13.5.9)
 *    - >= 14.0.0 < 14.2.25 (Patched: 14.2.25)
 *    - >= 15.0.0 < 15.2.3 (Patched: 15.2.3)
 *    Reference: https://github.com/advisories/GHSA-f82v-jwr5-mffw
 *
 * 2. GHSA-2xp9-vwfh-vxw4: Unauthenticated Remote Code Execution in Image Optimization (AVIF)
 *    Published: 2024-11-25
 *    Note: No direct CVE assigned in official GitHub Advisory Database; flaw traces to upstream libheif
 *    Affected:
 *    - >= 10.0.0 < 15.5.24 (Patched: 15.5.24)
 *    - >= 16.0.0 < 16.3.3 (Patched: 16.3.3)
 *    Reference: https://github.com/advisories/GHSA-2xp9-vwfh-vxw4
 *
 * 3. GHSA-2464-fhr4-w9xw: Remote Code Execution in Image Optimization (SVG)
 *    Published: 2024-10-23
 *    Note: No direct CVE assigned in official GitHub Advisory Database; flaw traces to upstream sharp SVG handling on glibc
 *    Affected:
 *    - >= 10.0.0 < 15.5.28 (Patched: 15.5.28)
 *    - >= 16.0.0 < 16.4.1 (Patched: 16.4.1)
 *    Reference: https://github.com/advisories/GHSA-2464-fhr4-w9xw
 *
 * 4. GHSA-fr5h-rqp8-gw6v (CVE-2024-34351): Server Actions SSRF via Host Header
 *    Published: 2024-05-09
 *    Note: Upstream advisory identifier is GHSA-fr5h-rqp8-mj6g
 *    Affected:
 *    - >= 13.4.0 < 14.1.1 (Patched: 14.1.1)
 *    - >= 14.0.0 < 14.2.10 (Patched: 14.2.10)
 *    Reference: https://github.com/advisories/GHSA-fr5h-rqp8-gw6v
 */

export interface SemVerTuple {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
}

export interface NextJsAdvisoryInterval {
  rangeString: string;
  min: [number, number, number];
  maxExclusive: [number, number, number];
  patchedVersion: string;
}

export interface NextJsAdvisoryDefinition {
  id: string;
  cve?: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  publishedDate: string;
  upstreamNote?: string;
  intervals: NextJsAdvisoryInterval[];
  sourceUrl: string;
  remediation: string;
}

export interface NextJsAdvisoryMatch {
  id: string;
  cve?: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  publishedDate?: string;
  upstreamNote?: string;
  affectedRange: string;
  patchedVersion: string;
  matchType: 'definitive' | 'potential';
  sourceUrl: string;
}

export interface NextJsSecurityAuditResult {
  rawVersion: string;
  resolvedVersion?: string;
  isVulnerable: boolean;
  hasPotentialVulnerabilities: boolean;
  advisories: NextJsAdvisoryMatch[];
  summary: string;
  remediation?: string;
}

export interface VersionRange {
  min: SemVerTuple;
  maxExclusive: SemVerTuple;
  isExact: boolean;
  isOpenEnded: boolean;
  isWildcard: boolean;
}

export function parseSemver(v: string): SemVerTuple {
  if (!v || typeof v !== 'string') {
    return { major: 0, minor: 0, patch: 0 };
  }
  const clean = v.trim().replace(/^[\^~>=<v\s]+/, '');
  const [core, prerelease] = clean.split('-');
  const parts = core.split('.').map((p) => parseInt(p, 10));
  return {
    major: isNaN(parts[0]) ? 0 : parts[0],
    minor: isNaN(parts[1]) ? 0 : parts[1],
    patch: isNaN(parts[2]) ? 0 : parts[2],
    prerelease: prerelease ? prerelease.trim() : undefined,
  };
}

export function compareSemver(
  a: SemVerTuple | [number, number, number],
  b: SemVerTuple | [number, number, number]
): number {
  const aMaj = Array.isArray(a) ? a[0] : a.major;
  const aMin = Array.isArray(a) ? a[1] : a.minor;
  const aPat = Array.isArray(a) ? a[2] : a.patch;
  const aPre = Array.isArray(a) ? undefined : a.prerelease;

  const bMaj = Array.isArray(b) ? b[0] : b.major;
  const bMin = Array.isArray(b) ? b[1] : b.minor;
  const bPat = Array.isArray(b) ? b[2] : b.patch;
  const bPre = Array.isArray(b) ? undefined : b.prerelease;

  if (aMaj !== bMaj) return aMaj - bMaj;
  if (aMin !== bMin) return aMin - bMin;
  if (aPat !== bPat) return aPat - bPat;

  if (aPre && !bPre) return -1;
  if (!aPre && bPre) return 1;
  if (aPre && bPre) return aPre.localeCompare(bPre);

  return 0;
}

export function parseRange(v: string): VersionRange {
  const trimmed = (v || '').trim();
  if (!trimmed || trimmed === '*' || trimmed === 'latest' || trimmed === 'x' || trimmed === 'X') {
    return {
      min: { major: 0, minor: 0, patch: 0 },
      maxExclusive: { major: 9999, minor: 0, patch: 0 },
      isExact: false,
      isOpenEnded: true,
      isWildcard: true,
    };
  }

  // Caret ranges: ^16.4.1
  if (trimmed.startsWith('^')) {
    const base = parseSemver(trimmed);
    const maxExclusive: SemVerTuple =
      base.major > 0
        ? { major: base.major + 1, minor: 0, patch: 0 }
        : base.minor > 0
        ? { major: 0, minor: base.minor + 1, patch: 0 }
        : { major: 0, minor: 0, patch: base.patch + 1 };
    return { min: base, maxExclusive, isExact: false, isOpenEnded: false, isWildcard: false };
  }

  // Tilde ranges: ~15.5.28
  if (trimmed.startsWith('~')) {
    const base = parseSemver(trimmed);
    const maxExclusive: SemVerTuple = { major: base.major, minor: base.minor + 1, patch: 0 };
    return { min: base, maxExclusive, isExact: false, isOpenEnded: false, isWildcard: false };
  }

  // Comparison ranges: e.g. ">=15.0.0 <16.0.0"
  if (trimmed.includes('<') || trimmed.includes('>')) {
    let min: SemVerTuple = { major: 0, minor: 0, patch: 0 };
    let maxExclusive: SemVerTuple = { major: 9999, minor: 0, patch: 0 };
    const clauses = trimmed.split(/\s+/);
    for (const clause of clauses) {
      if (clause.startsWith('>=')) {
        min = parseSemver(clause.slice(2));
      } else if (clause.startsWith('>')) {
        const parsed = parseSemver(clause.slice(1));
        min = { major: parsed.major, minor: parsed.minor, patch: parsed.patch + 1 };
      } else if (clause.startsWith('<=')) {
        const parsed = parseSemver(clause.slice(2));
        maxExclusive = { major: parsed.major, minor: parsed.minor, patch: parsed.patch + 1 };
      } else if (clause.startsWith('<')) {
        maxExclusive = parseSemver(clause.slice(1));
      }
    }
    return { min, maxExclusive, isExact: false, isOpenEnded: maxExclusive.major === 9999, isWildcard: false };
  }

  // Wildcard suffixes: "14.x", "15.*"
  if (/\.(?:x|\*)$/i.test(trimmed)) {
    const parts = trimmed.split('.');
    const maj = parseInt(parts[0], 10) || 0;
    if (parts.length === 2) {
      return {
        min: { major: maj, minor: 0, patch: 0 },
        maxExclusive: { major: maj + 1, minor: 0, patch: 0 },
        isExact: false,
        isOpenEnded: false,
        isWildcard: true,
      };
    } else if (parts.length === 3) {
      const min = parseInt(parts[1], 10) || 0;
      return {
        min: { major: maj, minor: min, patch: 0 },
        maxExclusive: { major: maj, minor: min + 1, patch: 0 },
        isExact: false,
        isOpenEnded: false,
        isWildcard: true,
      };
    }
  }

  // Exact version
  const exact = parseSemver(trimmed);
  return {
    min: exact,
    maxExclusive: exact,
    isExact: true,
    isOpenEnded: false,
    isWildcard: false,
  };
}

export const NEXTJS_SECURITY_ADVISORIES: NextJsAdvisoryDefinition[] = [
  {
    id: 'GHSA-f82v-jwr5-mffw',
    cve: 'CVE-2025-29927',
    title: 'Authorization Bypass in Next.js Middleware',
    severity: 'critical',
    description:
      'Specially crafted request headers allow bypassing Next.js middleware route protection.',
    publishedDate: '2025-03-21',
    sourceUrl: 'https://github.com/advisories/GHSA-f82v-jwr5-mffw',
    remediation:
      'Upgrade to 12.3.5 (12.x), 13.5.9 (13.x), 14.2.25 (14.x), or 15.2.3 (15.x).',
    intervals: [
      { rangeString: '>=12.0.0 <12.3.5', min: [12, 0, 0], maxExclusive: [12, 3, 5], patchedVersion: '12.3.5' },
      { rangeString: '>=13.0.0 <13.5.9', min: [13, 0, 0], maxExclusive: [13, 5, 9], patchedVersion: '13.5.9' },
      { rangeString: '>=14.0.0 <14.2.25', min: [14, 0, 0], maxExclusive: [14, 2, 25], patchedVersion: '14.2.25' },
      { rangeString: '>=15.0.0 <15.2.3', min: [15, 0, 0], maxExclusive: [15, 2, 3], patchedVersion: '15.2.3' },
    ],
  },
  {
    id: 'GHSA-2xp9-vwfh-vxw4',
    // Note: Official GitHub advisory assigns no direct CVE to Next.js for this entry.
    // Upstream root cause is in libheif/sharp image processing.
    cve: undefined,
    title: 'Unauthenticated Remote Code Execution in Image Optimization (AVIF)',
    severity: 'critical',
    description:
      'Heap buffer overflow vulnerability in built-in image optimizer handling AVIF images.',
    publishedDate: '2024-11-25',
    upstreamNote: 'No direct CVE assigned in official GitHub Advisory Database; flaw traces to upstream libheif heap buffer overflow.',
    sourceUrl: 'https://github.com/advisories/GHSA-2xp9-vwfh-vxw4',
    remediation: 'Upgrade to 15.5.24 (<=15.x) or 16.3.3 (16.x).',
    intervals: [
      { rangeString: '>=10.0.0 <15.5.24', min: [10, 0, 0], maxExclusive: [15, 5, 24], patchedVersion: '15.5.24' },
      { rangeString: '>=16.0.0 <16.3.3', min: [16, 0, 0], maxExclusive: [16, 3, 3], patchedVersion: '16.3.3' },
    ],
  },
  {
    id: 'GHSA-2464-fhr4-w9xw',
    // Note: Official GitHub advisory assigns no direct CVE to Next.js for this entry.
    // Upstream root cause is in sharp SVG parsing.
    cve: undefined,
    title: 'Remote Code Execution in Image Optimization (SVG)',
    severity: 'critical',
    description:
      'Improper sanitization of SVG payloads in Next.js image optimization allows remote code execution.',
    publishedDate: '2024-10-23',
    upstreamNote: 'No direct CVE assigned in official GitHub Advisory Database; flaw traces to upstream sharp SVG handling on glibc.',
    sourceUrl: 'https://github.com/advisories/GHSA-2464-fhr4-w9xw',
    remediation: 'Upgrade to 15.5.28 (<=15.x) or 16.4.1 (16.x).',
    intervals: [
      { rangeString: '>=10.0.0 <15.5.28', min: [10, 0, 0], maxExclusive: [15, 5, 28], patchedVersion: '15.5.28' },
      { rangeString: '>=16.0.0 <16.4.1', min: [16, 0, 0], maxExclusive: [16, 4, 1], patchedVersion: '16.4.1' },
    ],
  },
  {
    id: 'GHSA-fr5h-rqp8-gw6v',
    cve: 'CVE-2024-34351',
    title: 'Server Actions SSRF via Host Header',
    severity: 'high',
    description:
      'Host header poisoning in Next.js Server Actions can lead to server-side request forgery (SSRF).',
    publishedDate: '2024-05-09',
    upstreamNote: 'Upstream GitHub Advisory identifier is GHSA-fr5h-rqp8-mj6g (CVE-2024-34351).',
    sourceUrl: 'https://github.com/advisories/GHSA-fr5h-rqp8-gw6v',
    remediation: 'Upgrade to 14.1.1 (13.x) or 14.2.10 (14.x).',
    intervals: [
      { rangeString: '>=13.4.0 <14.1.1', min: [13, 4, 0], maxExclusive: [14, 1, 1], patchedVersion: '14.1.1' },
      { rangeString: '>=14.0.0 <14.2.10', min: [14, 0, 0], maxExclusive: [14, 2, 10], patchedVersion: '14.2.10' },
    ],
  },
];

/**
 * Audits a declared Next.js dependency version or range against authoritative security advisories.
 * Optionally verifies against an exact resolved version from package-lock.json.
 */
export function auditNextJsSecurity(
  rawVersion: string,
  resolvedVersion?: string
): NextJsSecurityAuditResult {
  if (!rawVersion || typeof rawVersion !== 'string') {
    return {
      rawVersion: rawVersion || 'unknown',
      isVulnerable: false,
      hasPotentialVulnerabilities: false,
      advisories: [],
      summary: 'No version specified for security audit.',
    };
  }

  const range = parseRange(rawVersion);
  const resolved = resolvedVersion ? parseSemver(resolvedVersion) : null;
  const matchedAdvisories: NextJsAdvisoryMatch[] = [];

  for (const adv of NEXTJS_SECURITY_ADVISORIES) {
    for (const interval of adv.intervals) {
      if (resolved) {
        // Evaluates exact installed/resolved version from lockfile
        const isMatch =
          compareSemver(resolved, interval.min) >= 0 &&
          compareSemver(resolved, interval.maxExclusive) < 0;
        if (isMatch) {
          matchedAdvisories.push({
            id: adv.id,
            cve: adv.cve,
            title: adv.title,
            severity: adv.severity,
            description: adv.description,
            publishedDate: adv.publishedDate,
            upstreamNote: adv.upstreamNote,
            affectedRange: interval.rangeString,
            patchedVersion: interval.patchedVersion,
            matchType: 'definitive',
            sourceUrl: adv.sourceUrl,
          });
        }
      } else if (range.isExact) {
        // Exact declared version
        const isMatch =
          compareSemver(range.min, interval.min) >= 0 &&
          compareSemver(range.min, interval.maxExclusive) < 0;
        if (isMatch) {
          matchedAdvisories.push({
            id: adv.id,
            cve: adv.cve,
            title: adv.title,
            severity: adv.severity,
            description: adv.description,
            publishedDate: adv.publishedDate,
            upstreamNote: adv.upstreamNote,
            affectedRange: interval.rangeString,
            patchedVersion: interval.patchedVersion,
            matchType: 'definitive',
            sourceUrl: adv.sourceUrl,
          });
        }
      } else {
        // Declared range without lockfile: check interval overlap
        const overlaps =
          compareSemver(range.min, interval.maxExclusive) < 0 &&
          compareSemver(range.maxExclusive, interval.min) > 0;

        if (overlaps) {
          const fullyContained =
            compareSemver(range.min, interval.min) >= 0 &&
            compareSemver(range.maxExclusive, interval.maxExclusive) <= 0;

          matchedAdvisories.push({
            id: adv.id,
            cve: adv.cve,
            title: adv.title,
            severity: adv.severity,
            description: adv.description,
            publishedDate: adv.publishedDate,
            upstreamNote: adv.upstreamNote,
            affectedRange: interval.rangeString,
            patchedVersion: interval.patchedVersion,
            matchType: fullyContained ? 'definitive' : 'potential',
            sourceUrl: adv.sourceUrl,
          });
        }
      }
    }
  }

  const definitiveMatches = matchedAdvisories.filter((a) => a.matchType === 'definitive');
  const potentialMatches = matchedAdvisories.filter((a) => a.matchType === 'potential');

  const isVulnerable = definitiveMatches.length > 0;
  const hasPotentialVulnerabilities = potentialMatches.length > 0;

  let summary = '';
  if (isVulnerable) {
    summary = `Next.js ${rawVersion}${resolvedVersion ? ` (resolved: ${resolvedVersion})` : ''} is affected by ${definitiveMatches.length} published security advisories: ${definitiveMatches
      .map((a) => `${a.id} (${a.title}, affected: ${a.affectedRange}, minimum patch: ${a.patchedVersion})`)
      .join('; ')}`;
  } else if (hasPotentialVulnerabilities) {
    summary = `Next.js declared range "${rawVersion}" potentially permits installation of ${potentialMatches.length} published security advisories: ${potentialMatches
      .map((a) => `${a.id} (${a.title}, affected range: ${a.affectedRange}, minimum patch: ${a.patchedVersion})`)
      .join('; ')}`;
  } else {
    summary = `Next.js ${rawVersion}${resolvedVersion ? ` (resolved: ${resolvedVersion})` : ''} has no known matching advisories among audited security advisories (GHSA-f82v-jwr5-mffw, GHSA-2xp9-vwfh-vxw4, GHSA-2464-fhr4-w9xw, GHSA-fr5h-rqp8-gw6v).`;
  }

  const remediation = matchedAdvisories.length > 0
    ? `Upgrade Next.js dependency to a patched release line: ${Array.from(new Set(matchedAdvisories.map((a) => a.patchedVersion))).join(', ')}.`
    : undefined;

  return {
    rawVersion,
    resolvedVersion,
    isVulnerable,
    hasPotentialVulnerabilities,
    advisories: matchedAdvisories,
    summary,
    remediation,
  };
}
