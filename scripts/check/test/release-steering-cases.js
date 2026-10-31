'use strict';
// #112: plugin manifest versions against the release tag, and the paths and
// commands the personal steering source names.

const claude = 'hooks/guard/.claude-plugin/plugin.json';
const codex = 'hooks/guard/.codex-plugin/plugin.json';
const plugin = (version, file) => ({ [file || claude]: JSON.stringify({ name: 'guard', version }) + '\n' });
// release-please's release manifest: the version a release PR is about to tag
const pending = (version) => ({ '.release-please-manifest.json': JSON.stringify(version ? { '.': version } : {}) + '\n' });

const steering = (text, extra) => Object.assign({ 'steering.md': text }, extra);

module.exports = ({ skill }) => [
  { name: 'a plugin version that disagrees with the release tag fails', history: [{ files: plugin('0.1.0'), tag: 'v0.1.0' }], committed: plugin('0.2.0'), expect: ['fail release-version ' + claude] },
  { name: 'plugin versions matching the release tag pass', history: [{ files: plugin('0.1.0'), tag: 'v0.1.0' }], committed: Object.assign(plugin('0.1.0'), plugin('0.1.0', codex), pending('0.1.0')), expect: [] },
  { name: 'before the first release tag the version rule is silent', history: [{ files: plugin('0.1.0'), tag: 'experiment' }], committed: Object.assign(plugin('0.2.0'), pending()), expect: [] },
  { name: 'the latest release tag sets the version', history: [{ files: plugin('0.1.0'), tag: 'v0.1.0' }, { files: plugin('0.1.1'), tag: 'v0.1.1' }], committed: plugin('0.1.0', codex), expect: ['fail release-version ' + codex] },
  { name: 'a release PR stamping its pending version passes', history: [{ files: plugin('0.1.0'), tag: 'v0.1.0' }], committed: Object.assign(plugin('0.1.1'), pending('0.1.1')), expect: [] },
  { name: 'a release PR leaving a plugin unstamped fails', history: [{ files: plugin('0.1.0'), tag: 'v0.1.0' }], committed: Object.assign(plugin('0.1.1'), plugin('0.1.0', codex), pending('0.1.1')), expect: ['fail release-version ' + codex] },
  { name: 'a release manifest behind the tag is not a pending release', history: [{ files: plugin('0.1.0'), tag: 'v0.2.0' }], committed: Object.assign(plugin('0.1.0'), pending('0.1.0')), expect: ['fail release-version ' + claude] },
  { name: 'an unreadable plugin manifest fails the version rule', history: [{ files: plugin('0.1.0'), tag: 'v0.1.0' }], committed: { [claude]: '{ not json\n' }, expect: ['fail release-version ' + claude] },

  { name: 'a relative steering link fails even when its target exists', files: steering('Follow [the format](docs/format.md#rules).\n', { 'docs/format.md': '# Format\n' }), expect: ['fail steering-paths steering.md'] },
  { name: 'a relative steering reference definition fails', files: steering('Follow [the format].\n\n[the format]: docs/format.md\n', { 'docs/format.md': '# Format\n' }), expect: ['fail steering-paths steering.md'] },
  { name: 'absolute URL steering links pass', files: steering('Follow [the format](https://github.com/Hissal/skill-collection/blob/main/docs/skill-format.md#rules).\n'), expect: [] },
  { name: 'paths in steering code are not checked', files: steering('Run `node scripts/gone.js --fix`, read `docs/gone.md`.\n\n```sh\nnode scripts/gone.js\n```\n', { 'scripts/present.js': '// present\n', 'docs/format.md': '# Format\n' }), expect: [] },

  { name: 'a steering command for a released skill that is gone fails', history: [{ files: skill('skills/core/tdd'), tag: 'v0.1.0' }], committed: steering('Build with `/tdd`.\n'), expect: ['fail steering-paths steering.md', 'warn id-stability skills/core/tdd/SKILL.md'] },
  { name: 'a Codex steering command for a released skill that is gone fails', history: [{ files: skill('skills/core/tdd'), tag: 'v0.1.0' }], committed: steering('Build with `$tdd`.\n'), expect: ['fail steering-paths steering.md', 'warn id-stability skills/core/tdd/SKILL.md'] },
  { name: 'a plugin-qualified steering command for a released skill that is gone fails', history: [{ files: skill('skills/core/tdd'), tag: 'v0.1.0' }], committed: steering('Build with `/collection-core:tdd`, or `$collection-core:tdd`.\n'), expect: ['fail steering-paths steering.md', 'fail steering-paths steering.md', 'warn id-stability skills/core/tdd/SKILL.md'] },
  { name: 'a plugin-qualified steering command for a present skill passes', history: [{ files: skill('skills/core/tdd'), tag: 'v0.1.0' }], committed: steering('Build with `/collection-pack-web:tdd`.\n', skill('skills/packs/web/tdd')), expect: [] },
  { name: 'a steering command for a skill gone since an earlier release fails', history: [{ files: skill('skills/core/tdd'), tag: 'v0.1.0' }, { files: steering('Build.\n'), tag: 'v0.1.1' }], committed: steering('Build with `/tdd`.\n'), expect: ['fail steering-paths steering.md'] },
  { name: 'a steering command for a skill restored after an earlier release passes', history: [{ files: skill('skills/core/tdd'), tag: 'v0.1.0' }, { files: steering('Build.\n'), tag: 'v0.1.1' }], committed: steering('Build with `/tdd`.\n', skill('skills/core/tdd')), expect: [] },
  { name: 'steering commands for present skills and harness built-ins pass', history: [{ files: skill('skills/core/tdd'), tag: 'v0.1.0' }], committed: steering('Build with `/tdd`, then `/clear`.\n', skill('skills/packs/web/tdd')), expect: [] },
];
