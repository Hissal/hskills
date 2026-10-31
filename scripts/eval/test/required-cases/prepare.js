#!/usr/bin/env node
'use strict';
// Writes only into a new disposable directory: three Git projects with real
// collection skills installed at project scope, and one trigger-eval config
// per project. Installs nothing elsewhere and touches no auth.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {write, install, commit, frontierModels} = require('../scratch.js');

const repo = path.resolve(__dirname, '../../../..');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'required-cases-'));
const skill = folder => path.join(repo, 'skills', folder);
const guide = skill('core/guide');

function config(variant, name, queries) {
  const models = frontierModels(path.join(root, 'evidence', variant));
  fs.writeFileSync(path.join(root, variant + '.json'), JSON.stringify({cwd: variant, models, skills: [{name, queries}]}, null, 2) + '\n');
}
// Each request invokes the core guide, which may or may not load csharp-guide.
function guideConfig(variant, fire, says, requests) {
  config(variant, 'csharp-guide', requests.map(request => ({
    prompt: {claude: '/guide ' + request, codex: '$guide ' + request},
    says: {claude: says('/'), codex: says('$')},
    fire,
  })));
}
function agents(project, intro, packs = '') {
  write(path.join(project, 'AGENTS.md'), `${intro}

## Agent skills

### Issue tracker

Issues are Markdown files under \`issues/\`.
${packs}`);
  write(path.join(project, 'CLAUDE.md'), '@AGENTS.md\n');
}
// A small JavaScript web shop with no pack list, committed.
function storefront(project) {
  agents(project, '# Storefront\n\nA small web shop: product catalog, search, cart and checkout.');
  write(path.join(project, 'package.json'), JSON.stringify({name: 'storefront', private: true, scripts: {test: 'node --test'}}, null, 2) + '\n');
  write(path.join(project, 'src/cart.js'), "'use strict';\n// Sums line totals in cents.\nfunction cartTotal(lines) {\n  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);\n}\nmodule.exports = {cartTotal};\n");
  write(path.join(project, 'src/search.js'), "'use strict';\n// Case-insensitive substring match over product names.\nmodule.exports = (products, query) => products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));\n");
  write(path.join(project, 'src/checkout.js'), "'use strict';\n// Places an order for a cart.\nmodule.exports = async function checkout(cart) { throw new Error('not implemented'); };\n");
  commit(project);
}

// The automatic guide at task start: the web shop with the onboarding pack
// installed beside core. Plain requests, no invocation: three start a task
// that needs a workflow chosen, three need none.
{
  const project = path.join(root, 'automatic');
  install(project, {guide, 'onboarding-guide': skill('packs/onboarding/onboarding-guide')});
  storefront(project);
  const recommends = ['Recommended:'];
  config('automatic', 'onboarding-guide', [
    {prompt: 'I want shoppers to keep their cart across devices, but I am not sure where to start.', says: recommends, fire: true},
    {prompt: 'We should add discount codes to checkout. How should we approach it?', says: recommends, fire: true},
    {prompt: 'Product search feels slow and clunky and I have a few vague ideas to fix it. Help me work out what to do first.', says: recommends, fire: true},
    {prompt: 'What is two plus two?', fire: false},
    {prompt: 'Keep going with the cart changes you already started; the tests are next.', fire: false},
    {prompt: 'What does cartTotal in src/cart.js return for an empty cart?', fire: false},
  ]);
}

// The core guide finding an installed pack guide, with the C# pack installed
// beside core. `listed` is an SDK-style .NET library that names csharp-guide
// in its pack list: /guide loads it. `unlisted` is the web shop, with no pack
// list and requests outside C#: /guide only flags it as not set up.
// csharp-guide's own description fires on .NET work and on choosing a C#
// workflow, and its body handles being loaded unlisted. In a .NET project
// that trigger, not the guide's lookup, may load it (Sol does), so the
// unlisted case keeps it out of reach.
const csharp = {guide, 'csharp-guide': skill('packs/csharp/csharp-guide')};
{
  const project = path.join(root, 'listed');
  install(project, csharp);
  agents(project, '# Acme.Units\n\nA NuGet library for parsing and converting physical quantities.', `
### Packs

- \`csharp-guide\`: SDK-style .NET libraries. Config: \`docs/agents/csharp.md\`.
`);
  write(path.join(project, 'docs/agents/csharp.md'), "# C#\n\nA missing field means the owning skill's default.\n");
  write(path.join(project, 'src/Acme.Units/Acme.Units.csproj'), '<Project Sdk="Microsoft.NET.Sdk">\n  <PropertyGroup>\n    <TargetFrameworks>netstandard2.0;net8.0</TargetFrameworks>\n    <PackageId>Acme.Units</PackageId>\n    <Version>2.3.0</Version>\n  </PropertyGroup>\n</Project>\n');
  write(path.join(project, 'src/Acme.Units/Quantity.cs'), 'namespace Acme.Units;\n\npublic readonly struct Quantity\n{\n    public Quantity(double value, string unit) { Value = value; Unit = unit; }\n    public double Value { get; }\n    public string Unit { get; }\n    public static Quantity Parse(string text) => throw new System.NotImplementedException();\n}\n');
  commit(project);
  guideConfig('listed', true, () => ['Recommended:'], [
    'I need to rename the public `Quantity` type in our NuGet package without breaking the apps that consume it.',
    'We want to add an optional `culture` parameter to the public `Quantity.Parse` method. How should I go about it?',
    'Consumers on .NET Framework report a MissingMethodException after our last package release. Where do I start?',
  ]);
}
{
  const project = path.join(root, 'unlisted');
  install(project, csharp);
  storefront(project);
  guideConfig('unlisted', false, sigil => ['Recommended:', 'csharp-guide', 'installed, not set up', sigil + 'setup-project'], [
    'Checkout sometimes charges a cart twice when the customer double-clicks Pay.',
    'I want to split src/search.js into indexing and ranking without changing any results.',
    'We need to decide how discount codes should stack before anyone builds them.',
  ]);
}
console.log(root);
