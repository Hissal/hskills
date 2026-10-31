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

  { name: 'a steering link to a missing file fails', files: steering('Follow [the format](docs/format.md).\n'), expect: ['fail steering-paths steering.md'] },

  { name: 'steering links to existing files pass', files: steering('Follow [the format](docs/format.md#rules).\n', { 'docs/format.md': '# Format\n' }), expect: [] },
  { name: 'a steering command running a missing script fails', files: steering('Run `node scripts/gone.js --fix` first.\n', { 'scripts/present.js': '// present\n' }), expect: ['fail steering-paths steering.md'] },
  { name: 'a missing steering path in a fenced block fails', files: steering('```\nnode scripts/gone.js\n```\n', { 'scripts/present.js': '// present\n' }), expect: ['fail steering-paths steering.md'] },
  { name: 'steering commands and paths that exist pass', files: steering('Run `node scripts/present.js`, then read `scripts/`.\n\n```sh\nnode scripts/present.js\n```\n', { 'scripts/present.js': '// present\n' }), expect: [] },

  { name: 'steering examples outside the repository folders pass', files: steering('Branch `fix/memory-leak`, `<type>/<kebab-case>`, type `docs`, project `.claude/settings.json`.\n', { 'docs/format.md': '# Format\n' }), expect: [] },
  { name: 'a steering command for a released skill that is gone fails', history: [{ files: skill('skills/core/tdd'), tag: 'v0.1.0' }], committed: steering('Build with `/tdd`.\n'), expect: ['fail steering-paths steering.md', 'warn id-stability skills/core/tdd/SKILL.md'] },
  { name: 'a Codex steering command for a released skill that is gone fails', history: [{ files: skill('skills/core/tdd'), tag: 'v0.1.0' }], committed: steering('Build with `$tdd`.\n'), expect: ['fail steering-paths steering.md', 'warn id-stability skills/core/tdd/SKILL.md'] },
  { name: 'steering commands for present skills and harness built-ins pass', history: [{ files: skill('skills/core/tdd'), tag: 'v0.1.0' }], committed: steering('Build with `/tdd`, then `/clear`.\n', skill('skills/packs/web/tdd')), expect: [] },
];
