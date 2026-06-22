---
title: Pack Publishing Guide
description: How to package, version, document, and publish a VPFX shaderpack.
---

# VPFX Pack Publishing Guide

This document explains how to package, version, describe, test, and publish a VPFX shaderpack.

It is written for VPFX pack authors who already have a working pack and want to share it with other players or submit it for community testing.

Before publishing a pack, you should already understand:

```text
00 - Community Quick Start
02 - Pack Author Quick Start
03 - Pack Manifest Format
04 - Post Effect Graph Format
05 - VPFX Uniform Reference
06 - VPFX shadow_depth Guide
07 - Common Errors and Troubleshooting
```

Do not publish a pack before it can load successfully in-game.

---

## 1. What publishing means

Publishing a VPFX pack means more than uploading a zip file.

A good release should include:

```text
A correctly packaged VPFX pack zip
A clear pack name
A pack version
A short description
A changelog
Screenshots or videos
Compatibility notes
Known limitations
Required VPFX version
Support or feedback instructions
```

Players should be able to answer these questions quickly:

```text
What does this pack do?
Which VPFX version does it require?
Does it use shadow_depth?
Is it experimental?
How do I install it?
How do I report issues?
```

---

## 2. Do not publish broken zip layouts

The most common publishing mistake is an incorrect zip layout.

Correct:

```text
my_pack.zip
├─ pack.json
├─ post_effect/
│  └─ main.json
└─ shaders/
   └─ composite/
      ├─ final.vsh
      └─ final.fsh
```

Incorrect:

```text
my_pack.zip
└─ my_pack/
   ├─ pack.json
   ├─ post_effect/
   └─ shaders/
```

If users must open an extra folder before seeing `pack.json`, the zip is packaged incorrectly.

Before publishing, open the zip and confirm that `pack.json` is immediately visible at the root.

---

## 3. Recommended release file name

Use a clear file name.

Recommended format:

```text
<pack_id>-<version>.zip
```

Examples:

```text
cinematic_tone_pack-1.0.0.zip
shadow_depth_debug-0.1.0.zip
warm_vignette_pack-1.2.3.zip
```

Avoid:

```text
shader.zip
new.zip
final.zip
final2.zip
test.zip
VPFX Pack.zip
```

A clear file name makes bug reports and user support much easier.

---

## 4. Pack ID and release name

Your `pack_id` should stay stable across releases.

Example:

```json
"pack_id": "cinematic_tone_pack"
```

Do not change `pack_id` just because you are releasing a new version.

Good:

```text
cinematic_tone_pack 1.0.0
cinematic_tone_pack 1.1.0
cinematic_tone_pack 1.2.0
```

Bad:

```text
cinematic_tone_pack
cinematic_tone_pack_new
cinematic_tone_pack_final
cinematic_tone_pack_v2_real
```

The display name can be prettier:

```json
"name": "Cinematic Tone Pack"
```

But the `pack_id` should remain stable and machine-friendly.

---

## 5. Versioning recommendation

Use semantic-style versioning when possible:

```text
MAJOR.MINOR.PATCH
```

Examples:

```text
1.0.0
1.1.0
1.1.1
2.0.0
```

Recommended meaning:

```text
PATCH:
Bug fixes only. No major visual redesign.

MINOR:
New effects, new options, new passes, improved visuals, still compatible with the same general expectations.

MAJOR:
Large visual redesign, major structure change, breaking behavior, or a pack identity change.
```

For early test releases, use labels:

```text
0.1.0-preview
0.2.0-beta
1.0.0
```

Do not call a pack `1.0.0` if it is still a proof of concept with major known breakage.

---

## 6. Recommended maturity labels

Use clear labels so players understand what they are downloading.

### Stable

Use this when:

```text
The pack loads reliably.
The pack has been tested by multiple people.
There are no known major visual bugs.
The pack has screenshots and documentation.
```

### Beta

Use this when:

```text
The pack is mostly usable.
Some bugs may remain.
Visual tuning may still change.
You want broader testing.
```

### Preview

Use this when:

```text
The pack demonstrates a new feature.
The visuals may change significantly.
Some parts may be incomplete.
```

### Experimental

Use this when:

```text
The pack uses unstable VPFX features.
The pack uses shadow_depth in advanced ways.
The pack may break between VPFX versions.
The pack is meant for testing, not normal gameplay.
```

Recommended tag examples:

