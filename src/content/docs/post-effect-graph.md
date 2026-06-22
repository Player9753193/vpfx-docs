---
title: Post Effect Graph Format
description: VPFX post_effect/main.json graph format reference for shaderpack authors.
---

# VPFX Post Effect Graph Format

This document describes the current VPFX `post_effect/main.json` graph format.

The graph file is referenced from `pack.json` through:

```json
"entry_post_effect": "post_effect/main.json"
```

The graph defines:

```text
Which render targets the pack declares
Which fullscreen passes the pack runs
Which inputs each pass reads
Which target each pass writes to
Which shader files each pass uses
```

This document is based on the current VPFX v1 graph parser and validator.

---

## 1. Basic structure

A VPFX post-effect graph is a JSON object with two required root fields:

```json
{
  "targets": {},
  "passes": []
}
```

Both fields are required.

| Field     |   Type | Required | Description                                                                        |
| --------- | -----: | -------: | ---------------------------------------------------------------------------------- |
| `targets` | object |      Yes | Declares custom render targets used by the graph. Can be empty.                    |
| `passes`  |  array |      Yes | Ordered list of fullscreen post-processing passes. Must contain at least one pass. |

A minimal valid graph looks like this:

```json
{
  "targets": {},
  "passes": [
    {
      "id": "final_composite",
      "debug_label": "Final Composite",
      "vertex_shader": "example_minimal_pack:composite/final",
      "fragment_shader": "example_minimal_pack:composite/final",
      "inputs": [
        {
          "sampler_name": "In",
          "target": "minecraft:scene_color"
        }
      ],
      "output": "minecraft:main"
    }
  ]
}
```

This graph reads `minecraft:scene_color`, runs one fullscreen shader pass, and writes to `minecraft:main`.

---

## 2. Execution model

VPFX v1 graph passes are executed in the order they appear in the `passes` array.

Example:

```text
passes[0] -> passes[1] -> passes[2] -> ...
```

For now, community-facing VPFX passes should be treated as fullscreen triangle passes.

A normal color grading pack usually looks like this:

```text
minecraft:scene_color
        |
        v
final_composite pass
        |
        v
minecraft:main
```

A simple two-pass pack may look like this:

```text
minecraft:scene_color
        |
        v
example_pack:temp
        |
        v
minecraft:main
```

The graph must write to:

```text
minecraft:main
```

at least once, otherwise it will not produce a visible final image and validation fails.

---

## 3. Built-in targets

VPFX currently recognizes these built-in target identifiers:

```text
minecraft:main
minecraft:scene_color
minecraft:scene_depth
minecraft:shadow_depth
vulkanpostfx:scene_depth
vulkanpostfx:shadow_depth
```

### 3.1 `minecraft:main`

`minecraft:main` is the final output target.

Use it as the output of your last visible pass:

```json
"output": "minecraft:main"
```

A graph must write to `minecraft:main` at least once.

---

### 3.2 `minecraft:scene_color`

`minecraft:scene_color` is the scene color snapshot captured before VPFX post-processing.

Most packs should start by reading this:

```json
{
  "sampler_name": "In",
  "target": "minecraft:scene_color"
}
```

In GLSL:

```glsl
uniform sampler2D InSampler;
```

---

### 3.3 `minecraft:scene_depth` and `vulkanpostfx:scene_depth`

These are scene depth input aliases.

They represent the main camera depth captured by VPFX.

Recommended target:

```text
vulkanpostfx:scene_depth
```

Example:

```json
{
  "sampler_name": "Depth",
  "target": "vulkanpostfx:scene_depth"
}
```

In GLSL:

```glsl
uniform sampler2D DepthSampler;
```

Use scene depth for effects such as:

```text
depth fog
depth debug views
distance-based color grading
depth-aware outlines
```

---

### 3.4 `minecraft:shadow_depth` and `vulkanpostfx:shadow_depth`

These are VPFX shadow depth input aliases.

Recommended target:

```text
vulkanpostfx:shadow_depth
```

Example:

```json
{
  "sampler_name": "Shadow",
  "target": "vulkanpostfx:shadow_depth"
}
```

In GLSL:

```glsl
uniform sampler2D ShadowSampler;
```

Important:

