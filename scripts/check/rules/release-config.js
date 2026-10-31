'use strict';
// Coverage only: release-tag/version equality is release-version's.
module.exports = {
  id: 'release-config', level: 'fail',
  check(c) {
    const file = 'release-please-config.json';
    if (!c.exists(file)) return [];
    try {
      const config = JSON.parse(c.text(file));
      const packages = config.packages;
      const root = packages && packages['.'];
      if (!root || Object.keys(packages).length !== 1 || root['release-type'] !== 'simple' ||
          root['initial-version'] !== '0.1.0' || root['bump-minor-pre-major'] !== true ||
          root['bump-patch-for-minor-pre-major'] !== true || root['include-component-in-tag'] !== false) {
        throw new Error('use one root simple release, initial 0.1.0, both pre-major bump flags and unprefixed tags');
      }
      const stamps = root['extra-files'] || [];
      const plugins = c.files.filter((f) => /(^|\/)\.(claude|codex)-plugin\/plugin\.json$/.test(f));
      const findings = plugins.filter((f) => !stamps.some((s) => s.type === 'json' && s.path === f && s.jsonpath === '$.version'))
        .map((f) => ({ file: f, message: 'add a JSON $.version extra-files entry to release-please-config.json' }));
      for (const s of stamps) {
        if (!s || !c.exists(s.path)) findings.push({ file, message: 'extra-files entry names a missing file' });
      }
      return findings;
    } catch (e) { return [{ file, message: 'invalid release configuration: ' + e.message }]; }
  },
};