```text
[Stable]
[Beta]
[Preview]
[Experimental]
[Debug]
```

---

## 7. Minimum release checklist

Before publishing, check:

```text
The pack zip has pack.json at the root.
pack.json is valid JSON.
pack_id is valid and stable.
version is correct.
entry_post_effect points to an existing file.
post_effect/main.json is valid.
The graph writes to minecraft:main.
Shader files exist under shaders/.
The pack loads in the VPFX menu.
F10 reload works.
The pack works in at least one normal world.
latest.log does not contain VPFX validation errors.
The release includes a changelog.
The release includes at least one screenshot if it is a visual pack.
Known limitations are listed.
```

For shadow packs, also check:

```text
capabilities.shadow_depth is true.
targets.shadow_depth exists.
The graph reads vulkanpostfx:shadow_depth correctly.
The pack does not treat shadow_depth as scene_depth.
The pack explains that shadow features are experimental if needed.
```

---

## 8. Recommended test matrix before release

You do not need to test everything, but you should test enough to avoid obvious problems.

### Basic test

```text
Launch the game.
Enter a world.
Open the VPFX menu with F7.
Select the pack.
Confirm the pack loads.
Press F10.
Confirm reload works.
Run /vpfx off.
Confirm vanilla rendering returns.
Run /vpfx reload builtin.
Confirm VPFX still works.
```

### Visual test

```text
Daytime
Nighttime
Caves
Water
Lava
Rain if relevant
Nether if relevant
End if relevant
Third-person view if relevant
Inventory or UI if your effect affects UI
```

### Shadow test

For packs using shadows:

```text
Flat ground
Walls
Stairs
Entities
Player model
Held item
Block entities
Camera rotation stability
F9 shadow depth debug
```

Important:

```text
If the shadow changes shape only when the player rotates the camera, mention it as a known issue or fix it before publishing.
```

---

## 9. Recommended release description

A good release description should be short but useful.

Template:

```text
<Pack Name> <Version>

Short description:
<One or two sentences explaining what the pack does.>

Main features:
- Feature 1
- Feature 2
- Feature 3

Requirements:
- Minecraft version:
- VPFX version:
- Fabric client:
- Required VPFX capabilities:

Known limitations:
- Limitation 1
- Limitation 2

Install:
Place the zip file into .minecraft/shaderpacks/ and select it from the VPFX menu.

Feedback:
Please include VPFX version, pack version, screenshots, and latest.log when reporting issues.
```

Example:

```text
Cinematic Tone Pack 1.0.0

Short description:
A lightweight VPFX color grading pack with warm highlights, mild contrast, and a subtle vignette.

Main features:
- Warm cinematic tone mapping
- Subtle vignette
- No scene depth required
- No shadow_depth required

Requirements:
- VPFX 1.15.5 or newer
- Minecraft Fabric client
- scene_color capability

Known limitations:
- No custom shadow receiver
- No bloom
- No temporal effects

Install:
Place cinematic_tone_pack-1.0.0.zip into .minecraft/shaderpacks/ and select it from the VPFX menu.

Feedback:
Please include screenshots, VPFX version, pack version, and latest.log when reporting issues.
```

---

## 10. Changelog format

Every public release should include a changelog.

Recommended format:

```text
# <Pack Name> <Version>

## Added
- ...

## Changed
- ...

## Fixed
- ...

## Known Issues
- ...
```

For small releases, a shorter format is fine:

```text
# <Pack Name> <Version>

- Added warm tone mapping.
- Added subtle vignette.
- Fixed reload issue with the final composite pass.
- Known issue: colors may be too dark in the Nether.
```

Avoid vague changelogs:

```text
updated stuff
fixed bugs
new things
```

Better:

```text
Fixed black screen caused by missing minecraft:main output.
Reduced vignette strength at night.
Added support for scene depth fog.
```

---

## 11. Screenshot guidelines

Visual packs should include screenshots.

Good screenshots show:

```text
The effect clearly
Before/after comparison if possible
Daytime scene
Night scene if relevant
A normal gameplay view
Any shadow feature if the pack uses shadows
```

For shadow packs, useful screenshots include:

```text
Normal view
F9 shadow debug view
Entity shadows
Player shadows
Block entity shadows
A simple test scene with walls and flat ground
```

Avoid only posting extremely edited or cinematic screenshots if the pack is meant for normal gameplay. Players should know what the pack actually looks like.