```text
shadow_depth is not scene_depth.
shadow_depth is not main camera depth.
shadow_depth uses shadow-space depth.
shadow_depth uses reversed-Z.
shadow_depth should be used with VPFX shadow uniforms.
```

Do not use `shadow_depth` in your first pack. Read the dedicated shadow guide first.

---

## 4. Custom targets

Custom targets are declared in the root `targets` object.

Example:

```json
{
  "targets": {
    "example_pack:temp": {
      "scale": 1.0,
      "use_depth": false,
      "clear_color": [0.0, 0.0, 0.0, 0.0]
    }
  },
  "passes": []
}
```

A custom target ID must match this pattern:

```text
^[a-z0-9_.-]+:[a-z0-9_./-]+$
```

Good target IDs:

```text
example_pack:temp
example_pack:bloom/downsample_0
author_pack:color_grade
debug_pack:shadow_view
```

Bad target IDs:

```text
temp
ExamplePack:Temp
example pack:temp
example_pack:/bad
```

Recommended rule:

```text
Use your pack_id as the target namespace.
```

For example, if your `pack_id` is:

```json
"pack_id": "example_pack"
```

then your custom targets should look like:

```text
example_pack:temp
example_pack:bloom/downsample_0
example_pack:history/color
```

---

## 5. Target fields

Each target definition is an object.

Supported fields:

| Field         |      Type | Required |         Default | Description                                   |
| ------------- | --------: | -------: | --------------: | --------------------------------------------- |
| `scale`       |    number |       No |           `1.0` | Relative size compared to the main screen.    |
| `use_depth`   |   boolean |       No |         `false` | Whether the target has a depth buffer.        |
| `clear_color` | number[4] |       No | runtime default | RGBA clear color.                             |
| `persistent`  |   boolean |       No |         `false` | Keeps the target alive across frames.         |
| `history`     |   boolean |       No |         `false` | Intended for previous-frame sampling.         |
| `ping_pong`   |   boolean |       No |         `false` | Intended for double-buffered history targets. |

---

## 6. `scale`

Optional.

```json
"scale": 0.5
```

`scale` controls the target size relative to the main screen.

Allowed range:

```text
0.0 < scale <= 1.0
```

Examples:

```json
"scale": 1.0
```

Full resolution.

```json
"scale": 0.5
```

Half resolution.

```json
"scale": 0.25
```

Quarter resolution.

Use scaled targets for blur, bloom, downsample, and performance-friendly intermediate effects.

Invalid:

```json
"scale": 0
```

Invalid:

```json
"scale": 2.0
```

---

## 7. `use_depth`

Optional.

Default:

```json
"use_depth": false
```

If `use_depth` is `true`, the target is created with a depth buffer.

Example:

```json
"example_pack:depth_target": {
  "scale": 1.0,
  "use_depth": true
}
```

Only enable this if you actually need to sample the target’s depth buffer with:

```json
"use_depth_buffer": true
```

Most color-only post-processing targets do not need depth.

---

## 8. `clear_color`

Optional.

```json
"clear_color": [0.0, 0.0, 0.0, 0.0]
```

It must be an array of exactly four numbers:

```text
red
green
blue
alpha
```

Examples:

```json
"clear_color": [0.0, 0.0, 0.0, 0.0]
```

```json
"clear_color": [1.0, 0.0, 1.0, 1.0]
```

Do not rely on `clear_color` as a replacement for writing all pixels in a pass. A fullscreen post-processing pass should normally cover the whole output target.

---

## 9. Persistent, history, and ping-pong targets

The graph parser currently accepts these fields:

```json
"persistent": true
```

```json
"history": true
```

```json
"ping_pong": true
```

Their intended meaning:

```text
persistent:
Keeps the target storage alive across frames.

history:
Marks the target as intended for previous-frame sampling.

ping_pong:
Uses two buffers so one can be read as previous frame while the other is written this frame.
```

For early community packs, avoid temporal targets unless you are deliberately testing temporal effects.

Recommended first-pack rule:

```text
Do not use persistent, history, or ping_pong in your first pack.
```

Start with transient targets and simple passes.

---

## 10. Pass definition

Each pass is an object inside the `passes` array.

Example:

```json
{
  "id": "final_composite",
  "debug_label": "Final Composite",
  "vertex_shader": "example_pack:composite/final",
  "fragment_shader": "example_pack:composite/final",
  "inputs": [
    {
      "sampler_name": "In",
      "target": "minecraft:scene_color"
    }
  ],
  "output": "minecraft:main"
}
```

Supported pass fields:

| Field             |   Type | Required | Description                                                          |
| ----------------- | -----: | -------: | -------------------------------------------------------------------- |
| `id`              | string |       No | Stable pass identifier. Recommended.                                 |
| `debug_label`     | string |       No | Human-readable label for logs or debugging.                          |
| `vertex_shader`   | string |      Yes | Vertex shader resource ID.                                           |
| `fragment_shader` | string |      Yes | Fragment shader resource ID.                                         |
| `inputs`          |  array |      Yes | List of target or texture inputs. Must not be empty.                 |
| `output`          | string |      Yes | Output target. Must be `minecraft:main` or a declared custom target. |

---

## 11. `id`

Optional but strongly recommended.

```json
"id": "final_composite"
```

A pass ID helps logs and diagnostics identify the pass.

Good IDs:

```text
final_composite
bloom_downsample_0
bloom_upsample_1
shadow_debug
tone_map
```

Avoid spaces and special characters.

---

## 12. `debug_label`

Optional.

```json
"debug_label": "Final Composite"
```

This is a human-readable label.

Use it for clarity:

```json
"debug_label": "Bloom Downsample 0"
```

If `id` exists, VPFX generally uses it as the stronger identity. If `id` is missing, `debug_label` may be used as a fallback identity in logs.

---

## 13. Shader references

Each pass must specify:

```json
"vertex_shader": "example_pack:composite/final",
"fragment_shader": "example_pack:composite/final"
```

Shader references use this format:

```text
namespace:path
```

The recommended namespace is your `pack_id`.

The path maps to files inside the zip:

```text
shaders/<path>.vsh
shaders/<path>.fsh
```

Example:

```json
"vertex_shader": "example_pack:composite/final"
```

requires:

```text
shaders/composite/final.vsh
```

Example:

```json
"fragment_shader": "example_pack:composite/final"
```

requires:

```text
shaders/composite/final.fsh
```

Shader paths must not:

```text
be blank
use absolute paths
contain ..
contain backslashes
```

Good shader references:

```text
example_pack:composite/final
example_pack:bloom/downsample
example_pack:debug/shadow_depth
```

Bad shader references:

```text
composite/final
example_pack:
example_pack:../final
example_pack:/final
example_pack:folder\final
```

---

## 14. Inputs

Each pass must have at least one input.

```json
"inputs": [
  {
    "sampler_name": "In",
    "target": "minecraft:scene_color"
  }
]
```

Each input must contain:

```text
sampler_name
exactly one of target or texture
```

Valid target input:

```json
{
  "sampler_name": "In",
  "target": "minecraft:scene_color"
}
```

Valid texture input:

```json
{
  "sampler_name": "BlueNoise",
  "texture": "BlueNoise"
}
```

Invalid input with both `target` and `texture`:

```json
{
  "sampler_name": "Bad",
  "target": "minecraft:scene_color",
  "texture": "BlueNoise"
}
```

Invalid input with neither:

```json
{
  "sampler_name": "Bad"
}
```

---

## 15. `sampler_name`

Required.

```json
"sampler_name": "In"
```

The sampler name must match:

```text
^[A-Za-z_][A-Za-z0-9_]*$
```

Good sampler names:

```text
In
Color
Depth
Shadow
BlueNoise
_ColorLut
```

Bad sampler names:

```text
1Input
color-texture
scene color
shadow.depth
```

The GLSL uniform name is:

```text
<sampler_name>Sampler
```

Example:

```json
"sampler_name": "In"
```

GLSL:

```glsl
uniform sampler2D InSampler;
```

Example:

```json
"sampler_name": "Shadow"
```

GLSL:

```glsl
uniform sampler2D ShadowSampler;
```

Sampler names must be unique within one pass.

Invalid:

```json
"inputs": [
  {
    "sampler_name": "In",
    "target": "minecraft:scene_color"
  },
  {
    "sampler_name": "In",
    "target": "vulkanpostfx:scene_depth"
  }
]
```

---

## 16. Target inputs

A target input reads from a render target.

Example:

```json
{
  "sampler_name": "In",
  "target": "minecraft:scene_color"
}
```

