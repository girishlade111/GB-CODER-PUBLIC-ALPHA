'use strict';

/**
 * Discovers this machine's LAN IPv4 address so the editor can hand a phone a
 * URL that actually resolves.
 *
 * `os.networkInterfaces()` returns every adapter the host has: loopback, the
 * virtual adapters that Docker/WSL/VirtualBox/VMware install, VPN and Hyper-V
 * filters. Several of those carry RFC1918 addresses, and picking one at random
 * produces a QR code that scans cleanly and then fails to connect — the worst
 * possible failure mode, because it looks correct until you point a camera at it.
 *
 * So the list is filtered by what the address actually is:
 *
 *   - `internal` interfaces are dropped. That is loopback.
 *   - RFC1918 (`10/8`, `172.16/12`, `192.168/16`) and CGNAT (`100.64/10`) are
 *     preferred: these are the ranges a home or office router hands out, and
 *     they are what a phone on the same Wi-Fi can reach.
 *   - Adapter *names* are used only as a tiebreak, to prefer a real Wi-Fi or
 *     Ethernet interface over a virtual one when both are RFC1918. This is a
 *     preference, never a filter — a machine with only a virtual adapter still
 *     gets its address returned.
 *
 * The client shows every candidate rather than only the winner. When the guess is
 * wrong the user can pick a different one without a rebuild, which is the only
 * thing that makes this reliable on machines with exotic network setups.
 */

const os = require('os');

/** Non-loopback IPv4 ranges a phone on the same network can plausibly reach. */
function isPrivateIpv4(address) {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return false;
  }
  const [a, b] = parts;
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10, CGNAT
  return false;
}

/**
 * Virtual adapters are the usual source of a plausible-but-unreachable address.
 * Matched on the interface name Node reports, which is stable across platforms.
 */
const VIRTUAL_ADAPTER_PATTERN =
  /vEthernet|VirtualBox|VMware|Virtual|Hyper-V|WSL|Loopback|Docker|Tailscale|ZeroTier|Bluetooth|NDIS|RailCom|Packet Scheduler|Miniport/i;

/** Real Wi-Fi / Ethernet, which is what we want to reach for first. */
const PHYSICAL_ADAPTER_PATTERN = /wi-?fi|wireless|wlan|ethernet|eno|eth|en0|ens|enp/i;

/**
 * @returns {Array<{ address: string, iface: string, family: string, internal: boolean,
 *                   private: boolean, virtual: boolean, physical: boolean,
 *                   score: number }>}
 *          Best candidate first. Never empty on a machine with a real adapter.
 */
function listLanAddresses() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [iface, entries] of Object.entries(interfaces)) {
    for (const entry of entries || []) {
      // Node 18 reports `family` as the number 4; older versions as 'IPv4'.
      const isIpv4 = entry.family === 'IPv4' || entry.family === 4;
      if (!isIpv4) continue;
      if (entry.internal) continue;

      const privateAddress = isPrivateIpv4(entry.address);
      const virtualAdapter = VIRTUAL_ADAPTER_PATTERN.test(iface);
      const physicalAdapter = PHYSICAL_ADAPTER_PATTERN.test(iface);

      /*
       * Ranking, highest first. Private beats public because a phone cannot
       * reach a public address without port forwarding. A real adapter beats a
       * virtual one because virtual adapters are usually point-to-point filters
       * rather than something a phone can connect through.
       */
      let score = 0;
      if (privateAddress) score += 100;
      if (physicalAdapter) score += 20;
      if (virtualAdapter) score -= 50;

      candidates.push({
        address: entry.address,
        iface,
        family: 'IPv4',
        internal: false,
        private: privateAddress,
        virtual: virtualAdapter,
        physical: physicalAdapter,
        score,
      });
    }
  }

  return candidates.sort((a, b) => b.score - a.score || a.address.localeCompare(b.address));
}

/**
 * Response shape for `GET /api/preview/lan-info`.
 *
 * `port` is the port the *browser* is on, passed in by the caller. The server
 * cannot know it: in local dev the API is served by Vite (5173) rather than by
 * Express (3001), and the two differ. Trusting the value the page reports keeps
 * the generated URL pointed at whatever origin actually served it.
 */
function buildLanInfo(requestedPort) {
  const addresses = listLanAddresses();
  const port = Number.parseInt(requestedPort, 10);
  const safePort = Number.isInteger(port) && port > 0 && port < 65536 ? port : 5173;

  return {
    port: safePort,
    addresses,
    /** Best guess, or null when there is nothing routable to offer. */
    localIp: addresses.length > 0 ? addresses[0].address : null,
    /**
     * A private address is the only case where the phone and the machine are
     * guaranteed to share a network. Reported separately so the UI can say
     * "connect to the same Wi-Fi" only when that is actually true.
     */
    sameNetworkLikely: addresses.some((entry) => entry.private),
  };
}

module.exports = { listLanAddresses, buildLanInfo, isPrivateIpv4 };
