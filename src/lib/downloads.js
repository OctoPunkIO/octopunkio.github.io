import { getLatestRelease } from './api.js';

/**
 * Detect the user's operating system.
 * Returns { os, platform, label } or null if undetectable.
 */
export function detectOS() {
  if (typeof navigator === 'undefined') return null;

  const ua = navigator.userAgent.toLowerCase();
  const plat = (navigator.userAgentData?.platform || navigator.platform || '').toLowerCase();

  if (plat.includes('mac') || ua.includes('mac')) {
    return { os: 'macOS', platform: 'darwin-arm64', label: 'macOS (Apple Silicon)' };
  }
  if (plat.includes('linux') || ua.includes('linux')) {
    return { os: 'Linux', platform: 'linux-x64', label: 'Linux (x64)' };
  }
  if (plat.includes('win') || ua.includes('win')) {
    return { os: 'Windows', platform: 'windows-x64', label: 'Windows (x64)' };
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