The `target` value can be:

```text
a built-in target
a custom target declared in the root targets object
```

Built-in examples:

```text
minecraft:scene_color
vulkanpostfx:scene_depth
vulkanpostfx:shadow_depth
```

Custom target example:

```text
example_pack:temp
```

A custom target must be declared before it can be used in the graph.

---

## 17. Read order rule

Custom targets must be written by an earlier pass before a later pass reads them.

Valid:

```json
{
  "targets": {
    "example_pack:temp": {
      "scale": 1.0,
      "use_depth": false
    }
  },
  "passes": [
    {
      "id": "write_temp",
      "vertex_shader": "example_pack:composite/copy",
      "fragment_shader": "example_pack:composite/copy",
      "inputs": [
        {
          "sampler_name": "In",
          "target": "minecraft:scene_color"
        }
      ],
      "output": "example_pack:temp"
    },
    {
      "id": "final",
      "vertex_shader": "example_pack:composite/final",
      "fragment_shader": "example_pack:composite/final",
      "inputs": [
        {
          "sampler_name": "Temp",
          "target": "example_pack:temp"
        }
      ],
      "output": "minecraft:main"
    }
  ]
}
```

Invalid:

```json
{
  "targets": {
    "example_pack:temp": {
      "scale": 1.0,
      "use_depth": false
    }
  },
  "passes": [
    {
      "id": "bad_read",
      "vertex_shader": "example_pack:composite/final",
      "fragment_shader": "example_pack:composite/final",
      "inputs": [
        {
          "sampler_name": "Temp",
          "target": "example_pack:temp"
        }
      ],
      "output": "minecraft:main"
    }
  ]
}
```

The second example reads `example_pack:temp` before any pass has written it.

---

## 18. Self-read/write rule

A pass must not read from the same custom target it writes to.

Invalid:

```json
{
  "id": "bad_feedback",
  "vertex_shader": "example_pack:composite/final",
  "fragment_shader": "example_pack:composite/final",
  "inputs": [
    {
      "sampler_name": "Temp",
      "target": "example_pack:temp"
    }
  ],
  "output": "example_pack:temp"
}
```

This creates a read/write feedback hazard.

Use two targets instead:

```text
example_pack:temp_a
example_pack:temp_b
```

or a later ping-pong/history pattern when temporal target support is documented for your VPFX version.

Reading `minecraft:scene_color` while writing `minecraft:main` is safe because VPFX uses a scene color snapshot.

---

## 19. Texture inputs

A texture input reads a texture declared in `pack.json`.

Manifest example:

```json
"textures": {
  "BlueNoise": {
    "path": "textures/blue_noise.png",
    "filter": "nearest",
    "wrap": "repeat"
  }
}
```

Graph input:

```json
{
  "sampler_name": "BlueNoise",
  "texture": "BlueNoise"
}
```

GLSL:

```glsl
uniform sampler2D BlueNoiseSampler;
```

The `texture` value is the logical texture name from `pack.json`, not a file path.

Invalid:

```json
{
  "sampler_name": "BlueNoise",
  "texture": "textures/blue_noise.png"
}
```

Texture inputs do not support:

```json
"use_depth_buffer": true
```

---

## 20. Depth inputs

Input objects may contain:

```json
"use_depth_buffer": true
```

This is only valid for target inputs, not texture inputs.

Example:

```json
{
  "sampler_name": "Depth",
  "target": "vulkanpostfx:scene_depth"
}
```

Usually, explicit depth target names are preferred over `use_depth_buffer`.

Recommended scene depth input:

```json
{
  "sampler_name": "Depth",
  "target": "vulkanpostfx:scene_depth"
}
```

Recommended shadow depth input:

```json
{
  "sampler_name": "Shadow",
  "target": "vulkanpostfx:shadow_depth"
}
```

For a custom target depth buffer, the target must be declared with:

```json
"use_depth": true
```

Example:

```json
{
  "targets": {
    "example_pack:depth_target": {
      "scale": 1.0,
      "use_depth": true
    }
  },
  "passes": [
    {
      "id": "read_depth_target",
      "vertex_shader": "example_pack:composite/final",
      "fragment_shader": "example_pack:composite/final",
      "inputs": [
        {
          "sampler_name": "Depth",
          "target": "example_pack:depth_target",
          "use_depth_buffer": true
        }
      ],
      "output": "minecraft:main"
    }
  ]
}
```

