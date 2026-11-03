/**
 * Next.js Security Advisory & Version Verification Service
 *
 * Phase 1H: Independent Security Remediation & Advisory Verification
 *
 * Provides accurate, advisory-specific semver evaluation for known Next.js vulnerabilities:
 * - GHSA-f82v-jwr5-mffw (CVE-2025-29927): Authorization Bypass in Next.js Middleware
 *   Affected: >= 14.0.0 < 14.2.25 | >= 15.0.0 < 15.1.7 | < 13.5.7
 *   Patched: 14.2.25 (14.x) | 15.1.7 (15.x) | 13.5.7 (13.x)
 *   Note: Next.js 14.2.24 is AFFECTED by this advisory.
 *
 * - GHSA-2xp9-vwfh-vxw4 (CVE-2024-46982): Unauthenticated Remote Code Execution in Image Optimization (AVIF)
 *   Affected: < 14.2.21 (14.x) | < 15.0.3 (15.x) | < 13.5.9 (13.x)
 *   Patched: 14.2.21 (14.x) | 15.0.3 (15.x) | 13.5.9 (13.x)
 *
 * - GHSA-fr5h-rqp8-gw6v (CVE-2024-34351): Server Actions SSRF via Host Header
 *   Affected: < 14.2.10 (14.x) | < 14.1.1 (13.x)
 *   Patched: 14.2.10 (14.x) | 14.1.1 (13.x)
 *
 * Official References:
 * - https://github.com/advisories/GHSA-f82v-jwr5-mffw
 * - https://github.com/advisories/GHSA-2xp9-vwfh-vxw4
 * - https://nextjs.org/support-policy
 */

export interface NextJsAdvisoryMatch {
  id: string;
  title: string;
  cve: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  affectedRange: string;
  patchedVersion: string;
}

export interface NextJsSecurityAuditResult {
  version: string;
  isVulnerable: boolean;
  advisories: NextJsAdvisoryMatch[];
  summary: string;
}

interface AdvisoryDefinition {
  id: string;
  title: string;
  cve: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  isAffected: (parsed: [number, number, number]) => { affected: boolean; range: string; patch: string };
}

function parseSemver(v: string): [number, number, number] {
  const clean = v.trim().replace(/^[\^~>=<v\s]+/, '').split('-')[0];
  const parts = clean.split('.').map((p) => parseInt(p, 10));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

function compareSemver(a: [number, number, number], b: [number, number, number]): number {
  if (a[0] !== b[0]) return a[0] - b[0];
  if (a[1] !== b[1]) return a[1] - b[1];
  return a[2] - b[2];
}

export const NEXTJS_SECURITY_ADVISORIES: AdvisoryDefinition[] = [
  {
    id: 'GHSA-f82v-jwr5-mffw',
    title: 'Authorization Bypass in Next.js Middleware',
    cve: 'CVE-2025-29927',
    severity: 'critical',
    description:
      'Specially crafted request headers and internal routing paths allow bypassing middleware authorization checks.',
    isAffected: (parsed) => {
      const [maj] = parsed;
      if (maj === 14) {
        const affected = compareSemver(parsed, [14, 0, 0]) >= 0 && compareSemver(parsed, [14, 2, 25]) < 0;
        return { affected, range: '>=14.0.0 <14.2.25', patch: '14.2.25' };
      }
      if (maj === 15) {
        const affected = compareSemver(parsed, [15, 0, 0]) >= 0 && compareSemver(parsed, [15, 1, 7]) < 0;
        return { affected, range: '>=15.0.0 <15.1.7', patch: '15.1.7' };
      }
      if (maj === 13) {
        const affected = compareSemver(parsed, [13, 0, 0]) >= 0 && compareSemver(parsed, [13, 5, 7]) < 0;
        return { affected, range: '<13.5.7', patch: '13.5.7' };
      }
      if (maj < 13 && maj > 0) {
        return { affected: true, range: '<13.5.7', patch: '13.5.7' };
      }
      return { affected: false, range: '>=15.1.7', patch: '15.1.7' };
    },
  },
  {
    id: 'GHSA-2xp9-vwfh-vxw4',
    title: 'Unauthenticated Remote Code Execution in Next.js Image Optimization',
    cve: 'CVE-2024-46982',
    severity: 'critical',
    description:
      'Unauthenticated remote code execution vulnerability in Next.js built-in image optimizer handling AVIF images.',
    isAffected: (parsed) => {
      const [maj] = parsed;
      if (maj === 14) {
        const affected = compareSemver(parsed, [14, 2, 21]) < 0;
        return { affected, range: '<14.2.21', patch: '14.2.21' };
      }
      if (maj === 15) {
        const affected = compareSemver(parsed, [15, 0, 3]) < 0;
        return { affected, range: '<15.0.3', patch: '15.0.3' };
      }
      if (maj === 13) {
        const affected = compareSemver(parsed, [13, 5, 9]) < 0;
        return { affected, range: '<13.5.9', patch: '13.5.9' };
      }
      if (maj < 13 && maj > 0) {
        return { affected: true, range: '<13.5.9', patch: '13.5.9' };
      }
      return { affected: false, range: '>=15.0.3', patch: '15.0.3' };
    },
  },
  {
    id: 'GHSA-fr5h-rqp8-gw6v',
    title: 'Server Actions SSRF via Host Header',
    cve: 'CVE-2024-34351',
    severity: 'high',
    description:
      'Host header poisoning in Next.js Server Actions can lead to server-side request forgery (SSRF).',
    isAffected: (parsed) => {
      const [maj] = parsed;
      if (maj === 14) {
        const affected = compareSemver(parsed, [14, 2, 10]) < 0;
        return { affected, range: '<14.2.10', patch: '14.2.10' };
      }
      if (maj === 13) {
        const affected = compareSemver(parsed, [13, 4, 0]) >= 0 && compareSemver(parsed, [14, 1, 1]) < 0;
        return { affected, range: '>=13.4.0 <14.1.1', patch: '14.1.1' };
      }
      return { affected: false, range: '>=14.2.10', patch: '14.2.10' };
    },
  },
];

/**
 * Evaluates a given Next.js version string against all known security advisories.
 * Never uses blanket version ranges that flag every older release.
 */
export function auditNextJsSecurity(rawVersion: string): NextJsSecurityAuditResult {
  if (!rawVersion || typeof rawVersion !== 'string') {
    return {
      version: rawVersion || 'unknown',
      isVulnerable: false,
      advisories: [],
      summary: 'No version specified for security audit.',
    };
  }

  const parsed = parseSemver(rawVersion);
  const matchedAdvisories: NextJsAdvisoryMatch[] = [];

  for (const adv of NEXTJS_SECURITY_ADVISORIES) {
    const result = adv.isAffected(parsed);
    if (result.affected) {
      matchedAdvisories.push({
        id: adv.id,
        title: adv.title,
        cve: adv.cve,
        severity: adv.severity,
        description: adv.description,
        affectedRange: result.range,
        patchedVersion: result.patch,
      });
    }
  }

  const isVulnerable = matchedAdvisories.length > 0;
  const summary = isVulnerable
    ? `Next.js ${rawVersion} is affected by ${matchedAdvisories.length} published security advisories: ${matchedAdvisories.map((a) => `${a.id} (${a.title}, minimum patch: ${a.patchedVersion})`).join('; ')}`
    : `Next.js ${rawVersion} has no known matching critical advisories in this database.`;

  return {
    version: rawVersion,
    isVulnerable,
    advisories: matchedAdvisories,
    summary,
  };
}