---

## 12. Video guidelines

Videos are useful for:

```text
Animated effects
Reload behavior
Shadow stability
Camera movement
Temporal effects
Before/after comparisons
```

A good short video should show:

```text
The pack being active
The visual effect
Camera rotation if shadows are involved
A few seconds of normal movement
```

For shadow-related packs, rotate the camera slowly. This helps verify that shadows do not incorrectly depend on the player view direction.

---

## 13. Required compatibility notes

Every release should mention compatibility clearly.

Recommended fields:

```text
Tested Minecraft version:
Tested VPFX version:
Requires scene_color:
Requires scene_depth:
Requires shadow_depth:
Uses custom targets:
Uses declared textures:
Uses temporal/history targets:
Uses compute:
```

Example:

```text
Tested Minecraft version: 26.2
Tested VPFX version: 1.15.5
Requires scene_color: yes
Requires scene_depth: no
Requires shadow_depth: no
Uses custom targets: no
Uses declared textures: no
Uses temporal/history targets: no
Uses compute: no
```

For a shadow pack:

```text
Tested Minecraft version: 26.2
Tested VPFX version: 1.15.5
Requires scene_color: yes
Requires scene_depth: yes
Requires shadow_depth: yes
Uses custom targets: yes
Uses declared textures: no
Uses temporal/history targets: no
Uses compute: no
```

---

## 14. Explain experimental features clearly

If your pack uses advanced or unstable features, say so.

Examples:

```text
This pack uses shadow_depth and should be considered experimental.
This pack is a debug tool, not a normal gameplay shaderpack.
This pack uses scene depth and may behave differently with some render settings.
This pack uses temporal targets and may ghost during fast movement.
```

Do not hide limitations. Clear limitations reduce bad feedback and confused users.

---

## 15. Packaging declared textures

If your pack declares textures in `pack.json`, make sure they are included.

Manifest:

```json
"textures": {
  "BlueNoise": {
    "path": "textures/blue_noise.png",
    "filter": "nearest",
    "wrap": "repeat"
  }
}
```

Zip:

```text
my_pack.zip
├─ pack.json
├─ textures/
│  └─ blue_noise.png
├─ post_effect/
└─ shaders/
```

Check:

```text
Texture names are GLSL-safe.
Texture paths exist.
filter is linear or nearest.
wrap is clamp or repeat.
The texture file is not accidentally excluded from the zip.
```

---

## 16. Do not include unnecessary files

Avoid shipping:

```text
.DS_Store
Thumbs.db
desktop.ini
old shader backups
unused large images
source editor folders
temporary logs
unrelated screenshots
crash reports
```

A clean pack is easier to inspect and debug.

Recommended pack contents:

```text
pack.json
post_effect/
shaders/
textures/ if needed
README.md optional
LICENSE optional
CHANGELOG.md optional
```

Do not include Minecraft client jars, VPFX mod jars, or unrelated mods inside your pack zip.

---

## 17. README recommendation

A public pack should include a README, either inside the zip or next to the download.

Recommended README structure:

```text
# Pack Name

Short description.

## Features
- ...

## Requirements
- VPFX version:
- Minecraft version:
- Required capabilities:

## Installation
Place the zip into .minecraft/shaderpacks/ and select it from the VPFX menu.

## Controls
F7 opens the VPFX pack menu.
F10 reloads the current pack.

## Known Issues
- ...

## Credits
- ...

## License
- ...
```

A README is especially important if the pack uses `shadow_depth`, custom targets, or declared textures.

---

## 18. License and credits

If you publish a pack, include a license.

Common choices:

```text
MIT
Apache-2.0
CC0
CC-BY-4.0
All rights reserved
Custom license
```

Choose one deliberately.

If you use assets, LUTs, noise textures, code snippets, or shader logic from other authors, credit them.

Do not copy shader code from other packs unless the license allows it.

Do not claim compatibility with or ownership of another project’s shaderpack unless you actually have permission.

---

## 19. External asset rules

If your pack includes textures or lookup tables:

```text
Make sure you have permission to redistribute them.
Include credits.
Include license information.
Avoid using copyrighted assets without permission.
Use your own generated noise textures when possible.
```

If you are not sure whether you can redistribute an asset, do not include it.

---

## 20. Security and safety

A VPFX pack should contain shader and data files only.

Do not ask users to:

