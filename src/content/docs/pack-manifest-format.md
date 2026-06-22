---
title: Pack Manifest Format
description: Current VPFX pack.json manifest format for external shaderpack authors.
---

# VPFX Pack Manifest Format

This document describes the current VPFX `pack.json` format.

A VPFX pack is recognized as a native VPFX pack only when the zip root contains:

```text
pack.json
```

The manifest file tells VPFX:

```text
What this pack is called
Which pack format version it uses
Where the entry post-effect graph is located
Which runtime capabilities it requires
Which runtime targets it expects
Which external textures it declares
Which optional metadata should be shown or searched
```

This document is based on the current VPFX v1 manifest parser.

---

## 1. File location

`pack.json` must be placed at the root of the zip.

Correct:

```text
my_vpfx_pack.zip
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
my_vpfx_pack.zip
└─ my_vpfx_pack/
   ├─ pack.json
   ├─ post_effect/
   └─ shaders/
```

If `pack.json` is hidden inside an extra folder, VPFX will not detect the zip as a VPFX native pack.

---

## 2. Minimal valid manifest

A minimal VPFX manifest looks like this:

```json
{
  "format_version": 1,
  "pack_id": "example_minimal_pack",
  "name": "Example Minimal VPFX Pack",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "A minimal VPFX post-processing pack.",
  "entry_post_effect": "post_effect/main.json",
  "capabilities": {
    "scene_color": true,
    "scene_depth": false,
    "shadow_depth": false,
    "custom_targets": true,
    "compute": false
  }
}
```

This is enough for a simple scene-color post-processing pack.

---

## 3. Complete manifest example

A more complete manifest can include target mappings, declared textures, and metadata:

```json
{
  "format_version": 1,
  "pack_id": "example_cinematic_pack",
  "name": "Example Cinematic VPFX Pack",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "A cinematic color grading pack for VPFX.",
  "entry_post_effect": "post_effect/main.json",

  "capabilities": {
    "scene_color": true,
    "scene_depth": true,
    "shadow_depth": true,
    "custom_targets": true,
    "compute": false
  },

  "targets": {
    "shadow_depth": "vulkanpostfx:shadow_depth"
  },

  "textures": {
    "BlueNoise": {
      "path": "textures/blue_noise.png",
      "filter": "nearest",
      "wrap": "repeat"
    },
    "ColorLut": {
      "path": "textures/lut.png",
      "filter": "linear",
      "wrap": "clamp"
    }
  },

  "metadata": {
    "homepage": "https://example.com",
    "license": "MIT",
    "tags": [
      "cinematic",
      "color-grading",
      "shadow-depth"
    ]
  }
}
```

Do not copy this full example for your first pack unless you actually need these features. Start minimal.

---

## 4. Field summary

| Field               |    Type |    Required | Description                                          |
| ------------------- | ------: | ----------: | ---------------------------------------------------- |
| `format_version`    | integer |         Yes | VPFX manifest format version. Currently must be `1`. |
| `pack_id`           |  string |         Yes | Unique pack identifier and namespace.                |
| `name`              |  string |         Yes | Display name shown to users.                         |
| `version`           |  string |         Yes | Pack version string.                                 |
| `author`            |  string |          No | Pack author. Defaults to empty string.               |
| `description`       |  string |          No | Short pack description. Defaults to empty string.    |
| `entry_post_effect` |  string |         Yes | Path to the main post-effect graph inside the zip.   |
| `capabilities`      |  object |         Yes | Runtime features required by this pack.              |
| `targets`           |  object | Conditional | Required when `capabilities.shadow_depth` is `true`. |
| `textures`          |  object |          No | Declared external texture files.                     |
| `metadata`          |  object |          No | Optional homepage, license, and tags.                |

---

## 5. `format_version`

Required.

```json
"format_version": 1
```

Current supported value:

```text
1
```

If another value is used, the pack will fail to load.

Invalid:

```json
"format_version": 2
```

The current parser rejects unsupported versions with:

```text
F002 format_version
```

---

## 6. `pack_id`

Required.

```json
"pack_id": "example_minimal_pack"
```

`pack_id` is the pack’s unique identifier. It is also used as the namespace in shader references.

Allowed pattern:

```text
^[a-z0-9_.-]{3,64}$
```

