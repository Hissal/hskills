'use strict';
// #111: policy rules that read the manifest's lists.

module.exports = ({ skill, tree }) => {
  const manifest = (data) => ({ 'collection.json': JSON.stringify(Object.assign({ core: [], packs: {}, expensive: [] }, data)) + '\n' });
  return [
    { name: '#111 an expensive skill model-invoked off the allow-list fails',
      files: tree(skill('skills/core/alpha'), manifest({ core: ['skills/core/alpha'], expensive: ['skills/core/alpha'] })),
      expect: ['fail expensive-workflow skills/core/alpha/SKILL.md'] },
    { name: '#111 an expensive skill model-invoked with disable-model-invocation: false fails',
      files: tree(skill('skills/packs/web/alpha', { fm: { 'disable-model-invocation': ' false' } }), manifest({ packs: { web: ['skills/packs/web/alpha'] }, expensive: ['skills/packs/web/alpha'] })),
      expect: ['fail expensive-workflow skills/packs/web/alpha/SKILL.md'] },
    { name: '#111 allow-listed expensive skills may be model-invoked',
      files: tree(skill('skills/core/code-review'), skill('skills/core/research'), manifest({ core: ['skills/core/code-review', 'skills/core/research'], expensive: ['skills/core/code-review', 'skills/core/research'] })),
      expect: [] },
    { name: '#111 a user-invoked expensive skill passes',
      files: tree(skill('skills/core/alpha', { fm: { 'disable-model-invocation': ' true' } }), manifest({ core: ['skills/core/alpha'], expensive: ['skills/core/alpha'] })),
      expect: [] },
    { name: '#111 a model-invoked skill not on the expensive list passes',
      files: tree(skill('skills/core/alpha'), manifest({ core: ['skills/core/alpha'] })),
      expect: [] },

    // ADR 0003: extension points name the need, never a pack's guide or skill.
    { name: '#111 a core skill naming a pack skill fails',
      files: tree(skill('skills/core/alpha', { body: '# alpha\n\nFor tests, call the `web-testing` skill.\n' }), skill('skills/packs/web/web-testing'),
        manifest({ core: ['skills/core/alpha'], packs: { web: ['skills/packs/web/web-testing'] } })),
      expect: ['fail core-names-pack skills/core/alpha/SKILL.md'] },
    { name: '#111 a core reference naming a pack guide fails',
      files: tree(skill('skills/core/alpha', { body: 'Read [ref](REF.md).\n', files: { 'REF.md': '# Ref\n\nAsk /web-guide for idioms.\n' } }), skill('skills/packs/web/web-guide'),
        manifest({ core: ['skills/core/alpha'], packs: { web: ['skills/packs/web/web-guide'] } })),
      expect: ['fail core-names-pack skills/core/alpha/REF.md'] },
    { name: '#111 setup-project and the core guide may name packs',
      files: tree(skill('skills/core/setup-project', { body: '# setup\n\nList `web-guide` in the pack list.\n' }),
        skill('skills/core/guide', { fm: { 'disable-model-invocation': ' true' }, body: '# guide\n\nInstalled guides include web-guide.\n' }),
        skill('skills/packs/web/web-guide'),
        manifest({ core: ['skills/core/setup-project', 'skills/core/guide'], packs: { web: ['skills/packs/web/web-guide'] } })),
      expect: [] },
    { name: '#111 extension points that name only the need pass',
      files: tree(skill('skills/core/alpha', { body: "# alpha\n\nAsk the project's listed pack guides for web-testing-style idioms, not my-web-testing.\n" }),
        skill('skills/packs/web/web-testing', { body: '# web-testing\n\nSee web-guide.\n' }), skill('skills/packs/web/web-guide'),
        manifest({ core: ['skills/core/alpha'], packs: { web: ['skills/packs/web/web-testing', 'skills/packs/web/web-guide'] } })),
      expect: [] },
  ];
};
