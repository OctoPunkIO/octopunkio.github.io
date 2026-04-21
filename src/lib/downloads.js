import { getLatestRelease } from './api.js';

/**
 * Detect the user's OS family (not architecture). Safe to call synchronously.
 * Returns { os, family, label } or null.
 *   family: 'mac' | 'linux' | 'windows'
 */
export function detectOSFamily() {
  if (typeof navigator === 'undefined') return null;

  const ua = navigator.userAgent.toLowerCase();
  const plat = (navigator.userAgentData?.platform || navigator.platform || '').toLowerCase();

  if (plat.includes('mac') || ua.includes('mac')) {
    return { os: 'macOS', family: 'mac', label: 'macOS' };
  }
  if (plat.includes('linux') || ua.includes('linux')) {
    return { os: 'Linux', family: 'linux', label: 'Linux' };
  }
  if (plat.includes('win') || ua.includes('win')) {
    return { os: 'Windows', family: 'windows', label: 'Windows' };
  }

  return null;
}

/**
 * Detect the user's OS and best-guess architecture.
 * Async because macOS arch detection requires UA Client Hints high-entropy values
 * (Chromium-family only). Returns { os, family, platform, label, archCertain }.
 *   archCertain: true when we could read the real architecture; false when we're guessing.
 */
export async function detectOS() {
  const fam = detectOSFamily();
  if (!fam) return null;

  if (fam.family === 'mac') {
    let arch = null;
    try {
      const hints = await navigator.userAgentData?.getHighEntropyValues?.(['architecture']);
      if (hints?.architecture) {
        arch = hints.architecture === 'arm' ? 'arm64' : 'x64';
      }
    } catch {
      // Safari/Firefox don't expose userAgentData — arch stays null.
    }
    // Default guess: Apple Silicon (majority of Macs sold since late 2020).
    const isCertain = arch !== null;
    const platform = arch === 'x64' ? 'darwin-x64' : 'darwin-arm64';
    const label = platform === 'darwin-arm64' ? 'macOS (Apple Silicon)' : 'macOS (Intel)';
    return { os: fam.os, family: 'mac', platform, label, archCertain: isCertain };
  }

  if (fam.family === 'linux') {
    return { os: fam.os, family: 'linux', platform: 'linux-x64', label: 'Linux (x64)', archCertain: true };
  }

  if (fam.family === 'windows') {
    return { os: fam.os, family: 'windows', platform: 'windows-x64', label: 'Windows (x64)', archCertain: true };
  }

  return null;
}

/**
 * All available platforms with display info.
 */
export const ALL_PLATFORMS = [
  { platform: 'darwin-arm64', os: 'macOS', label: 'macOS (Apple Silicon)' },
  { platform: 'darwin-x64', os: 'macOS', label: 'macOS (Intel)' },
  { platform: 'linux-x64', os: 'Linux', label: 'Linux (x64)' },
  { platform: 'windows-x64', os: 'Windows', label: 'Windows (x64)' },
];

/**
 * Fetch latest release with all artifacts in a single API call.
 * Returns { version, releaseNotes, releaseUrl, artifacts } or null.
 * Each artifact: { platform, download_url, filename, sha256, size_bytes }
 */
export async function fetchLatestDownloads(stream = 'stable') {
  try {
    const release = await getLatestRelease(stream);
    if (!release) return null;
    return release;
  } catch {
    return null;
  }
}

/**
 * Find a download URL for a specific platform from a release object.
 */
export function getDownloadForPlatform(release, platform) {
  if (!release?.artifacts) return null;
  return release.artifacts.find(a => a.platform === platform) || null;
}