Allowed characters:

```text
lowercase letters
numbers
underscore _
dot .
hyphen -
```

Length:

```text
3 to 64 characters
```

Good examples:

```text
example_minimal_pack
cinematic_tone_pack
author.cool_pack
debug-shadow-view
vpfx_bsl_tone_showcase
```

Bad examples:

```text
Example Pack
My Shader!!!
ab
cool pack
shader@pack
```

Invalid `pack_id` values are rejected with:

```text
F003 pack_id
```

---

## 7. `name`

Required.

```json
"name": "Example Minimal VPFX Pack"
```

This is the human-readable display name.

It must be a non-empty string.

Good:

```json
"name": "Warm Cinematic Tone"
```

Bad:

```json
"name": ""
```

---

## 8. `version`

Required.

```json
"version": "1.0.0"
```

This is the pack version, not the VPFX manifest format version.

Recommended style:

```text
1.0.0
1.1.0-beta
0.2.3-preview
```

The parser only requires this to be a non-empty string.

Do not confuse:

```json
"format_version": 1
```

with:

```json
"version": "1.0.0"
```

`format_version` is the VPFX manifest format.
`version` is your pack version.

---

## 9. `author`

Optional.

```json
"author": "Your Name"
```

If omitted, VPFX stores it as an empty string.

Recommended:

```json
"author": "PlayerName"
```

or:

```json
"author": "Team Name"
```

---

## 10. `description`

Optional.

```json
"description": "A warm cinematic tone mapping pack."
```

If omitted, VPFX stores it as an empty string.

Keep it short. The description may be used in UI search or pack listings.

Good:

```json
"description": "Warm color grading with subtle contrast and vignette."
```

Bad:

```json
"description": "best shader ever"
```

---

## 11. `entry_post_effect`

Required.

```json
"entry_post_effect": "post_effect/main.json"
```

This path must exist inside the zip.

If the file does not exist, the pack will fail to load with:

```text
F005 entry_post_effect
```

Correct:

```text
my_pack.zip
├─ pack.json
└─ post_effect/
   └─ main.json
```

Manifest:

```json
"entry_post_effect": "post_effect/main.json"
```

Incorrect:

```json
"entry_post_effect": "post_effect/does_not_exist.json"
```

---

## 12. `capabilities`

Required.

```json
"capabilities": {
  "scene_color": true,
  "scene_depth": false,
  "shadow_depth": false,
  "custom_targets": true,
  "compute": false
}
```

All five fields are required and must be booleans.

| Field            |    Type | Meaning                                      |
| ---------------- | ------: | -------------------------------------------- |
| `scene_color`    | boolean | The pack requires access to scene color.     |
| `scene_depth`    | boolean | The pack requires scene depth support.       |
| `shadow_depth`   | boolean | The pack requires VPFX shadow depth support. |
| `custom_targets` | boolean | The pack requires custom render targets.     |
| `compute`        | boolean | The pack requires compute shader support.    |

Current VPFX runtime capabilities are:

```text
scene_color: true
scene_depth: true
shadow_depth: true
custom_targets: true
compute: false
```

This means:

```json
"compute": true
```

is not currently supported and will fail capability validation.

For a first pack, use:

```json
"capabilities": {
  "scene_color": true,
  "scene_depth": false,
  "shadow_depth": false,
  "custom_targets": true,
  "compute": false
}
```

---

## 13. Capability rules

### 13.1 `scene_color`

Use:

```json
"scene_color": true
```

if your pack reads:

```text
minecraft:scene_color
```

Most packs should set this to `true`.

---

### 13.2 `scene_depth`

Use:

```json
"scene_depth": true
```

if your pack needs scene depth.

Scene depth is for main-camera depth effects, such as:

```text
depth fog
depth debug view
distance-based color grading
depth-aware outlines
```

Do not enable this unless your graph actually uses scene depth.

---

### 13.3 `shadow_depth`

Use:

```json
"shadow_depth": true
```

if your pack needs VPFX shadow map depth.

`shadow_depth` is not the same as scene depth.

It may contain:

```text
terrain casters
entity casters
player casters
block entity casters
```

If `shadow_depth` is enabled, the manifest must also include:

```json
"targets": {
  "shadow_depth": "vulkanpostfx:shadow_depth"
}
```