```text
Run unknown scripts
Install random executables
Replace Minecraft core files
Download modified clients from untrusted sources
Disable antivirus
Install unrelated mods without explanation
```

A normal VPFX pack should be installed by placing a zip file into:

```text
.minecraft/shaderpacks/
```

Keep distribution simple and safe.

---

## 21. Discord release post template

Use this template when posting a pack in Discord.

```text
# <Pack Name> <Version>

Status:
Stable / Beta / Preview / Experimental / Debug

Short description:
<What does the pack do?>

Requirements:
- VPFX version:
- Minecraft version:
- Requires scene_color:
- Requires scene_depth:
- Requires shadow_depth:
- Uses custom targets:
- Uses compute:

Main features:
- ...
- ...
- ...

Known limitations:
- ...
- ...

Install:
Place the zip into .minecraft/shaderpacks/ and select it from the VPFX menu with F7.

Reload:
Use F10 or /vpfx reload.

Feedback:
Please include VPFX version, pack version, screenshots/video, steps to reproduce, and latest.log.

Download:
<attach zip or provide release location>
```

Keep the first Discord post readable. Put long technical details in a README or documentation file.

---

## 22. Bug report instructions for your users

Tell users what information you need.

Recommended:

```text
When reporting an issue, please include:
- VPFX version
- Pack version
- Minecraft version
- Operating system
- GPU
- Screenshot or video
- Steps to reproduce
- latest.log
```

For shadow packs, also ask:

```text
- Does F9 shadow debug show the caster?
- Does the issue change when rotating the camera?
- Does /vpfx reload builtin work?
- Does /vpfx off remove the issue?
```

This helps separate pack bugs from VPFX runtime bugs.

---

## 23. How to label known issues

Do not hide known issues.

Good known issue examples:

```text
Known issue:
The pack is too dark in the Nether.

Known issue:
shadow_depth debug view may look empty during weak-light periods.

Known issue:
This pack does not implement a custom shadow receiver.

Known issue:
This pack has not been tested on AMD GPUs.

Known issue:
This pack uses experimental scene depth effects and may show artifacts underwater.
```

Bad known issue examples:

```text
none
maybe broken
idk
```

If you do not know, say what has and has not been tested.

---

## 24. When to mark a pack as experimental

Mark your pack as experimental if it:

```text
Uses shadow_depth beyond simple debug display.
Uses temporal/history targets.
Uses unusual target chains.
Depends on behavior not documented as public API.
Was tested only on one machine.
May break between VPFX versions.
```

Experimental does not mean bad.
It means users should expect rough edges.

---

## 25. When to update required VPFX version

Increase the required VPFX version when your pack starts depending on a newer feature.

Examples:

```text
A pack starts using shadow_depth.
A pack starts using new built-in uniforms.
A pack starts using declared textures.
A pack depends on a graph validation behavior added recently.
A pack depends on a bug fix in VPFX.
```

Your release notes should say:

```text
Requires VPFX 1.15.5 or newer.
```

or:

```text
Requires VPFX 1.16.0 or newer.
```

Do not simply say “latest” unless you truly do not know.

---

## 26. Pack update policy

When updating a pack, try to preserve user expectations.

For patch updates:

```text
Do not radically change the visual style.
Fix bugs.
Improve compatibility.
Keep settings and structure similar.
```

For minor updates:

```text
Add features.
Improve visuals.
Add optional passes.
Improve performance.
```

For major updates:

```text
Large visual redesign is acceptable.
Breaking changes are acceptable.
Clearly explain what changed.
```

---

## 27. Handling old versions

Keep old versions available when possible.

Old versions are useful because:

```text
Players may need compatibility with older VPFX builds.
A new release may introduce a bug.
Pack authors may compare behavior.
Bug reports may refer to an older release.
```

If you remove old versions, mention that only the latest version is supported.

---

## 28. Performance notes

If your pack is expensive, say so.

Mention things like:

```text
Multiple fullscreen passes
High-resolution custom targets
Half-resolution or quarter-resolution targets
shadow_depth sampling
Large PCF kernels
Temporal effects
Declared texture lookups
```

Example:

```text
Performance note:
This pack uses four fullscreen passes and one half-resolution blur chain. It may be heavier than simple color grading packs.
```

Players appreciate honest performance notes.

---

## 29. Recommended performance categories

You can label performance roughly:

