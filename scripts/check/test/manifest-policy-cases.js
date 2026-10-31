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
  ];
};