If `shadow_depth` is enabled but `targets.shadow_depth` is missing, the manifest parser rejects the pack.

---

### 13.4 `custom_targets`

Use:

```json
"custom_targets": true
```

if your graph declares custom targets in `post_effect/main.json`.

For many packs, this can be true even if the first version has no custom targets.

If you want the strictest minimal declaration for a copy pass with no custom target, you can use:

```json
"custom_targets": false
```

However, most pack authors will eventually need custom targets for blur, bloom, downsampling, or multi-pass effects.

---

### 13.5 `compute`

Current recommendation:

```json
"compute": false
```

VPFX currently reports compute support as unavailable.

Do not set:

```json
"compute": true
```

unless the runtime explicitly supports it in a future version.

---

## 14. `targets`

Conditional.

The manifest-level `targets` object is currently required when:

```json
"shadow_depth": true
```

Example:

```json
"targets": {
  "shadow_depth": "vulkanpostfx:shadow_depth"
}
```

The target mapping value must match:

```text
^[a-z0-9_.-]+:[a-z0-9_./-]+$
```

Good target identifiers:

```text
vulkanpostfx:shadow_depth
minecraft:shadow_depth
example_pack:temp
author_pack:blur/downsample_0
```

Bad target identifiers:

```text
shadow_depth
Example:Target
pack id:target
pack:/bad
```

Important:

Manifest-level `targets` is not the same thing as graph-level `targets`.

Graph-level targets are declared in:

```text
post_effect/main.json
```

Manifest-level `targets` is used as a pack-level capability contract.
For current v1 packs, the most important rule is:

```text
If capabilities.shadow_depth is true, targets.shadow_depth must exist.
```

Recommended shadow-depth mapping:

```json
"targets": {
  "shadow_depth": "vulkanpostfx:shadow_depth"
}
```

If your pack does not use shadow depth, you can omit `targets`.

---

## 15. `textures`

Optional.

The `textures` object declares extra texture files that can be used by the pack.

Example:

```json
"textures": {
  "BlueNoise": {
    "path": "textures/blue_noise.png",
    "filter": "nearest",
    "wrap": "repeat"
  },
  "ColorLut": {
    "path": "textures/lut.png",
    "filter": "linear",
    "wrap": "clamp"
  }
}
```

Each texture entry name must be a GLSL-safe identifier.

Allowed texture name pattern:

```text
^[A-Za-z_][A-Za-z0-9_]*$
```

Good names:

```text
BlueNoise
ColorLut
NoiseTex
_DitherPattern
```

Bad names:

```text
blue-noise
1Noise
my texture
noise.texture
```

---

## 16. Texture entry fields

Each texture entry is an object.

### 16.1 `path`

Required.

```json
"path": "textures/blue_noise.png"
```

The file must exist inside the zip.

If the file is missing, the pack fails to load.

Correct:

```text
my_pack.zip
├─ pack.json
└─ textures/
   └─ blue_noise.png
```

Manifest:

```json
"textures": {
  "BlueNoise": {
    "path": "textures/blue_noise.png"
  }
}
```

---

### 16.2 `filter`

Optional.

Supported values:

```text
linear
nearest
```

Default:

```text
linear
```

Examples:

```json
"filter": "linear"
```

```json
"filter": "nearest"
```

Use `nearest` for noise textures, masks, pixel-art lookup images, or exact sample patterns.

Use `linear` for smooth lookup textures.

---

### 16.3 `wrap`

Optional.

Supported values:

```text
clamp
repeat
```

Default:

```text
clamp
```

Examples:

```json
"wrap": "clamp"
```

```json
"wrap": "repeat"
```

Use `repeat` for tiling noise textures.

Use `clamp` for lookup tables, masks, and non-tiling images.

---

## 17. `metadata`

Optional.

Example:

```json
"metadata": {
  "homepage": "https://example.com",
  "license": "MIT",
  "tags": [
    "cinematic",
    "warm",
    "tone-mapping"
  ]
}
```

Supported fields:

| Field      |         Type | Required | Description                                  |
| ---------- | -----------: | -------: | -------------------------------------------- |
| `homepage` |       string |       No | Project page, download page, or author page. |
| `license`  |       string |       No | License name.                                |
| `tags`     | string array |       No | Searchable tags.                             |

