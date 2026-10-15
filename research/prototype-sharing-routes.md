# Routes for sharing prototypes with teammates

Authored by OpenAI GPT-6.1 Sol on 2026-10-15. Official web sources below were accessed on 2026-10-15. Prices are USD list prices before applicable taxes, discounts and usage charges.

This resolves [Research: routes for sharing prototypes with teammates](https://github.com/Hissal/skill-collection/issues/61) under [Wayfinder: personal skill collection blueprint](https://github.com/Hissal/skill-collection/issues/1). This is research for later HITL setup and pack decisions. Every recommendation below is **proposed**. No service was provisioned, prototype published, configuration adopted, or skill changed.

## Scope and answer

[Theme: prototyping](https://github.com/Hissal/skill-collection/issues/44#issuecomment-6195116678) already decides that prototypes stay local by default, capture goes to a pushed throwaway branch, and requested sharing uses the project's configured route. With no configured route, ask; checkout of the capture branch remains the fallback. It also keeps core HTML prototypes single-file and offline, with no library or build step. This report does not reopen those decisions.

Proposed choices when a project configures sharing:

- For self-contained HTML, offer sending the file through the team's existing private channel first. Offer Pages when the output may be public and the repository plan supports it. A secret gist is an unlisted public copy, not private sharing.
- For web UI inside an application, offer the existing host's protected preview deployment. Share its exact deployment URL and route or variant key. Keep checkout and the project's local run command as the fallback.
- For Unity teammates who already use the project, offer the capture branch and `Prototypes/<name>` menu item. For reviewers without Unity, offer a separate player-capable capture and a build delivered through the team's existing channel. An Editor-excluded prototype does not become playable by enabling Development Build.

These are setup recommendations, not new skills, always-on rules or recurring services. They add no model-invoked description cost. The pack guide owns stack-specific advice, consistent with [ADR 0003](https://github.com/Hissal/skill-collection/blob/20995ebb0528797798dddf6047f5413b908599db/docs/adr/0003-core-reaches-packs-through-the-pack-list.md).

## Single-file HTML routes

### GitHub Pages from a branch

Evidence: Pages serves static HTML, CSS and JavaScript. Free supports public repositories; Pro supports personal private repositories; Team and Enterprise support private repositories within their applicable account types. One project Pages site exists per repository. [What is GitHub Pages?](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

The source can be any existing branch, with `/` or `/docs` as its publishing folder. Configuring it requires repository admin or maintainer permissions. Ordinary Pages sites are public even when their repository is private. [Publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

Public visitors need only a browser, without GitHub accounts. Restricted viewing is a different feature: an organization on Enterprise Cloud can privately publish a project site from a private or internal organization repository. Viewers must authenticate and have repository read access. Personal Pro and organization Team do not supply that restriction. [Pages access control](https://docs.github.com/en/enterprise-cloud@latest/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site)

Cost: public-repository Pages can cost $0 within its limits. For private source, an eligible paid plan is required, with no extra viewer seat for a public site. GitHub advertises Team at $4/user/month and Enterprise starting at $21/user/month, with first-year qualifications on its pricing page. For nine billed members those headline rates imply $36 or $189/month, before contract differences. The public pricing page did not provide a verifiable current personal Pro amount during this investigation; check the owner's upgrade quote rather than treating the Team amount as Pro's price. No owner's subscription was inspected. [Pricing](https://github.com/pricing), [plan entitlements and Actions billing](https://docs.github.com/en/get-started/learning-about-github/githubs-plans)

Published sites have a 1 GB limit, a soft 100 GB/month bandwidth limit and a soft ten builds/hour limit for ordinary publishing. Pages has no application server. An offline sketch fits its technical shape; a backend-dependent application may not. [Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

Retention: the publishing documentation does not promise what happens to a deployed site after deleting its source branch. Do not infer that deletion either revokes the live URL or preserves it forever. GitHub documents an explicit unpublish operation that removes the current deployment. [Unpublishing](https://docs.github.com/en/pages/getting-started-with-github-pages/unpublishing-a-github-pages-site)

Proposed setup: offer Pages only after recording whether public output is acceptable, source repository eligibility, the publishing branch/folder, URL and cleanup owner. Do not repoint a repository's existing production Pages site for a prototype. If using a dedicated publishing branch, label the URL as mutable and record the prototype commit separately. For several simultaneous sketches, publish explicit separate paths through an agreed project route, rather than assuming each branch gets a separate Pages site. Unpublish or remove the deployed path explicitly when feedback ends. This is a proposed operational choice, not a documented branch-deletion guarantee.

### Gist plus a preview service

Evidence: public gists are discoverable and searchable. Secret gists are unlisted, but anyone who obtains their URL can read them. Gists have independent Git histories and can be copied or downloaded. Creating one requires signing in. [Creating gists](https://docs.github.com/en/get-started/writing-on-github/editing-and-sharing-content-with-gists/creating-gists)

The first-party source of the third-party Gist HTML Preview service shows the route `https://gistpreview.github.io/?<gist-id>/<filename>`. It anonymously fetches GitHub's gist API, selects a file and writes its content into the document. It implements no recipient authentication, revision selection or private-repository login. It reads the API's inline content field, so large/truncated gist files are a compatibility unknown. [README](https://github.com/gistpreview/gistpreview.github.io/blob/12c10a2490ac8516bd4f9d3ce61d6f9e56015f26/README.md), [complete implementation](https://github.com/gistpreview/gistpreview.github.io/blob/12c10a2490ac8516bd4f9d3ce61d6f9e56015f26/main.js)

A related GitHub HTML Preview service rewrites HTML and script loading, and can fall back to a CodeTabs proxy. That is another party receiving the source URL and serving the content path. It is not an authenticated way to render a private repository. [Implementation](https://github.com/htmlpreview/htmlpreview.github.com/blob/787b673198b8f13ac16384325cd380c5c68cf219/htmlpreview.js)

Access and cost: a recipient needs a browser, without GitHub or preview-service accounts for anonymously readable content. No checkout or build tools are necessary. Neither preview implementation imposes a payment step; neither source establishes an uptime commitment, durable retention promise or paid support. Treat the expected incremental price as $0, with GitHub API limits and third-party availability as constraints, rather than a contracted free hosting service.

Retention: the gist is independent of the original prototype branch, so deleting that branch does not delete the gist. The preview needs both the gist and the service to remain available. Deleting the gist does not recover copies already downloaded or forked. The simple Gist Preview route follows the gist's latest content, not the captured commit.

Proposed setup: offer only for content the team accepts as available to anyone with the link. Explain that a secret gist is not confidential, keep the capture SHA in the feedback request and test the preview itself. Do not make this the private-team default. Prefer Pages or a file when the extra intermediary has no benefit.

### claude.ai artifacts

Evidence: current shared artifacts require viewers to have a Claude account. Pro/Max support link sharing; Team/Enterprise can restrict sharing to their organization, with external access controlled by an owner. A legacy artifact published from chat on Free/Pro/Max is the exception and allows anonymous viewing; features using Claude require sign-in. Legacy Team/Enterprise chat sharing requires account access, and project artifacts also require project access. The docs warn that shared chat artifacts expose chat attachments and files. [Share artifacts](https://support.claude.com/en/articles/9547008-share-artifacts)

Cost: Free is $0. Pro is $20/month or $200 paid annually. Team standard seats are $25/month or $20/seat/month billed annually. A paid viewer plan is not stated as necessary for ordinary external viewing; organization-only viewing needs the appropriate organization access. AI-backed behavior consumes the viewer's applicable limits. [Claude pricing](https://claude.com/pricing)

Retention: branch deletion is unrelated to the hosted artifact. Its access depends on the artifact remaining shared or published, account and organization policy, and service availability. Legacy unpublishing revokes access and cannot be reversed for that artifact. No permanent hosting commitment was established.

Proposed setup: offer when the prototype already exists as an artifact and the reviewers' account requirements are acceptable. Record whether it is current sharing or legacy publishing; do not promise anonymous viewing from a generic claude.ai URL. The standard shared-artifact link is not an account-free HTML host. Do not import a working offline file into Claude solely to create a sharing dependency. Test its actions and Copy state in the artifact sandbox before claiming parity with the local file. No authenticated artifact was created or opened in this research.

### Send the HTML file

Proposed procedure: deliver the captured `.html` through the team's existing approved attachment or file-sharing route. The reviewer downloads it and opens it in a desktop browser. A gist ZIP or repository archive is another delivery vehicle; GitHub supports archives at a branch, tag or specific commit. [Downloading archives](https://docs.github.com/en/repositories/working-with-files/using-files/downloading-source-code-archives)

Access: whoever the chosen channel permits, then anyone the recipient forwards the file to. A local copy needs no host or viewer account, Git client, server or build tools. The sender and recipient may need accounts for the delivery channel. Some channels block HTML attachments or show only a static preview; download and extract a ZIP if that channel permits it. Those channel rules were not audited here.

Cost: normally $0 incremental on an existing channel, subject to its storage and account limits. Retention is strongest for an already-downloaded copy: it survives branch deletion, hosting cleanup and sender access changes, until the recipient deletes it. The delivery URL's retention is channel-specific. Revoking the link cannot recall local copies.

The offline single-file decision makes this route useful. Browsers can treat `file:` documents as opaque origins, which affects cross-file loading and network access. Keep assets and logic in the file and verify the actual download-open workflow; do not silently introduce a local server requirement. [MDN same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy)

Proposed setup: offer this as the first simple HTML sharing route. State the filename, capture SHA, first action, seed and feedback question. Ask reviewers to return Copy state output and their action sequence. Use project hosting when the tested dimension needs an HTTP origin or application integration.

## Web UI variants inside an application

### Existing project host preview

Proposed default for the web pack: use the host already configured for the application, with a throwaway branch, an explicit prototype route and the existing variant key. Capture the exact deployment URL plus the route and variant. A branch alias follows later pushes; it is not a stable record of what a reviewer tested. Keep the source SHA alongside either URL. Do not create a new hosting account or publish to production as part of choosing a default.

Host-specific evidence and constraints:

- **Vercel:** non-production branch pushes, PRs or preview CLI deploys can create previews, with distinct branch and commit URLs. A new project's first deployment is production, so a new project is not automatically a safe preview destination. [Environments](https://vercel.com/docs/deployments/environments) Authentication requires authorized Vercel accounts; shareable links bypass login for their holders and can be revoked. Hobby allows only one external user and one shareable link per account. [Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication), [shareable links](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/sharable-links) Hobby is $0 for personal, non-commercial use. Pro starts at $20/month, developer seats are $20/month, viewer seats are free, and usage may add cost. Do not prescribe Hobby for the owner's professional team work. [Pricing](https://vercel.com/pricing)
- **Netlify:** Deploy Previews use PRs; branch deploys are an alternative when no PR is wanted. [Deploy Previews](https://docs.netlify.com/deploy/deploy-types/deploy-previews/) Current credit-based Free is $0 with 300 monthly credits, Personal $9/month, and Pro starts at $20/month with unlimited members. Private organization repository support is listed for Pro. Preview/branch deploys are included, but traffic and compute consume credits. [Pricing](https://www.netlify.com/pricing/) Check visibility rather than assuming anonymity: current Free/Personal private projects are owner-only; Pro can invite team members or use a shared password. A public deployment needs only a browser; a password needs its credential; private team viewing requires login. [Protection and project visibility](https://docs.netlify.com/manage/security/secure-access-to-sites/password-protection/)
- **Cloudflare Pages:** previews are public by default. The Pages Access toggle restricts them to the Cloudflare account, and multi-user account membership can admit teammates. Anonymous viewing needs only a browser; protected viewing needs the configured identity access. [Preview deployment access](https://developers.cloudflare.com/pages/configuration/preview-deployments/) Free supports 500 builds/month, one concurrent build and unlimited active previews; Functions use Workers quotas. Thus static previews can have $0 incremental hosting cost within those limits. Any separate Access entitlement or broader identity policy needs a project-specific quote; it was not audited. [Pages limits](https://developers.cloudflare.com/pages/platform/limits/)

Retention is separate from Git branch lifetime:

- Vercel currently documents default pre-production retention of 30 days for Hobby and 180 days for Pro/Enterprise, subject to configured policies and exceptions. The latest preview of an active Git branch is protected from retention cleanup. Deleting the branch or closing/merging its PR removes that exception, so deletion can make it eligible for later cleanup. Its current docs replace older claims of unlimited retention. Hobby's newer storage rules can delete eligible previews sooner when over its limit. [Retention](https://vercel.com/docs/deployment-retention), [Hobby storage change](https://vercel.com/changelog/hobby-projects-now-retain-fewer-deployments-to-free-up-storage)
- Netlify normally deletes eligible deploys after 30 days on free plans or 90 on paid plans. Published production and latest successful production/branch deploys have exceptions; a Deploy Preview is not a permanent archive. [Manage deploys](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/)
- Cloudflare keeps previous hashed preview URLs when a branch alias advances and documents explicit deletion. Its cited pages do not promise a fixed lifetime after source-branch deletion. [Preview aliases and deletion](https://developers.cloudflare.com/pages/configuration/preview-deployments/)

Inference: deployment objects may outlive a deleted branch, but none of these sources establishes a universal branch-delete cleanup contract. Record the host's actual retention setting and delete or revoke previews explicitly. Do not promise either automatic removal or indefinite survival. App authentication, database access and environment credentials remain separate from deployment access; a browser-only preview can still require an app account.

Proposed setup facts: existing host/project, preview trigger, build/run command, prototype URL path, reviewer access method, non-production data source, current plan and spending limit, exact-deployment URL convention, retention and cleanup owner. Prefer existing protected team access over a public link for internal work. An owner may choose another route.

### Capture branch and local application

Access follows the repository. For a private repository, viewers need an authorized GitHub identity to obtain it; they also need Git or a source archive, the project's runtime/package manager and local run instructions. A browser handles the UI once the project runs. Use a separate checkout when preserving current work matters. A branch is source delivery, not a remotely hosted browser preview.

Cost is normally $0 incremental for existing collaborators and local tooling; dependency services, LFS, build resources and private package access may cost extra. A local clone/archive survives remote branch deletion. A branch URL does not. A commit URL identifies the version but should not be promised as permanent storage for otherwise unreachable commits. Proposed default: retain the pushed capture branch through the feedback period and put SHA, run command, route and required test credentials in the handoff. This remains the already-decided fallback.

## Unity routes

### Teammate checkout and menu

The fork's current prototype workflow uses `Assets/_Prototypes/<name>/`, captures `.meta` files too, and exposes one `Prototypes/<name>` menu item. A scene prototype opens its scene and host and enters Play; a logic prototype opens an EditorWindow. It tells reviewers not to save the host scene. These are source-workflow facts, not a decision to adopt the Unity skill. [Fork workflow at inspected SHA](https://github.com/Hissal/mattpocock-skills-unity/blob/1713fa13b84a977ea72813726d1d4f27cff5a1f0/skills/unity/unity-prototyping/SKILL.md)

Proposed teammate handoff: give the capture branch and SHA, project path, exact Editor version from `ProjectSettings/ProjectVersion.txt`, needed modules/packages and assets, menu item, variant controls, expected first screen and feedback question. Fetch the branch into a separate clone/worktree, obtain any LFS content, open it with the matching Editor, allow import/compilation, then use the menu. This reduces disruption to a teammate's working checkout, at the cost of import time and local disk space. A menu path only works if that captured source compiles. Unity's `MenuItem` API defines static Editor menu commands. [MenuItem](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/MenuItem.html)

Access follows the repository and any separately licensed dependencies. Reviewers need Git or an archive, a Unity account/license and the matching Editor, plus hardware capable of running the project. No new prototype hosting service is necessary. Cost is $0 incremental for already-licensed teammates, plus local resources. Unity Personal is free within eligibility; the official games pricing page lists Pro as required above $200,000 annual revenue/funding, at $210/month or from $2,310/year. Do not infer Personal eligibility from the prototype being unpaid or temporary. [Unity pricing](https://unity.com/products)

Retention: a clone with its assets survives branch deletion. A menu-link handoff does not itself retain the remote source. Keep the capture branch during review; afterward, branch deletion and local checkout cleanup are separate operations.

### Editor-excluded code versus a playable build

Evidence: Unity supports an Editor-platform assembly for Editor scripts. Assembly define constraints condition compilation/reference on scripting symbols. `UNITY_EDITOR` is distinct from `DEVELOPMENT_BUILD`. [Creating assemblies](https://docs.unity3d.com/6000.0/Documentation/Manual/assembly-definitions-creating.html), [assembly importer](https://docs.unity3d.com/6000.0/Documentation/Manual/class-AssemblyDefinitionImporter.html), [symbol reference](https://docs.unity3d.com/6000.0/Documentation/Manual/scripting-symbol-reference.html)

The fork deliberately uses a different setup for attachable scene components: `autoReferenced: false` with `defineConstraints: ["UNITY_EDITOR"]`, rather than an Editor-platform assembly or `Editor` folder. Without an asmdef, it wraps prototype scripts in `#if UNITY_EDITOR`. Its scenes stay outside build profiles. The fork states that the component setup avoids the Editor-assembly attachment restriction. This report read that claim but did not reproduce it in an Editor. [Fork isolation and validation](https://github.com/Hissal/mattpocock-skills-unity/blob/1713fa13b84a977ea72813726d1d4f27cff5a1f0/skills/unity/unity-prototyping/SKILL.md#isolation)

Inference from these facts: ordinary player builds omit this prototype code, including development players. Editor-only menu items and EditorWindows cannot be the player's entry point. `autoReferenced: false` alone does not exclude code from a player. Excluding scripts also does not prove all prototype assets are absent if production assets reference them.

For a reviewer without the Editor, propose a separate player-capable capture on the throwaway branch. Put the playable logic and scene components in runtime-compatible code, keep any build/menu tooling in an Editor assembly, supply a runtime entry scene and variant controls, and use a dedicated prototype build profile. Keep production references and scene lists clean. This changes the capture's packaging and requires an actual build/run check; do not claim that changing one checkbox converts the Editor prototype.

Development Build adds diagnostic symbols and Profiler support and defines `DEVELOPMENT_BUILD`; it does not supply `UnityEditor` APIs. Use it when feedback needs diagnostics. A release-mode prototype player may suit ordinary feel feedback better when profiling overhead affects the dimension under test. [Build Profiles reference](https://docs.unity3d.com/6000.0/Documentation/Manual/build-profiles-reference.html)

### Deliver a Unity player

Proposed route: zip the complete desktop build for the reviewer's target OS and deliver it through the team's existing controlled build/file channel. The reviewer needs compatible hardware/OS, permission to download and run it, and any app/backend test account. They do not need the Unity Editor, repository access or an Editor seat merely to run a standalone player. Platform signing, installation policy and dependencies can add friction. Mobile, console and Web builds have different distribution requirements and are outside this desktop-first recommendation.

Cost: no separate viewer Editor seat; the builder needs the appropriate Unity license and platform support. Existing build machines and delivery storage may make incremental monetary cost $0, with build time, bandwidth and storage still real costs. Paid CI/build automation, signing accounts and service-backed behavior are additional project-specific costs, not included in Unity's seat quote.

Retention: a downloaded build survives source-branch deletion. The hosted download follows its storage retention policy; its backend services can expire independently. Record OS/architecture, source SHA, build mode, entry scene, known limits and expiry with the download. Cleanup must remove hosted builds separately from source branches.

Proposed Unity pack setup should offer checkout/menu first for an established Unity team, and an existing build-delivery route for non-Editor reviewers. Record both as available project facts where relevant, including the Editor version, menu convention, target platform and actual build profile. Leave choice of prototype medium to the existing medium rule; a sharing shortcut does not justify replacing a feel experiment with HTML.

## Reading coverage, confidence and unknowns

Read in full: repository `AGENTS.md`, tracker instructions, `GLOSSARY.md`, ADRs 0001 through 0003; the map's body and comment; the assigned ticket's full body, labels and assignee, with no comments at read time; the prototyping resolution; the installed research, Wayfinder, unslop, Unity and Unity-prototyping skills. Read the pinned fork prototype workflow and both preview JavaScript implementations. The repository base was `20995ebb0528797798dddf6047f5413b908599db`.

Repository context is pinned to that base: [tracker](https://github.com/Hissal/skill-collection/blob/20995ebb0528797798dddf6047f5413b908599db/docs/agents/issue-tracker.md), [glossary](https://github.com/Hissal/skill-collection/blob/20995ebb0528797798dddf6047f5413b908599db/GLOSSARY.md), [ADR 0002](https://github.com/Hissal/skill-collection/blob/20995ebb0528797798dddf6047f5413b908599db/docs/adr/0002-every-skill-lives-in-this-repo.md), [ADR 0003](https://github.com/Hissal/skill-collection/blob/20995ebb0528797798dddf6047f5413b908599db/docs/adr/0003-core-reaches-packs-through-the-pack-list.md). Issue resolutions remain mutable tracker evidence; GitHub issue comments have no Git commit SHA.

High confidence applies to explicit current official documentation about access, compilation and published prices. Source-code conclusions apply to the pinned implementations. Proposed defaults and branch/deployment lifecycle conclusions are marked as proposals or inferences. Official pages were read for the relevant access, pricing, preview and retention sections, not every linked document or provider contract. No secondary article supplies a factual claim here.

No Unity project is present in this research checkout. Unity 6.0 documentation is a versioned example, not a claim about RaveRampage's version. No Unity compile, Play check, player build, authenticated teammate session or browser interaction with a prototype was run. Preview-service source inspection establishes behavior, not live compatibility or uptime. Failed documentation URLs were replaced with working official references where possible.

Unknowns to establish when the owner chooses a route: the project's host and plan, personal Pro upgrade price, actual viewer identities and organization policies, repository/package/asset rights, production-host collision, configured deployment retention, attachment restrictions, target Editor and runtime platform, backend lifetime, and the fidelity of any artifact sandbox. The current Vercel retention page conflicts with older indexed unlimited-retention text; this report uses the current page and records the change rather than repeating the stale promise. Netlify legacy plans differ from the current credit-based plans, so setup must identify the actual plan.

These unknowns do not block the route comparison. They block promising a particular team's price or access before inspecting its configuration. Nothing in this investigation changes an adopted skill, the glossary, ADRs, another ticket or the map.