Do not use `use_depth_buffer` with texture inputs.

Invalid:

```json
{
  "sampler_name": "Noise",
  "texture": "BlueNoise",
  "use_depth_buffer": true
}
```

---

## 21. Output targets

Each pass must have one output.

Valid outputs:

```text
minecraft:main
a declared custom target
```

Example final output:

```json
"output": "minecraft:main"
```

Example custom output:

```json
"output": "example_pack:temp"
```

Invalid output:

```json
"output": "vulkanpostfx:scene_depth"
```

Invalid output:

```json
"output": "vulkanpostfx:shadow_depth"
```

Depth targets are input-only.

The graph must include at least one pass that writes to:

```text
minecraft:main
```

---

## 22. One-pass color grading example

```json
{
  "targets": {},
  "passes": [
    {
      "id": "final_composite",
      "debug_label": "Final Composite",
      "vertex_shader": "example_pack:composite/final",
      "fragment_shader": "example_pack:composite/final",
      "inputs": [
        {
          "sampler_name": "In",
          "target": "minecraft:scene_color"
        }
      ],
      "output": "minecraft:main"
    }
  ]
}
```

This is the recommended first graph.

---

## 23. Two-pass example

```json
{
  "targets": {
    "example_pack:temp": {
      "scale": 1.0,
      "use_depth": false,
      "clear_color": [0.0, 0.0, 0.0, 0.0]
    }
  },
  "passes": [
    {
      "id": "first_pass",
      "debug_label": "First Pass",
      "vertex_shader": "example_pack:composite/first",
      "fragment_shader": "example_pack:composite/first",
      "inputs": [
        {
          "sampler_name": "In",
          "target": "minecraft:scene_color"
        }
      ],
      "output": "example_pack:temp"
    },
    {
      "id": "final_pass",
      "debug_label": "Final Pass",
      "vertex_shader": "example_pack:composite/final",
      "fragment_shader": "example_pack:composite/final",
      "inputs": [
        {
          "sampler_name": "Temp",
          "target": "example_pack:temp"
        }
      ],
      "output": "minecraft:main"
    }
  ]
}
```

This is the basic pattern for multi-pass effects.

---

## 24. Downsample target example

```json
{
  "targets": {
    "example_pack:half_res": {
      "scale": 0.5,
      "use_depth": false,
      "clear_color": [0.0, 0.0, 0.0, 0.0]
    }
  },
  "passes": [
    {
      "id": "downsample",
      "vertex_shader": "example_pack:composite/downsample",
      "fragment_shader": "example_pack:composite/downsample",
      "inputs": [
        {
          "sampler_name": "In",
          "target": "minecraft:scene_color"
        }
      ],
      "output": "example_pack:half_res"
    },
    {
      "id": "final",
      "vertex_shader": "example_pack:composite/final",
      "fragment_shader": "example_pack:composite/final",
      "inputs": [
        {
          "sampler_name": "HalfRes",
          "target": "example_pack:half_res"
        },
        {
          "sampler_name": "Scene",
          "target": "minecraft:scene_color"
        }
      ],
      "output": "minecraft:main"
    }
  ]
}
```

This pattern is useful for blur and bloom-style effects.

---

## 25. Scene depth example

Make sure your `pack.json` declares:

```json
"capabilities": {
  "scene_color": true,
  "scene_depth": true,
  "shadow_depth": false,
  "custom_targets": true,
  "compute": false
}
```

Graph:

```json
{
  "targets": {},
  "passes": [
    {
      "id": "depth_debug",
      "vertex_shader": "example_pack:debug/depth",
      "fragment_shader": "example_pack:debug/depth",
      "inputs": [
        {
          "sampler_name": "Depth",
          "target": "vulkanpostfx:scene_depth"
        }
      ],
      "output": "minecraft:main"
    }
  ]
}
```

GLSL:

```glsl
uniform sampler2D DepthSampler;
```

---

## 26. Shadow depth example

Make sure your `pack.json` declares:

```json
"capabilities": {
  "scene_color": true,
  "scene_depth": true,
  "shadow_depth": true,
  "custom_targets": true,
  "compute": false
},
"targets": {
  "shadow_depth": "vulkanpostfx:shadow_depth"
}
```