If `metadata` is omitted, VPFX stores:

```text
homepage: ""
license: ""
tags: []
```

`metadata.tags` must be an array of strings.

Good:

```json
"tags": [
  "cinematic",
  "shadow-depth",
  "color-grading"
]
```

Bad:

```json
"tags": "cinematic"
```

Bad:

```json
"tags": [
  "cinematic",
  123
]
```

---

## 18. Required fields checklist

A valid VPFX v1 manifest must include:

```text
format_version
pack_id
name
version
entry_post_effect
capabilities.scene_color
capabilities.scene_depth
capabilities.shadow_depth
capabilities.custom_targets
capabilities.compute
```

If `capabilities.shadow_depth` is `true`, it must also include:

```text
targets.shadow_depth
```

---

## 19. Optional fields checklist

Optional fields:

```text
author
description
targets
textures
metadata
metadata.homepage
metadata.license
metadata.tags
```

Remember:

```text
targets becomes required when shadow_depth is enabled.
```

---

## 20. Common manifest errors

### 20.1 Missing `pack.json`

Cause:

```text
pack.json is not at the zip root.
```

Error code:

```text
F001 pack.json
```

Fix the zip layout.

---

### 20.2 Unsupported `format_version`

Cause:

```json
"format_version": 2
```

Current supported value is:

```json
"format_version": 1
```

Error code:

```text
F002 format_version
```

---

### 20.3 Invalid `pack_id`

Cause:

```json
"pack_id": "My Cool Pack!"
```

Fix:

```json
"pack_id": "my_cool_pack"
```

Error code:

```text
F003 pack_id
```

---

### 20.4 Missing entry post-effect file

Cause:

```json
"entry_post_effect": "post_effect/missing.json"
```

but the file does not exist in the zip.

Error code:

```text
F005 entry_post_effect
```

---

### 20.5 Missing required field

Cause:

```json
{
  "format_version": 1,
  "pack_id": "example_pack"
}
```

Missing required fields such as `name`, `version`, `entry_post_effect`, or `capabilities`.

Error code:

```text
F006
```

---

### 20.6 Invalid capability object

Cause:

```json
"capabilities": {
  "scene_color": true
}
```

All capability booleans are required.

Correct:

```json
"capabilities": {
  "scene_color": true,
  "scene_depth": false,
  "shadow_depth": false,
  "custom_targets": true,
  "compute": false
}
```

---

### 20.7 `shadow_depth` enabled without `targets.shadow_depth`

Invalid:

```json
{
  "format_version": 1,
  "pack_id": "shadow_pack",
  "name": "Shadow Pack",
  "version": "1.0.0",
  "entry_post_effect": "post_effect/main.json",
  "capabilities": {
    "scene_color": true,
    "scene_depth": false,
    "shadow_depth": true,
    "custom_targets": true,
    "compute": false
  }
}
```

Valid:

```json
{
  "format_version": 1,
  "pack_id": "shadow_pack",
  "name": "Shadow Pack",
  "version": "1.0.0",
  "entry_post_effect": "post_effect/main.json",
  "capabilities": {
    "scene_color": true,
    "scene_depth": false,
    "shadow_depth": true,
    "custom_targets": true,
    "compute": false
  },
  "targets": {
    "shadow_depth": "vulkanpostfx:shadow_depth"
  }
}
```

Error code:

```text
F007 targets.shadow_depth
```

---

### 20.8 Invalid texture name

Invalid:

```json
"textures": {
  "blue-noise": {
    "path": "textures/blue_noise.png"
  }
}
```

Correct:

```json
"textures": {
  "BlueNoise": {
    "path": "textures/blue_noise.png"
  }
}
```

Error code:

```text
F008 textures.<name>
```

---

### 20.9 Missing texture file

Cause:

```json
"textures": {
  "BlueNoise": {
    "path": "textures/blue_noise.png"
  }
}
```

but the zip does not contain:

```text
textures/blue_noise.png
```

Error code:

```text
F008 textures.BlueNoise.path
```

---

### 20.10 Unsupported texture filter or wrap

Invalid:

```json
"filter": "trilinear"
```

Valid:

```json
"filter": "linear"
```

or:

```json
"filter": "nearest"
```

Invalid:

```json
"wrap": "mirror"
```

Valid:

```json
"wrap": "clamp"
```

or:

```json
"wrap": "repeat"
```

Error code:

```text
F008
```

---

## 21. Legacy fields not used by VPFX v1 native packs

Do not use the old legacy fields for new VPFX native packs.

Avoid:

```json
"id": "example_pack"
```

Use:

```json
"pack_id": "example_pack"
```

Avoid:

```json
"entry_effect_key": "some_effect"
```

VPFX v1 native packs use:

```json
"entry_post_effect": "post_effect/main.json"
```

The current native pack path is based on `pack.json` with `format_version`, `pack_id`, `entry_post_effect`, and `capabilities`.

---

## 22. Recommended manifest for first packs

For a simple first pack:

```json
{
  "format_version": 1,
  "pack_id": "my_first_vpfx_pack",
  "name": "My First VPFX Pack",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "My first VPFX scene-color post-processing pack.",
  "entry_post_effect": "post_effect/main.json",
  "capabilities": {
    "scene_color": true,
    "scene_depth": false,
    "shadow_depth": false,
    "custom_targets": true,
    "compute": false
  },
  "metadata": {
    "license": "MIT",
    "tags": [
      "minimal",
      "color"
    ]
  }
}
```

This is the recommended starting point.

---

## 23. Recommended manifest for shadow-aware packs

For a pack that uses VPFX shadow depth:

```json
{
  "format_version": 1,
  "pack_id": "my_shadow_pack",
  "name": "My Shadow VPFX Pack",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "A VPFX pack that uses shadow_depth.",
  "entry_post_effect": "post_effect/main.json",
  "capabilities": {
    "scene_color": true,
    "scene_depth": true,
    "shadow_depth": true,
    "custom_targets": true,
    "compute": false
  },
  "targets": {
    "shadow_depth": "vulkanpostfx:shadow_depth"
  },
  "metadata": {
    "tags": [
      "shadow-depth",
      "shadow-receiver",
      "experimental"
    ]
  }
}
```

Only use this after you understand how to sample `shadow_depth`.

---

## 24. Recommended manifest for packs with declared textures

For a pack using texture inputs:

```json
{
  "format_version": 1,
  "pack_id": "my_texture_pack",
  "name": "My Texture VPFX Pack",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "A VPFX pack using a declared blue noise texture.",
  "entry_post_effect": "post_effect/main.json",
  "capabilities": {
    "scene_color": true,
    "scene_depth": false,
    "shadow_depth": false,
    "custom_targets": true,
    "compute": false
  },
  "textures": {
    "BlueNoise": {
      "path": "textures/blue_noise.png",
      "filter": "nearest",
      "wrap": "repeat"
    }
  },
  "metadata": {
    "tags": [
      "blue-noise",
      "dithering"
    ]
  }
}
```

The file must exist at:

```text
textures/blue_noise.png
```

inside the zip.

---

## 25. Validation behavior

When VPFX scans a zip:

```text
1. It checks whether pack.json exists at the zip root.
2. It parses the manifest.
3. It checks format_version.
4. It validates pack_id.
5. It checks entry_post_effect exists.
6. It parses capabilities.
7. It parses manifest-level targets if present.
8. It parses declared textures if present.
9. It parses optional metadata if present.
10. It parses the post-effect graph.
11. It validates graph targets and passes.
12. It checks shader files exist.
13. It preprocesses shader includes.
```

If the pack fails validation, VPFX logs an error and skips the pack.

---

## 26. Manifest authoring checklist

Before sharing a pack, check:

```text
pack.json is at the zip root.
format_version is 1.
pack_id matches ^[a-z0-9_.-]{3,64}$.
name is not blank.
version is not blank.
entry_post_effect points to an existing file.
capabilities contains all five boolean fields.
compute is false.
targets.shadow_depth exists if shadow_depth is true.
declared texture names are GLSL-safe.
declared texture paths exist in the zip.
metadata.tags is an array of strings.
```

---

## 27. Next document

This document only covers `pack.json`.

The next document should cover:

```text
04 - Post Effect Graph Format
```

That document explains:

```text
post_effect/main.json
targets
passes
inputs
outputs
sampler names
custom targets
scene depth
shadow depth inputs
self-read/write rules
```