```text
Light:
Single pass, scene_color only.

Medium:
Multiple passes or custom targets.

Heavy:
Blur chains, depth effects, shadow_depth sampling, or temporal effects.

Debug:
Not intended for gameplay performance.
```

Example:

```text
Performance: Light
```

or:

```text
Performance: Heavy / Experimental
```

---

## 30. Pack showcase submission checklist

If you want your pack considered for a community showcase, include:

```text
Pack zip
Pack name
Pack version
Short description
Screenshots
Known limitations
Required VPFX version
License
Author name
Changelog
Whether it is stable, beta, preview, experimental, or debug
```

For shadow packs, include:

```text
Whether it uses shadow_depth
Whether it is only a debug view
Whether it implements any custom receiver logic
What shadow features were tested
```

---

## 31. What makes a good showcase pack

A good showcase pack is:

```text
Easy to install
Clearly documented
Visually understandable
Stable enough to test
Not misleading about compatibility
Packaged correctly
Versioned clearly
Supported by screenshots
Honest about limitations
```

A showcase pack does not need to be perfect.
It needs to be useful and understandable.

---

## 32. What not to claim

Do not claim:

```text
Full Iris compatibility
Full OptiFine compatibility
All shaderpacks supported
RTX support
Path tracing
Voxel ray tracing
Universal compatibility with all rendering mods
Perfect performance on all GPUs
```

unless the feature is actually implemented and tested.

Better wording:

```text
Experimental VPFX pack.
Written specifically for VPFX.
Uses VPFX scene_color and custom post-processing passes.
Uses VPFX shadow_depth for debug visualization.
```

Accurate claims build trust.

---

## 33. Recommended publishing order for new authors

If this is your first VPFX pack, publish in this order:

```text
1. Internal test zip
2. Small Discord test release
3. Beta release with screenshots
4. Stable release after feedback
```

Do not start with a huge public release if only one person has tested it.

---

## 34. Example release post

```text
# Warm Vignette Pack 1.0.0

Status:
Stable

Short description:
A lightweight VPFX color grading pack with warm highlights, mild contrast, and a subtle vignette.

Requirements:
- VPFX version: 1.15.5 or newer
- Minecraft version: 26.2
- Requires scene_color: yes
- Requires scene_depth: no
- Requires shadow_depth: no
- Uses custom targets: no
- Uses compute: no

Main features:
- Warm color grading
- Mild contrast boost
- Subtle vignette
- Single-pass design

Known limitations:
- No bloom
- No scene depth effects
- No shadow receiver

Performance:
Light

Install:
Place warm_vignette_pack-1.0.0.zip into .minecraft/shaderpacks/ and select it from the VPFX menu with F7.

Reload:
Use F10 or /vpfx reload.

Feedback:
Please include VPFX version, pack version, screenshots/video, steps to reproduce, and latest.log.
```

---

## 35. Example changelog

```text
# Warm Vignette Pack 1.0.0

## Added
- Added warm color grading.
- Added mild contrast adjustment.
- Added subtle vignette.

## Known Issues
- The effect may be too warm in the Nether.
- No scene depth support.
- No shadow_depth support.
```

Patch update:

```text
# Warm Vignette Pack 1.0.1

## Fixed
- Reduced vignette strength at night.
- Fixed incorrect sampler name in the example graph.

## Changed
- Slightly reduced warm tint intensity.
```

---

## 36. Final pre-release checklist

Before publishing, confirm:

```text
Zip root contains pack.json.
No extra nested folder.
pack.json format_version is 1.
pack_id is stable and valid.
version is updated.
entry_post_effect exists.
post_effect/main.json is valid.
At least one pass writes to minecraft:main.
All shader files exist.
All declared textures exist.
The pack appears in /vpfx list.
The pack loads from the F7 menu.
F10 reload works.
latest.log has no VPFX validation errors.
You tested /vpfx off.
You tested /vpfx reload builtin.
You included a description.
You included compatibility notes.
You included known limitations.
You included a changelog.
You included screenshots if it is a visual pack.
You included license or usage terms.
```

---

## 37. Summary

A good VPFX pack release should be:

```text
Correctly packaged
Clearly named
Properly versioned
Tested in-game
Documented
Honest about requirements
Honest about limitations
Easy to install
Easy to report issues for
```

The VPFX ecosystem will be healthier if packs are easy to test, easy to debug, and clear about what they require.

Publishing is not just uploading a zip.
Publishing is making the pack understandable for players and useful for the community.