Graph:

```json
{
  "targets": {},
  "passes": [
    {
      "id": "shadow_debug",
      "vertex_shader": "example_pack:debug/shadow",
      "fragment_shader": "example_pack:debug/shadow",
      "inputs": [
        {
          "sampler_name": "Shadow",
          "target": "vulkanpostfx:shadow_depth"
        }
      ],
      "output": "minecraft:main"
    }
  ]
}
```

GLSL:

```glsl
uniform sampler2D ShadowSampler;
```

Remember:

```text
shadow_depth is reversed-Z shadow-space depth.
Do not treat it as main camera depth.
```

---

## 27. Current validation rules

The current graph validator checks:

```text
The graph has at least one pass.
Custom target IDs are valid.
Target scale is finite and in (0, 1].
Each pass has at least one input.
Each sampler_name is valid.
Sampler names are unique within one pass.
Each input has exactly one of target or texture.
Target inputs reference built-in or declared targets.
Texture inputs reference textures declared in pack.json.
Custom targets are written before being read.
A pass does not read and write the same custom target.
Each output is minecraft:main or a declared target.
At least one pass writes to minecraft:main.
Capabilities required by the pack are supported by the runtime.
```

If validation fails, VPFX skips the pack and logs an error.

---

## 28. Common graph errors

### Missing `targets`

Invalid:

```json
{
  "passes": []
}
```

Valid:

```json
{
  "targets": {},
  "passes": []
}
```

---

### Missing `passes`

Invalid:

```json
{
  "targets": {}
}
```

Valid:

```json
{
  "targets": {},
  "passes": [
    {
      "id": "final",
      "vertex_shader": "example_pack:composite/final",
      "fragment_shader": "example_pack:composite/final",
      "inputs": [
        {
          "sampler_name": "In",
          "target": "minecraft:scene_color"
        }
      ],
      "output": "minecraft:main"
    }
  ]
}
```

---

### Empty `passes`

Invalid:

```json
{
  "targets": {},
  "passes": []
}
```

A graph must contain at least one pass.

---

### Missing output to `minecraft:main`

Invalid:

```json
{
  "targets": {
    "example_pack:temp": {
      "scale": 1.0
    }
  },
  "passes": [
    {
      "id": "only_temp",
      "vertex_shader": "example_pack:composite/final",
      "fragment_shader": "example_pack:composite/final",
      "inputs": [
        {
          "sampler_name": "In",
          "target": "minecraft:scene_color"
        }
      ],
      "output": "example_pack:temp"
    }
  ]
}
```

The pack writes to `example_pack:temp`, but never writes to `minecraft:main`.

---

### Invalid sampler name

Invalid:

```json
{
  "sampler_name": "Scene Color",
  "target": "minecraft:scene_color"
}
```

Valid:

```json
{
  "sampler_name": "SceneColor",
  "target": "minecraft:scene_color"
}
```

---

### Duplicate sampler names in one pass

Invalid:

```json
"inputs": [
  {
    "sampler_name": "In",
    "target": "minecraft:scene_color"
  },
  {
    "sampler_name": "In",
    "target": "vulkanpostfx:scene_depth"
  }
]
```

Valid:

```json
"inputs": [
  {
    "sampler_name": "Scene",
    "target": "minecraft:scene_color"
  },
  {
    "sampler_name": "Depth",
    "target": "vulkanpostfx:scene_depth"
  }
]
```

---

### Texture input not declared in manifest

Invalid graph input:

```json
{
  "sampler_name": "Noise",
  "texture": "BlueNoise"
}
```

if `pack.json` does not declare:

```json
"textures": {
  "BlueNoise": {
    "path": "textures/blue_noise.png"
  }
}
```

---

### Reading a target before writing it

Invalid:

```json
{
  "targets": {
    "example_pack:temp": {
      "scale": 1.0
    }
  },
  "passes": [
    {
      "id": "final",
      "vertex_shader": "example_pack:composite/final",
      "fragment_shader": "example_pack:composite/final",
      "inputs": [
        {
          "sampler_name": "Temp",
          "target": "example_pack:temp"
        }
      ],
      "output": "minecraft:main"
    }
  ]
}
```

