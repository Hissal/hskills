# Placeholder art and asset gate for game projects

Research for [#63](https://github.com/Hissal/skill-collection/issues/63), inspected 2026-10-23. It answers two questions left open by [Theme: game design and feel](https://github.com/Hissal/skill-collection/issues/47#issuecomment-6366449606), which rejected the art donors (Unity workflow A11, D6, D7; gamedev J10) as skills:

1. **Placeholder art and assets** for prototypes, jams and solo work. The main team project has artists and is out of scope.
2. **An asset gate for artist-made assets** in a team Unity project, with no AI involved.

Out of scope: agent-as-art-judge (already rejected) and full AI art production pipelines (noted for later on the map).

Labels used below: **Documented** = stated by the owning source, linked. **Observed** = seen in this session by reading files or running a command. **Inference** = my reasoning from those. Every recommendation is *proposed*; the owner decides in a HITL session.

Prices and plan terms are rolling pages read on 2026-10-23. They change often; recheck before paying.

## Summary of proposals (*proposed*)

- **No generator skill.** Placeholder art becomes one knowledge reference, `placeholder-assets.md`, owned by `gamedev-guide` (gamedev pack, model-invoked guide, already listed). `game-brief` step 4's "optional placeholder look line" and `game-jam`'s "prepare the boring parts" reach it. **Idle cost: one needs-table row, about 20 tokens; no new description.**
- The reference is a **ladder**, not a tool pick: primitives and greybox, then CC0 packs, then procedural SFX, then a generator. The generator rung names what works today with its licence line, and defaults to what the owner already pays for.
- **Keep from the donors:** one style line plus one anchor image; a family generated as one grid in one call; chain to a fixed promoted anchor, never the last output; size and centre measured back from the files by a script; a provenance list of AI-made files, kept for store disclosure. **Drop:** model-specific prompt locks, critique scores, re-roll policies and staged registries.
- **Engine import** of generated placeholders (pixels per unit, pivot, filter mode, alpha) is Unity-pack material reached through the guide's extension point (ADR 0003). The gamedev reference never names Unity.
- **Asset gate: no skill and no contract format.** Unity's built-ins enforce import settings, and the official CLI and Project Auditor cover integrity and budget diagnostics. What is left (naming, per-folder rules, "scenes use only approved assets") is ordinary project code. Propose one short Unity-pack reference, `asset-import-rules.md`, under the existing `unity` guide. **Idle cost: one row, about 20 tokens.** Whether the team wants an approved-only rule at all is the owner's call.

## 1. Placeholder art and assets

### 1.1 What the donors do (observed, pinned)

- **`codex-visual`** (A11): 2D art through the Codex CLI image model, held on-style by `/ART_DIRECTION.md` ("Single source of truth... Read before EVERY generation") and locked anchors under `ArtDirection/anchors/`. Sets are generated as one grid sheet, then sliced and normalised by scripts. Its consistency table pairs global style with a style anchor, a set with a "grid one-shot", and work over time with "reference-chaining... a FIXED promoted anchor, never the previous output". The guarantee for size and centre comes from "normalize + gate". [SKILL.md L30-L35, L180-L183](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/codex-visual/SKILL.md#L180-L183).
- Its **geometry gate** is titled "position and size are never the model's job". `audit_set.py` reads each shipped PNG's core bounding box, centre offset and fill against an expected fraction, and exits 1 on "a centre offset over 2 px, a fill more than 0.02 off F". The gate exists because a keyer leaves stray corner pixels, so a set can be consistent and still wrong: "consistency is not correctness". It also records that "three siblings generated one at a time are three different objects (bboxes 15–25% apart)" while "the same three on one 2x2 came back identical to the pixel". These are the donor author's measurements, not reproduced here. [geometry-gate.md](https://github.com/tipoLi5890/unity-dev-skills/blob/68eb299d15ffe581fe3f8c156b609087515b0f1e/skills/codex-visual/reference/geometry-gate.md).
- **D6 `unity-asset-pipeline`**: a nine-stage pipeline from brief to an approved-asset registry. A YAML `asset-contract.yaml` per asset carries PPU, pivot, scale and camera, plus `qa.*` flags that validators set. Python validators and a scene-walk script fail any scene art not in the registry. A bounded re-roll policy keys off a critique score ("below ~2.25/3"). [SKILL.md](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-asset-pipeline/SKILL.md).
- **D7** wraps paid APIs: Gemini images, PixelLab pixel art, Tripo 3D and ElevenLabs audio. **J10** pins open assets as test fixtures. The ledger texts are in `research/ledgers/unity-workflow-repos.md` and `research/ledgers/gamedev-repos.md`.

### 1.2 Generators that work from Windows today

Ordered by the rung where each fits. "Agent-reachable" means a coding agent can drive it without the GUI: CLI, HTTP API or MCP.

#### Hosted image

| Tool | Agent-reachable | Cost (documented) | Output terms (documented) | Notes |
|---|---|---|---|---|
| **Codex CLI built-in `imagegen`** | Yes: `$imagegen` interactively, or `codex exec` | Billed against the ChatGPT plan. No API key in the default mode | OpenAI terms: the user owns the Output (OpenAI [Terms of Use](https://openai.com/policies/row-terms-of-use/), "you... own the Output"; page returned 403 to direct fetch, wording confirmed via search snippet) | The official skill makes built-in `image_gen` the default, and "Does not require `OPENAI_API_KEY`". It asks for a transparent background and preserves alpha. Files land under `$CODEX_HOME/generated_images/` and must be copied into the project. [imagegen SKILL.md](https://github.com/openai/codex/blob/7d592f6dd9988e349e3164feaa21d0fc14bbac8a/codex-rs/skills/src/assets/samples/imagegen/SKILL.md). This is the `codex-visual` donor's engine. |
| **OpenAI Images API** (`gpt-image-2`, `gpt-image-1-mini`) | Yes: HTTP API, or the same skill's CLI fallback | GPT Image 2 at 1024×1024 is about $0.006 low, $0.053 medium, $0.211 high. GPT Image 1 Mini is $0.005 to $0.036 ([image generation guide](https://developers.openai.com/api/docs/guides/image-generation), [pricing](https://developers.openai.com/api/docs/pricing)) | As above | Needs `OPENAI_API_KEY`. Search results showed the guide's token rates and the pricing page disagreeing; recheck before budgeting. |
| **Gemini image ("Nano Banana" family)** | Yes: Gemini API | Nano Banana 2.1 is about $0.034 per 1K image, original Nano Banana $0.039, Pro $0.134; batch is about half ([pricing](https://ai.google.dev/gemini-api/docs/pricing)) | Google "won't claim ownership over that content". **EEA, Switzerland and UK: "You may use only Paid Services when making API Clients available to users"** in those regions, and paid data terms apply to all use there ([Gemini API terms](https://ai.google.dev/gemini-api/terms), updated 2026-04-28) | D7's `unity-image-generator` engine. |
| **Unity AI Generators** (in-Editor) | Partly: the Editor UI and Unity AI Assistant. A CLI/MCP route to generators was **not verified** | Personal: a trial, then "converts to a $10/month subscription". Pro includes it ([unity.com/features/ai](https://unity.com/features/ai)). Credits meter the Assistant and Generators ([AI credits terms](https://unity.com/legal/unity-ai-credits-terms)) | "You own all your input and output data when using Unity's AI tools, regardless of the Partner Model", but "it remains your responsibility to ensure you have the rights to use content in your final build" ([models and partners](https://unity.com/legal/unityai-models-partners), updated 2026-08-19). Partner terms also apply ([third-party AI terms](https://unity.com/legal/third-party-ai-terms), updated 2026-07-28) | Covers sprite, texture, material, sound and animation. Partners: Layer (FLUX sprites), Scenario (FLUX, GPT-Image, Gemini, Seedream; 3D, skyboxes, textures, sound) and Uthana (animation). Requires Unity 6.3 per the Assistant 2.7 manual. Generated assets "are tagged with AI-generated metadata" (features page). Lowest setup burden inside Unity, but it is the Editor's tool, not the agent's. |
| **PixelLab** (pixel art) | Yes: HTTP API and an MCP server (`/mcp`, "Vibe coding") | Subscription with a limited free trial. The plan page did not render; prices are unverified | FAQ, on commercial use: "Yes, we only ask that you do not train new models with the images" ([FAQ](https://www.pixellab.ai/docs/faq)). The terms page did not render | D7's `unity-pixel-art` engine. Characters, animation, rotations and map tiles ([docs index](https://www.pixellab.ai/sitemap.xml)). Best fit for a pixel-art jam. |

#### Local image (Windows, own GPU)

- **ComfyUI** runs on Windows through the desktop app ("the easiest and best way... for new users") or a portable build for NVIDIA or AMD. It "Runs fully offline", and `--offline` disables the optional paid API nodes ([README](https://github.com/Comfy-Org/ComfyUI/blob/bc5f880dbdd43e426077f42ccec53bb577ffee9f/README.md)). It is GPL-3.0 and serves an HTTP API, which is how `comfyui-asset-generation` drives it. Setup burden: GPU drivers, multi-GB model downloads and workflow JSON. Cost: free after hardware.
- **Model licences** (from each model's Hugging Face licence tag at the pinned revision; the FLUX dev clause read from the licence text):
  - [FLUX.2 klein 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B/tree/e7b7dc27f91deacad38e78976d1f2b499d76a294): Apache-2.0.
  - [FLUX.1 schnell](https://huggingface.co/black-forest-labs/FLUX.1-schnell/tree/741f7c3ce8b383c54771c7003378a50191e9efe9): Apache-2.0.
  - [SDXL base 1.0](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/tree/462165984030d82259a11f4367a4eed129e94a7b): OpenRAIL++.
  - FLUX.1 dev uses a non-commercial model licence, but "You may use Output for any purpose (including for commercial purposes)". It requires content filtering or a review of output, plus AI disclosure "to the extent required under applicable law" ([licence §2(d)-(e)](https://github.com/black-forest-labs/flux/blob/802fb4713906133fcbd0d8dc5351620ca4773036/model_licenses/LICENSE-FLUX1-dev)).
  - Stability's Community License (SD 3.5, Stable Audio Open) is free for "annual revenue of less than US $1,000,000" ([community licence](https://stability.ai/community-license-agreement)).

#### 3D

| Tool | Reach | Terms (documented) |
|---|---|---|
| **Meshy** (hosted) | Web and API | Free plan: 100 credits a month, output under CC BY 4.0 (commercial use with attribution). Paid plans give private ownership ([pricing docs](https://docs.meshy.ai/pricing), [commercial-use help](https://intercom.help/meshy/en/articles/16102098-can-i-use-meshy-assets-commercially)) |
| **Tripo** (hosted) | Web and API | Free tier is non-commercial or public; commercial use needs a paid plan. **Unverified**: only secondary sources were found, and they disagree on numbers |
| **TRELLIS.2** (local) | Python | [MIT](https://huggingface.co/microsoft/TRELLIS.2-4B/tree/af44b45f2e35a493886929c6d786e563ec68364d) (weights licence tag). Windows setup burden not tested |
| **Hunyuan3D 2.1** (local) | Python / ComfyUI | **"This licence agreement does not apply in the European Union, United Kingdom and South Korea"**, and use of "Output... outside the Territory is unlicensed" ([LICENSE L3, L18, L40](https://huggingface.co/tencent/Hunyuan3D-2.1/blob/0b94677654c57bb9a6b6845cd7b704ccf551d327/LICENSE)). Excluded for anyone working from those regions |

Inference: for placeholders, a primitive or a CC0 kit beats generated 3D on time. AI meshes still need decimation and rig work, which is what `unity-3d-models` and `unity-rigged-character` exist for. Generated 3D belongs on the top rung only.

#### Audio

| Tool | Reach | Terms (documented) |
|---|---|---|
| **jfxr** (procedural SFX, browser) | Browser, or an npm library | "Any sound you create with jfxr is entirely yours... including commercial projects". Attribution optional ([README](https://github.com/ttencate/jfxr/blob/e971e4c183beddaff3abcebb77f2eaae17a2b83b/README.md)) |
| **ElevenLabs** SFX and music (hosted) | API | Free plan is non-commercial and requires attribution. Paid plans include a commercial licence "provided you're not using Beta Services" ([help centre](https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform)) |
| **Unity Sound Generator** | Editor | As for Unity AI above |
| **Stable Audio Open 1.0** (local) | Python / ComfyUI | Stability Community License (revenue cap above) |
| **MusicGen** (local) | Python | Weights [CC-BY-NC-4.0](https://huggingface.co/facebook/musicgen-small/tree/4c8334b02c6ec4e8664a91979669a501ec497792). Inference: avoid for anything shipped |

#### Non-AI baseline

[Kenney](https://kenney.nl/support): "all game assets... are public domain licensed (CC0)", commercial use allowed, attribution not required. J10's "pinned open assets as fixtures" idea fits here. A CC0 kit gives one consistent style for free, which is exactly what generation struggles to give.

### 1.3 Shipping: store disclosure (documented)

- **Steam** asks developers to disclose **pre-generated** AI content: "Any kind of content that ships with your game and is consumed by players". Live-generated content needs guardrails described. "Efficiency gains through the use of these tools is not the focus" ([content survey](https://partner.steamgames.com/doc/gettingstarted/contentsurvey)). The page does not address placeholders that are replaced before shipping. Inference: under the "ships with your game" wording, a fully replaced placeholder is not disclosed. A placeholder that survives into a build is.
- **itch.io** asks creators to "accurately tag your project if it contains materials produced by generative AI". It sets no stated penalty for games, but "strictly enforcing disclosure for all game asset pages... may result in delisting" ([quality guidelines](https://itch.io/docs/creators/quality-guidelines)).
- Inference: both stores make the **provenance list** the useful artefact: which files are AI-made, from which tool, and whether they were replaced. That list answers the disclosure form and keeps track of placeholders that never got replaced. It is the one part of D6's contract worth keeping for jams.

### 1.4 How the style-consistency pattern carries over (inference)

The pattern holds independently of tool, because its key step is deterministic code, not the model:

1. **One style line, one anchor.** For a jam, a style doc shrinks to one line: palette, outline or no outline, view angle, pixels per unit or texel density. The anchor is one approved image, or one CC0 sprite from the kit being matched. `game-brief`'s "optional placeholder look line" is that line.
2. **Generate the family, not the member.** Siblings go in one grid in one call. Hosted models that take image references (Codex `imagegen`, Gemini, PixelLab, Unity Sprite Generator) can be fed the anchor. Local ComfyUI does the same through img2img, IP-Adapter or a LoRA, at a higher setup cost.
3. **Chain to a fixed anchor**, never to the previous output, or the style drifts.
4. **Measure, don't trust.** Size, centre, baseline and alpha fringe are read back from the shipped files by a script that exits non-zero. This generalises past images: audio peak or loudness, and mesh triangle count and bounds, are measured the same way.
5. **Normalise in code.** Canvas size, padding and pivot are set by the slicer or importer, not asked of the model.

What does not carry over: `codex-visual`'s model-specific numbers, such as the fixed 1,572,864-pixel canvas and the per-grid cell sizes. They belong to one model and one version. D6's critique-score re-rolls are art judging, which is rejected.

### 1.5 Proposal for placeholders (*proposed*)

- **Address:** `placeholder-assets.md`, a reference owned by `gamedev-guide` (gamedev pack, model-invoked guide). No new skill and no new description. **Idle cost:** one needs-table row, about 20 tokens. Read only when a placeholder look is being set up.
- **Contents**, in order:
  1. The ladder: greybox, CC0 kit, procedural SFX, then a generator.
  2. The section 1.4 pattern as five rules.
  3. A one-screen generator table: tool, reach, licence line and region caveats. It is dated and points at the vendor pages rather than restating prices.
  4. The provenance-list rule, with the store-disclosure links.
- **Default generator:** the one the owner already pays for. Codex `imagegen` (no key, plan-billed) or Unity AI if the project's plan includes it. PixelLab when the jam is pixel art. Local ComfyUI only if the owner wants offline or free-after-hardware generation.
- **Engine half** (Unity pack, reached through the guide's extension point): import a generated 2D placeholder with pixels per unit, pivot, filter mode, compression and alpha settings from the style line. It defers to the official `sprite-editor`, `manage-sprite-atlas` and `2d-pixel-perfect` skills where they apply. Write it only if the owner takes the gamedev reference.
- **Scripts:** a small measure-and-normalise script (bounding box, centre, fill, fringe) is the one piece of code worth carrying, adapted from `codex-visual`'s `audit_set.py` idea, not copied. Its Python and the donor's thresholds need checking on the owner's machine. *Owner's call* whether the reference ships it or describes it.
- **Reject** as skills: `codex-visual`, `comfyui-asset-generation`, `unity-3d-models`, `unity-rigged-character` and D7, as the theme already decided. Keep the five rules and the provenance list.

## 2. Asset gate for artist-made assets

### 2.1 What the donor proposes (observed)

D6's gate is a YAML contract per asset, Python validators, an approved folder plus registry, and a scene-walk that fails on any file-based art reference outside the registry ("exit 2 = assembly-time bypass"). It is built around generated source art and an agent scene-builder. [SKILL.md](https://github.com/tea-x-random/unity-game-skills/blob/dafb97ef00f94e64e42e6260bc6b3af74cc83dad/skills/unity-asset-pipeline/SKILL.md).

### 2.2 What already covers it

**Unity built-ins (documented):**

- **Preset Manager default presets with glob filters.** `glob:"foldername/**.fbx"` matches subfolders. Filters are case-sensitive and "applied in order from top to bottom". Defaults apply to "newly created components and newly imported assets". Unity "doesn't apply default asset importer presets when you select Reimport on an existing asset" ([default presets](https://docs.unity.com/en-us/engine/6000.3/manual/assets-and-media/presets/default)).
- **Presets by folder** through an `AssetPostprocessor` in `OnPreprocessAsset`: "Unity applies presets from every folder between the project root and the asset's own folder". An extended script registers custom dependencies, so changing a preset reimports the affected assets ([presets by folder](https://docs.unity3d.com/6000.3/Documentation/Manual/DefaultPresetsByFolder.html)).
- **`AssetPostprocessor`** hooks in "before or after importing assets" (`OnPreprocessTexture`, `OnPostprocessTexture`, `OnPreprocessModel`, `OnPreprocessAudio`, `OnPostprocessAllAssets`). "If you change the code of an AssetPostprocessor, you should default to incrementing its version number using GetVersion" ([API](https://docs.unity3d.com/6000.3/Documentation/ScriptReference/AssetPostprocessor.html)). `AssetImportContext.LogImportError` "Logs an error message encountered during import... Traces in the console are linked to the asset". The page does not say whether it fails the import ([API](https://docs.unity3d.com/6000.3/Documentation/ScriptReference/AssetImporters.AssetImportContext.LogImportError.html)). Naming, maximum size, compression and read/write checks all fit here.
- **Project Auditor** is in the Editor from 6.4 and a package before that; rules come from `com.unity.project-auditor-rules`. It reports "assets whose import settings or file organization affect startup times, runtime memory usage, or performance" ([introduction](https://docs.unity3d.com/6000.4/Documentation/Manual/project-auditor/project-auditor-introduction.html)). Its asset views show texture read/write, mipmaps and audio load type, with configurable size thresholds for audio clips ([assets view](https://docs.unity3d.com/6000.4/Documentation/Manual/project-auditor/assets-view-reference.html); details via search, not fully read). No custom-rule API was found on the pages read.

**Official Unity skills and CLI (observed).** `Unity-Technologies/skills` HEAD is now **`51f530f4de53da76b4f5e1b9f57d5622df35ae83`**, one publish commit past the baseline's `9d28210`. It added six skills, including `new-unity-project`, `build-live-game` and `create-2d-physics`.

- [`project-auditor-fixes`](https://github.com/Unity-Technologies/skills/blob/51f530f4de53da76b4f5e1b9f57d5622df35ae83/skills/project-auditor-fixes/SKILL.md) runs `unity command audit`, reads the CSV and fixes "settings issues on assets... by type" in reviewable commits. That is the official budget-diagnostics workflow.
- [`unity projects verify`](https://github.com/Unity-Technologies/skills/blob/51f530f4de53da76b4f5e1b9f57d5622df35ae83/skills/unity-cli/references/projects-templates.md#L432-L470) is an Editor-free CI gate for `META_MISSING`, `GUID_DUPLICATE`, conflict markers and manifest validity. [`unity vcs hooks`](https://github.com/Unity-Technologies/skills/blob/51f530f4de53da76b4f5e1b9f57d5622df35ae83/skills/unity-cli/references/version-control.md#L147-L158) installs pre-commit integrity hooks, and `vcs doctor` checks LFS patterns.
- [`optimize-audio`](https://github.com/Unity-Technologies/skills/blob/51f530f4de53da76b4f5e1b9f57d5622df35ae83/skills/optimize-audio/SKILL.md) covers audio import settings, and `manage-sprite-atlas` covers texture settings for atlases.
- **Gap.** A grep of the whole tree for `AssetPostprocessor`, `Preset` and import-settings terms found no skill that teaches import rules or presets. `sprite-editor` says "Do NOT use AssetPostprocessor" for its own snippets ([L62](https://github.com/Unity-Technologies/skills/blob/51f530f4de53da76b4f5e1b9f57d5622df35ae83/skills/sprite-editor/SKILL.md#L62)). This matches the baseline report's gap 14, "custom importers and `AssetPostprocessor`" (`research/unity-baseline.md`).

**Existing third-party packages:** not surveyed in depth. Inference: an import-rule postprocessor is a small amount of project code, and taking a dependency for it buys little.

### 2.3 Does a gate pay off? (inference)

Split the donor's gate into parts:

| Part | Cost | Pay-off on a 9-person team | Covered by |
|---|---|---|---|
| Import settings by folder or type | Low: presets plus a short postprocessor | High: artists drop files in and settings are right on first import | Unity built-ins (the "how" is undocumented in official skills) |
| Naming, maximum size, compression and read/write checks at import | Low: the same postprocessor, logging errors linked to the asset | Medium to high: catches mistakes at the artist's desk, not at review | Built-in hooks; nothing ships the rules |
| Budget diagnostics (memory, audio, mipmaps) | None to write | Medium: periodic, not per-commit | Project Auditor plus official `project-auditor-fixes` |
| Meta, GUID and LFS integrity | None | High | Official CLI `projects verify`, `vcs hooks` |
| Per-asset YAML contract | High: a schema, validators and a contract per asset | Low: duplicates `.meta` importer settings and drifts from them | Nothing needed |
| "Scenes use only approved assets" | Medium: an EditMode test walking `AssetDatabase.GetDependencies` of scenes against an allowed-folders rule | Depends: pays only if unapproved or WIP art keeps reaching scenes | Project code |

So the cheap half pays off and is built in. The contract-and-registry half pays off only against a failure the team actually has. A folder convention (`Art/WIP` vs `Art/Final`) plus a dependency test gives "approved only" without a registry, and the folder rule can drive presets too.

### 2.4 Proposal for the gate (*proposed*)

- **No skill and no contract format.** Reject D6 `unity-asset-pipeline` as a mechanism, as the theme already did.
- **Address:** `asset-import-rules.md`, a reference under the existing `unity` guide (Unity pack, model-invoked guide; no new description). **Idle cost:** one routes row, about 20 tokens.
- **Contents:**
  1. Glob-filtered default presets and their first-import-only limit.
  2. Folder presets with the dependency-registering postprocessor.
  3. Postprocessor rules: naming, size and compression, `LogImportError`, and the `GetVersion` bump.
  4. An optional EditMode test for "scenes reference only assets under the approved folders".
  5. Defer to `project-auditor-fixes` for budget audits and to `projects verify` / `vcs hooks` for integrity.

  It is reached when the agent is asked to set up or change import rules. It never installs a gate unasked.
- **Project configuration**, not skill content: the folder names, the rule table and whether the approved-only test exists live in the project. The **configuration rule** in the map's Notes applies.
- **Owner's call** in the HITL session: does the main team want an approved-only rule at all, or only import presets? This research cannot answer that from the repo.

## Overlap

- **With the theme decisions:** `game-brief`'s placeholder look line and `game-jam` are the callers. Art judging stays rejected. Full AI pipelines stay on the map's Not yet specified.
- **With the Unity baseline:** none duplicated. The gate reference defers to `project-auditor-fixes`, `projects verify`, `vcs hooks`, `optimize-audio`, `manage-sprite-atlas`, `sprite-editor` and `2d-pixel-perfect`.
- **With ledgers:** A11, D6, D7 and J10 resolved as idea-only here. J10's pinned open assets fit the CC0 rung.

## Inspection versus validation

- **Read:** the ticket, the theme resolution, the Unity pack resolution, the donor ledgers and donor files at their pinned SHAs, and the official Unity skills via a fresh clone at `51f530f4`.
- **Fetched:** Hugging Face model metadata and two licence texts.
- **Web:** vendor pages read with WebFetch or search. Several vendor pages (PixelLab plans and terms, OpenAI terms) did not render. Where a fact rests only on a search snippet or secondary source it is marked above. Tripo is unverified.
- **Not run:** no generator, no ComfyUI, no Unity Editor, and none of the donor scripts. No price, quality or setup-time claim was tested on the owner's machine.
- **Quality fit:** this pass makes no quality ranking beyond what the vendors and donors state. Ranking output quality would itself be art judging; the owner's own trial in a jam is the evidence.
