'use strict';
// Plugin manifest versions match the last release tag (#112), so installed
// versions are truthful. Silent until the first release tag, like id-stability.
// A release PR stamps the version it is about to tag: release-please records
// it in the release manifest, so a version there newer than the tag is the
// one expected.

const RELEASE_MANIFEST = '.release-please-manifest.json';

// x.y.z only; anything else is never newer
const parts = (v) => (/^\d+\.\d+\.\d+$/.test(v) ? v.split('.').map(Number) : null);
function newer(a, b) {
  const x = parts(a), y = parts(b);
  if (!x || !y) return false;
  const i = x.findIndex((n, j) => n !== y[j]);
  return i >= 0 && x[i] > y[i];
}

function pendingVersion(c) {
  if (!c.exists(RELEASE_MANIFEST)) return null;
  try { return JSON.parse(c.text(RELEASE_MANIFEST))['.'] || null; } catch (e) { return null; }
}

module.exports = {
  id: 'release-version', level: 'fail',
  check(c) {
    const release = c.release;
    if (!release) return [];
    const tagged = release.tag.slice(1);
    const pending = pendingVersion(c);
    const [want, source] = newer(pending, tagged)
      ? [pending, 'pending release ' + pending + ' (' + RELEASE_MANIFEST + ')']
      : [tagged, 'release tag ' + release.tag];
    const findings = [];
    for (const file of c.files.filter((f) => /(^|\/)\.(claude|codex)-plugin\/plugin\.json$/.test(f))) {
      let version;
      try { version = JSON.parse(c.text(file)).version; } catch (e) {
        findings.push({ file, message: 'invalid plugin manifest JSON: ' + e.message });
        continue;
      }
      if (version !== want) findings.push({ file, message: 'version ' + version + ' disagrees with ' + source });
    }
    return findings;
  },
};