`example_pack:temp` is declared, but no earlier pass writes to it.

---

## 29. Error code reference

Common parser and validator error codes:

| Code   | Meaning                                                                             |
| ------ | ----------------------------------------------------------------------------------- |
| `G001` | Graph entry file not found.                                                         |
| `G002` | Graph root must be an object, or graph has no passes depending on validation stage. |
| `G003` | Failed to read graph JSON, or pass has no inputs depending on validation stage.     |
| `G004` | Output target not declared.                                                         |
| `G005` | Input target not found.                                                             |
| `G006` | Invalid depth-buffer usage or missing runtime depth capability.                     |
| `G007` | Invalid target identifier.                                                          |
| `G008` | Invalid sampler name.                                                               |
| `G009` | Duplicate sampler name within one pass.                                             |
| `G010` | Target definition must be an object.                                                |
| `G011` | Invalid target scale.                                                               |
| `G012` | Input must contain exactly one of target or texture.                                |
| `G013` | Texture input not declared in manifest.                                             |
| `G014` | Texture input cannot use `use_depth_buffer=true`.                                   |
| `G015` | Self-read/write hazard.                                                             |
| `G016` | Graph does not write to `minecraft:main`.                                           |
| `G017` | Custom target is read before being written.                                         |
| `G020` | Each pass must be an object.                                                        |
| `G030` | Each input must be an object.                                                       |
| `G031` | `use_depth_buffer` must be boolean.                                                 |
| `G032` | Input must contain exactly one of target or texture.                                |
| `G033` | Texture input cannot use `use_depth_buffer=true`.                                   |
| `G040` | `clear_color` must be an array.                                                     |
| `G041` | `clear_color` must contain exactly 4 elements.                                      |
| `G042` | `clear_color` elements must be numbers.                                             |
| `G050` | Missing required object field.                                                      |
| `G052` | Missing required array field.                                                       |
| `G054` | Missing required string field.                                                      |
| `G056` | Required string field is blank.                                                     |
| `G058` | Optional string field has wrong type.                                               |
| `G059` | Optional boolean field has wrong type.                                              |
| `S001` | Vertex shader file not found.                                                       |
| `S002` | Fragment shader file not found.                                                     |
| `S003` | Invalid shader resource ID or shader path.                                          |
| `S004` | Vertex shader include/preprocess error.                                             |
| `S005` | Fragment shader include/preprocess error.                                           |

---

## 30. Graph authoring checklist

Before sharing a pack, check:

```text
post_effect/main.json exists at the path referenced by pack.json.
The root JSON object contains targets and passes.
targets is an object, even if empty.
passes is a non-empty array.
Every custom target ID is namespaced.
Every scale is in (0, 1].
Every pass has vertex_shader and fragment_shader.
Every pass has at least one input.
Every sampler_name is GLSL-safe.
Sampler names are unique within each pass.
Every input has exactly one of target or texture.
Every texture input is declared in pack.json.
Every custom target is written before being read.
No pass reads and writes the same custom target.
At least one pass outputs to minecraft:main.
Shader files exist under shaders/.
Shader references use namespace:path.
```

---

## 31. Recommended first graph

For a first VPFX pack, use this:

```json
{
  "targets": {},
  "passes": [
    {
      "id": "final_composite",
      "debug_label": "Final Composite",
      "vertex_shader": "my_first_vpfx_pack:composite/final",
      "fragment_shader": "my_first_vpfx_pack:composite/final",
      "inputs": [
        {
          "sampler_name": "In",
          "target": "minecraft:scene_color"
        }
      ],
      "output": "minecraft:main"
    }
  ]
}
```

Required files:

```text
shaders/composite/final.vsh
shaders/composite/final.fsh
```

This graph is intentionally simple.
Make this work before adding custom targets, depth, shadow depth, textures, or temporal effects.

---

## 32. Next document

This document covers:

```text
post_effect/main.json this work before adding custom targets, depth, shadow depth, textures, or temporal effects.

---

## 
targets
passes
inputs
outputs
sampler names
custom target validation
depth and shadow target references
```

The next document should cover:

```text
05 - VPFX Uniform Reference
```

That document should explain:

```text
Built-in uniform block
Frame data
Screen size
Time
Scene depth parameters
Shadow matrices
Shadow origin
Light direction
Shadow map size
```
