---
title: Common Errors and Troubleshooting
description: Diagnose and fix common VPFX pack loading, validation, and shader issues.
---

# VPFX Common Errors and Troubleshooting

This document helps players and pack authors diagnose common VPFX issues.

It covers:

```text
Pack detection problems
Manifest errors
Post-effect graph errors
Shader file errors
Include errors
Sampler and target mistakes
Scene depth mistakes
shadow_depth mistakes
Runtime fallback
Debug commands
Useful files to attach when asking for help
```

This guide is based on the current VPFX pack loader, graph validator, shader preprocessor, runtime fallback path, and diagnostics output.

---

## 1. First things to check

Before debugging deeply, check these basics:

```text
1. Is VPFX installed and loaded?
2. Is the pack a VPFX pack, not an Iris or OptiFine pack?
3. Is the pack zip inside .minecraft/shaderpacks/?
4. Is pack.json at the root of the zip?
5. Does the pack appear in the VPFX menu?
6. Does /vpfx list show it?
7. Does latest.log contain VPFX errors?
8. Does /vpfx off restore vanilla rendering?
9. Does /vpfx reload builtin work?
```

Useful commands:

```text
/vpfx list
/vpfx reload
/vpfx reload auto
/vpfx reload builtin
/vpfx off
```

Useful default keys:

```text
F7  - Open VPFX shaderpack menu
F9  - Toggle VPFX shadow depth debug view
F10 - Reload current VPFX pack
```

---

## 2. Where to look for logs

The most useful log file is:

```text
.minecraft/logs/latest.log
```

Search for:

```text
VPFX
vulkanpostfx
F001
G001
S001
C001
I001
```

If VPFX fails during runtime execution, it may also write a diagnostic report here:

```text
.minecraft/vulkanpostfx_runtime/diagnostics/latest-vpfx-error.txt
```

That file may include:

```text
Pack name
External post effect id
Runtime namespace
Backend id
Backend capabilities
Failure stage
Exception class
Exception message
Fallback target
Stack trace
```

If you are reporting a serious issue, attach:

```text
latest.log
latest-vpfx-error.txt if it exists
the VPFX pack zip
a screenshot or video
```

---

## 3. Quick decision tree

### The pack does not appear

Check:

```text
pack.json is at the zip root.
pack.json is valid JSON.
The zip is inside shaderpacks/.
The file extension is .zip.
The pack is not nested inside an extra folder.
```

Then run:

```text
/vpfx list
```

---

### The pack appears but fails to load

Check:

```text
latest.log
manifest errors: Fxxx
graph errors: Gxxx
shader file errors: Sxxx
capability errors: Cxxx
include errors: Ixxx
```

---

### The pack loads but the screen is black

Check:

```text
The final pass outputs to minecraft:main.
The fragment shader writes fragColor.
Sampler uniform names match sampler_name + "Sampler".
The shader compiled successfully.
The pass is not reading an unwritten target.
The pack is not reading and writing the same custom target in one pass.
```

---

### The pack works but shadows are wrong

Check:

```text
Did the pack declare shadow_depth?
Does pack.json contain targets.shadow_depth?
Does the graph read vulkanpostfx:shadow_depth?
Is use_depth_buffer true for clarity?
Are you treating shadow_depth as scene_depth?
Are you trying to write a full receiver without public shadowOrigin?
Does the issue change when rotating the camera?
```

---

### The game falls back to vanilla

Check:

```text
latest.log
latest-vpfx-error.txt
failureStage
exceptionMessage
active backend
fallback reason
```

VPFX is designed to fail safely when possible.

---

## 4. Pack zip layout errors

### Problem

The pack does not appear in the VPFX menu or `/vpfx list`.

### Common cause

The zip contains an extra folder.

Incorrect:

```text
my_pack.zip
└─ my_pack/
   ├─ pack.json
   ├─ post_effect/
   └─ shaders/
```

Correct:

```text
my_pack.zip
├─ pack.json
├─ post_effect/
└─ shaders/
```

### Fix

Open the zip. You should immediately see:

```text
pack.json
post_effect/
shaders/
```

If you need to enter another folder before seeing `pack.json`, re-zip the contents of the folder, not the folder itself.

---

## 5. `pack.json` is missing

### Error code

```text
F001 pack.json
```

### Meaning

VPFX did not find `pack.json` at the zip root.

### Fix

Make sure the zip root contains:

```text
pack.json
```

Correct:

```text
my_pack.zip
├─ pack.json
└─ post_effect/main.json
```

Incorrect:

```text
my_pack.zip
└─ my_pack/pack.json
```

---

## 6. `pack.json` is not a JSON object

### Error code

```text
F001 pack.json
```

### Bad example

```json
[
  {
    "format_version": 1
  }
]
```

### Correct example

```json
{
  "format_version": 1,
  "pack_id": "example_pack",
  "name": "Example Pack",
  "version": "1.0.0",
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

The root of `pack.json` must be a JSON object.

---

## 7. Unsupported `format_version`

### Error code

```text
F002 format_version
```

### Problem

Current VPFX native pack manifests support:

```json
"format_version": 1
```

### Bad example

```json
"format_version": 2
```

### Fix

Use:

```json
"format_version": 1
```

---

## 8. Invalid `pack_id`

### Error code

```text
F003 pack_id
```

### Rule

`pack_id` must match:

```text
^[a-z0-9_.-]{3,64}$
```

Allowed:

```text
lowercase letters
numbers
underscore _
dot .
hyphen -
```

### Good examples

```text
example_pack
cinematic_tone_pack
author.cool_pack
debug-shadow-view
```

### Bad examples

```text
Example Pack
My Shader!!!
ab
cool pack
shader@pack
```

### Fix

Use a lowercase namespace-like ID:

```json
"pack_id": "my_first_vpfx_pack"
```

---

## 9. Missing `entry_post_effect`

### Error code

```text
F005 entry_post_effect
```

### Meaning

The path listed in `pack.json` does not exist inside the zip.

### Bad example

```json
"entry_post_effect": "post_effect/missing.json"
```

but the zip contains:

```text
post_effect/main.json
```

### Fix

Either rename the file or update the manifest:

```json
"entry_post_effect": "post_effect/main.json"
```

---

## 10. Missing required manifest fields

### Error code

```text
F006
```

### Common missing fields

```text
format_version
pack_id
name
version
entry_post_effect
capabilities
capabilities.scene_color
capabilities.scene_depth
capabilities.shadow_depth
capabilities.custom_targets
capabilities.compute
```

### Bad example

```json
{
  "format_version": 1,
  "pack_id": "example_pack"
}
```

### Fix

Use a complete manifest:

```json
{
  "format_version": 1,
  "pack_id": "example_pack",
  "name": "Example Pack",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "Example VPFX pack.",
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

---

## 11. Invalid capabilities

### Error code

```text
F006
```

### Problem

All capability fields must exist and must be booleans.

### Bad example

```json
"capabilities": {
  "scene_color": true
}
```

### Correct example

```json
"capabilities": {
  "scene_color": true,
  "scene_depth": false,
  "shadow_depth": false,
  "custom_targets": true,
  "compute": false
}
```

### Important

Current VPFX runtime does not support compute shaders.

Do not use:

```json
"compute": true
```

Use:

```json
"compute": false
```

---

## 12. Runtime capability errors

### Error codes

```text
C001 capabilities.scene_color
C002 capabilities.scene_depth
C003 capabilities.shadow_depth
C004 capabilities.custom_targets
C005 capabilities.compute
```

### Meaning

The pack requested a feature that the current runtime does not provide.

The current intended runtime capabilities are usually:

```text
scene_color: true
scene_depth: true
shadow_depth: true
custom_targets: true
compute: false
```

The most common capability mistake is:

```json
"compute": true
```

### Fix

Set compute to false:

```json
"compute": false
```

If you requested `shadow_depth`, make sure your VPFX version actually supports it and the runtime did not fall back.

---

## 13. `shadow_depth` enabled without `targets.shadow_depth`

### Error code

```text
F007 targets.shadow_depth
```

### Problem

If this is true:

```json
"shadow_depth": true
```

then `pack.json` must include:

```json
"targets": {
  "shadow_depth": "vulkanpostfx:shadow_depth"
}
```

### Bad example

```json
{
  "capabilities": {
    "scene_color": true,
    "scene_depth": false,
    "shadow_depth": true,
    "custom_targets": true,
    "compute": false
  }
}
```

### Correct example

```json
{
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

---

## 14. Invalid manifest target mapping

### Error code

```text
F006 targets.<name>
```

### Rule

Manifest target mapping values must match:

```text
^[a-z0-9_.-]+:[a-z0-9_./-]+$
```

### Good

```json
"targets": {
  "shadow_depth": "vulkanpostfx:shadow_depth"
}
```

### Bad

```json
"targets": {
  "shadow_depth": "shadow_depth"
}
```

Target IDs must be namespaced.

---

## 15. Texture declaration errors

### Error code

```text
F008
```

Texture names must be GLSL-safe identifiers.

Rule:

```text
^[A-Za-z_][A-Za-z0-9_]*$
```

### Bad

```json
"textures": {
  "blue-noise": {
    "path": "textures/blue_noise.png"
  }
}
```

### Correct

```json
"textures": {
  "BlueNoise": {
    "path": "textures/blue_noise.png"
  }
}
```

### Also check

```text
The texture entry is an object.
The path field exists.
The texture path is not blank.
The file exists inside the zip.
filter is either linear or nearest.
wrap is either clamp or repeat.
```

---

## 16. Missing texture file

### Error code

```text
F008 textures.<name>.path
```

### Problem

The manifest declares a texture:

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

### Fix

Add the file or correct the path.

Remember that zip paths are case-sensitive in practice.

---

## 17. Graph entry file missing

### Error code

```text
G001
```

### Meaning

VPFX could not find the graph file referenced by:

```json
"entry_post_effect": "post_effect/main.json"
```

### Fix

Make sure the zip contains:

```text
post_effect/main.json
```

at exactly that path.

---

## 18. Graph root is not an object

### Error code

```text
G002
```

### Bad example

```json
[
  {
    "targets": {},
    "passes": []
  }
]
```

### Correct example

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

## 19. Graph has no passes

### Error code

```text
G002 passes
```

### Problem

The graph must contain at least one pass.

### Bad example

```json
{
  "targets": {},
  "passes": []
}
```

### Fix

Add a pass that writes to `minecraft:main`.

---

## 20. Missing `targets` or `passes`

### Error codes

```text
G050
G052
```

### Problem

The graph root must contain:

```json
{
  "targets": {},
  "passes": []
}
```

Even if you do not need custom targets, `targets` must exist and be an object.

Correct minimal graph:

```json
{
  "targets": {},
  "passes": [
    {
      "id": "final_composite",
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

## 21. Invalid custom target ID

### Error code

```text
G007
```

### Rule

Custom target IDs must match:

```text
^[a-z0-9_.-]+:[a-z0-9_./-]+$
```

### Bad

```json
"targets": {
  "temp": {
    "scale": 1.0
  }
}
```

### Correct

```json
"targets": {
  "example_pack:temp": {
    "scale": 1.0
  }
}
```

Use your `pack_id` as the namespace.

---

## 22. Invalid target definition

### Error code

```text
G010
```

### Bad

```json
"targets": {
  "example_pack:temp": 1.0
}
```

### Correct

```json
"targets": {
  "example_pack:temp": {
    "scale": 1.0,
    "use_depth": false
  }
}
```

Each target definition must be a JSON object.

---

## 23. Invalid target scale

### Error code

```text
G011
```

### Rule

Target scale must be finite and in:

```text
(0, 1]
```

### Good

```json
"scale": 1.0
```

```json
"scale": 0.5
```

```json
"scale": 0.25
```

### Bad

```json
"scale": 0
```

```json
"scale": 2.0
```

```json
"scale": "half"
```

---

## 24. Invalid target booleans

### Error codes

```text
G012
G059
```

### Problem

Boolean fields must be actual JSON booleans.

Fields include:

```text
use_depth
persistent
history
ping_pong
```

### Bad

```json
"use_depth": "false"
```

### Correct

```json
"use_depth": false
```

---

## 25. Invalid `clear_color`

### Error codes

```text
G040
G041
G042
```

### Rule

`clear_color` must be an array of exactly four numbers.

### Correct

```json
"clear_color": [0.0, 0.0, 0.0, 0.0]
```

### Bad

```json
"clear_color": [0.0, 0.0, 0.0]
```

### Bad

```json
"clear_color": "black"
```

---

## 26. Pass is not an object

### Error code

```text
G020
```

### Bad

```json
"passes": [
  "final"
]
```

### Correct

```json
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
```

---

## 27. Pass has no inputs

### Error code

```text
G003
```

### Problem

Every pass must have at least one input.

### Bad

```json
{
  "id": "final",
  "vertex_shader": "example_pack:composite/final",
  "fragment_shader": "example_pack:composite/final",
  "inputs": [],
  "output": "minecraft:main"
}
```

### Fix

For a basic final pass, read scene color:

```json
"inputs": [
  {
    "sampler_name": "In",
    "target": "minecraft:scene_color"
  }
]
```

---

## 28. Input is not an object

### Error code

```text
G030
```

### Bad

```json
"inputs": [
  "minecraft:scene_color"
]
```

### Correct

```json
"inputs": [
  {
    "sampler_name": "In",
    "target": "minecraft:scene_color"
  }
]
```

---

## 29. Invalid `sampler_name`

### Error code

```text
G008
```

### Rule

`sampler_name` must match:

```text
^[A-Za-z_][A-Za-z0-9_]*$
```

### Good

```text
In
Scene
Depth
Shadow
BlueNoise
_ColorLut
```

### Bad

```text
1Input
scene color
color-texture
shadow.depth
```

### GLSL mapping

This JSON:

```json
"sampler_name": "In"
```

becomes this GLSL uniform:

```glsl
uniform sampler2D InSampler;
```

---

## 30. Duplicate sampler names

### Error code

```text
G009
```

### Bad

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

### Correct

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

Sampler names must be unique within one pass.

---

## 31. Input has both `target` and `texture`

### Error codes

```text
G012
G032
```

### Bad

```json
{
  "sampler_name": "Bad",
  "target": "minecraft:scene_color",
  "texture": "BlueNoise"
}
```

### Correct target input

```json
{
  "sampler_name": "Scene",
  "target": "minecraft:scene_color"
}
```

### Correct texture input

```json
{
  "sampler_name": "Noise",
  "texture": "BlueNoise"
}
```

Each input must contain exactly one of:

```text
target
texture
```

---

## 32. Input target not found

### Error code

```text
G005
```

### Problem

The pass reads a target that is neither built-in nor declared in the graph.

### Bad

```json
{
  "sampler_name": "Temp",
  "target": "example_pack:temp"
}
```

but `example_pack:temp` is not declared in root `targets`.

### Fix

Declare the target:

```json
"targets": {
  "example_pack:temp": {
    "scale": 1.0,
    "use_depth": false
  }
}
```

or read a built-in target:

```json
{
  "sampler_name": "In",
  "target": "minecraft:scene_color"
}
```

---

## 33. Reading a custom target before it is written

### Error code

```text
G017
```

### Problem

Custom targets are only available after an earlier pass writes to them.

### Bad

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

### Fix

Write the target first:

```json
{
  "targets": {
    "example_pack:temp": {
      "scale": 1.0
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

---

## 34. Self-read/write hazard

### Error code

```text
G015
```

### Problem

A pass reads from the same custom target it writes to.

### Bad

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

### Fix

Use two targets:

```text
example_pack:temp_a
example_pack:temp_b
```

or structure the effect as multiple passes.

Reading `minecraft:scene_color` while writing `minecraft:main` is safe because VPFX uses a scene color snapshot.

---

## 35. Output target not declared

### Error code

```text
G004
```

### Problem

A pass writes to an undeclared custom target.

### Bad

```json
"output": "example_pack:temp"
```

but root `targets` does not declare `example_pack:temp`.

### Fix

Declare it:

```json
"targets": {
  "example_pack:temp": {
    "scale": 1.0,
    "use_depth": false
  }
}
```

or write to the final target:

```json
"output": "minecraft:main"
```

---

## 36. Graph does not write to `minecraft:main`

### Error code

```text
G016
```

### Problem

The graph writes only to intermediate targets and never outputs the final image.

### Bad

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

### Fix

Add a final pass:

```json
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
```

---

## 37. Texture input not declared

### Error code

```text
G013
```

### Problem

The graph reads a texture name that does not exist in `pack.json`.

### Bad graph input

```json
{
  "sampler_name": "Noise",
  "texture": "BlueNoise"
}
```

but `pack.json` has no:

```json
"textures": {
  "BlueNoise": {
    "path": "textures/blue_noise.png"
  }
}
```

### Fix

Declare the texture in `pack.json`, or remove the texture input.

---

## 38. Texture input uses `use_depth_buffer`

### Error codes

```text
G014
G033
```

### Bad

```json
{
  "sampler_name": "Noise",
  "texture": "BlueNoise",
  "use_depth_buffer": true
}
```

### Fix

Remove `use_depth_buffer`.

Texture inputs cannot use depth-buffer sampling.

---

## 39. `use_depth_buffer=true` but target has no depth buffer

### Error code

```text
G006
```

### Bad

```json
"targets": {
  "example_pack:temp": {
    "scale": 1.0,
    "use_depth": false
  }
}
```

with input:

```json
{
  "sampler_name": "TempDepth",
  "target": "example_pack:temp",
  "use_depth_buffer": true
}
```

### Fix

Declare the target with depth:

```json
"targets": {
  "example_pack:temp": {
    "scale": 1.0,
    "use_depth": true
  }
}
```

or remove:

```json
"use_depth_buffer": true
```

---

## 40. Vertex shader file not found

### Error code

```text
S001
```

### Problem

The graph references:

```json
"vertex_shader": "example_pack:composite/final"
```

VPFX expects:

```text
shaders/composite/final.vsh
```

inside the zip.

### Fix

Check:

```text
The file exists.
The folder is named shaders.
The extension is .vsh.
The path matches exactly.
The zip is not nested incorrectly.
```

---

## 41. Fragment shader file not found

### Error code

```text
S002
```

### Problem

The graph references:

```json
"fragment_shader": "example_pack:composite/final"
```

VPFX expects:

```text
shaders/composite/final.fsh
```

inside the zip.

### Fix

Check:

```text
The file exists.
The extension is .fsh.
The path matches the graph.
The file is not named .frag.
```

---

## 42. Invalid shader resource ID or path

### Error code

```text
S003
```

### Valid format

```text
namespace:path
```

### Good

```text
example_pack:composite/final
example_pack:bloom/downsample
example_pack:debug/shadow_depth
```

### Bad

```text
composite/final
example_pack:
example_pack:/final
example_pack:../final
example_pack:folder\final
```

Shader paths must not:

```text
be blank
be absolute
contain ..
contain backslashes
```

---

## 43. Include preprocess errors

### Error codes

```text
S004 vertex_shader
S005 fragment_shader
```

These wrap lower-level include errors:

```text
I001 include depth exceeded
I002 include cycle detected
I003 blank include path
I004 parent path traversal is not allowed
I005 included shader file not found
I006 failed to read included shader file
```

### Include syntax

Supported:

```glsl
#include "common/functions.glsl"
```

Includes are resolved relative to the current shader file unless the path starts with:

```text
shaders/
```

### Good

If current file is:

```text
shaders/composite/final.fsh
```

then:

```glsl
#include "common.glsl"
```

resolves to:

```text
shaders/composite/common.glsl
```

This:

```glsl
#include "shaders/common/color.glsl"
```

resolves from the zip root.

### Bad

```glsl
#include "../common.glsl"
```

Parent path traversal is not allowed.

---

## 44. Built-in uniforms not recognized

### Symptoms

Shader compile error mentioning:

```text
vpfx_Time
vpfx_ViewSize
vpfx_RainStrength
VpfxBuiltins
```

### Likely causes

```text
The shader is used as a .glsl include file instead of a .fsh or .vsh entry.
The shader has a syntax error before the injected uniform block.
The shader manually declared an incompatible VpfxBuiltins block.
The source already contains VPFX_BUILTIN_UNIFORMS and blocked injection.
```

### Rule

VPFX injects built-in uniforms into:

```text
.vsh
.fsh
```

It does not inject them into:

```text
.glsl include files
```

If a `.glsl` include uses `vpfx_Time`, it should only be included by a `.vsh` or `.fsh` that receives the injected uniform block.

---

## 45. Sampler uniform is wrong

### Symptom

Black screen, wrong texture, or shader compile/link issue.

### JSON

```json
{
  "sampler_name": "In",
  "target": "minecraft:scene_color"
}
```

### Correct GLSL

```glsl
uniform sampler2D InSampler;
```

### Incorrect GLSL

```glsl
uniform sampler2D In;
```

VPFX uses:

```text
<sampler_name>Sampler
```

---

## 46. Scene depth does not work

### Checklist

In `pack.json`:

```json
"scene_depth": true
```

In graph input:

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

For reconstruction, use:

```glsl
vec3 viewPos = vpfx_ViewPositionFromRaw(DepthSampler, texCoord);
```

or:

```glsl
vec3 worldPos = vpfx_WorldPositionFromRaw(DepthSampler, texCoord);
```

### Common mistakes

```text
Using scene_depth without declaring capability.
Using ShadowSampler instead of DepthSampler.
Expecting raw depth to be linear distance.
Forgetting that depth behavior depends on projection.
```

---

## 47. shadow_depth does not work

### Checklist

In `pack.json`:

```json
"shadow_depth": true
```

and:

```json
"targets": {
  "shadow_depth": "vulkanpostfx:shadow_depth"
}
```

In graph input:

```json
{
  "sampler_name": "Shadow",
  "target": "vulkanpostfx:shadow_depth",
  "use_depth_buffer": true
}
```

In GLSL:

```glsl
uniform sampler2D ShadowSampler;
```

### Common mistakes

```text
Forgetting targets.shadow_depth.
Treating shadow_depth as scene_depth.
Sampling shadow_depth with screen UVs and expecting screen-space shadows.
Writing a full receiver without public shadowOrigin.
Expecting shadow_depth to be valid when no world is loaded.
Expecting shadow_depth to be valid during weak-light periods.
```

---

## 48. Black screen troubleshooting

If the screen is black:

1. Test a constant color shader.

```glsl
#version 150

in vec2 texCoord;
out vec4 fragColor;

void main() {
    fragColor = vec4(1.0, 0.0, 1.0, 1.0);
}
```

If the screen becomes magenta, the pass is running.

If not, check:

```text
Does the graph write to minecraft:main?
Did the shader compile?
Are shader files present?
Is the pack selected?
Did VPFX fall back to vanilla?
```

2. Test a scene color copy shader.

```glsl
#version 150

uniform sampler2D InSampler;

in vec2 texCoord;
out vec4 fragColor;

void main() {
    fragColor = texture(InSampler, texCoord);
}
```

If magenta works but scene copy does not, the sampler or input binding is likely wrong.

---

## 49. Pack loads but has no visible effect

Possible causes:

```text
Your shader is a copy pass.
The effect is too subtle.
The wrong pack is active.
The final pass does not use the modified target.
A later pass overwrites the result.
The graph outputs the original scene color again.
```

Debug approach:

```text
1. Output magenta.
2. Output scene color.
3. Output scene color * 0.5.
4. Add your effect back gradually.
```

---

## 50. Reload does not update the pack

Try:

```text
F10
```

or:

```text
/vpfx reload
```

If that does not help:

```text
1. Make sure you replaced the zip in shaderpacks/.
2. Make sure the zip contains the updated files.
3. Run /vpfx list and check the active pack.
4. Try /vpfx reload auto.
5. Try restarting the game.
```

If you changed `pack_id`, the active config may still point to the old pack. Use the menu or `/vpfx reload auto`.

---

## 51. `/vpfx list` does not show your pack

Check:

```text
The zip is in shaderpacks/.
The file extension is .zip.
pack.json is at the root.
pack.json is valid.
The pack is not being skipped due to validation failure.
latest.log contains no F/G/S/C errors for that pack.
```

If the zip has no `pack.json`, VPFX treats it as not being a native VPFX pack.

---

## 52. `/vpfx off` fixes the problem

If `/vpfx off` fixes the issue, the problem is likely related to:

```text
VPFX runtime
the active VPFX pack
a VPFX target or shader
VPFX shadow pass
VPFX compatibility with another client mod
```

Next steps:

```text
Try /vpfx reload builtin.
Try a minimal VPFX pack.
Try removing other rendering mods.
Attach latest.log.
Attach the pack zip.
```

---

## 53. `/vpfx reload builtin` works, but external pack fails

This usually means the external pack has an issue.

Check:

```text
pack.json
post_effect/main.json
shader file paths
sampler names
custom target read/write order
shadow_depth declaration
latest.log error codes
```

Use the minimal pack from the Quick Start guide to isolate the problem.

---

## 54. Runtime fallback and diagnostics

If VPFX fails during native runtime execution, it may safely fall back.

Common failure stages include:

```text
EXECUTE_FLAG_DISABLED
NOT_RENDER_THREAD
MAIN_TARGET_UNAVAILABLE
INVALID_MAIN_TARGET_DIMENSIONS
TRANSIENT_TARGET_CREATE
COPY_MAIN_TO_TRANSIENT
USER_PIPELINE_RESOLVE
USER_PIPELINE_CREATE
USER_SHADER_DRAW
BUILTIN_PIPELINE_CREATE
BUILTIN_FALLBACK_DRAW
NATIVE_DRAW_FAILED
POSTCHAIN_FALLBACK
```

If you see a runtime failure, attach:

```text
.minecraft/logs/latest.log
.minecraft/vulkanpostfx_runtime/diagnostics/latest-vpfx-error.txt
```

The diagnostic report is especially useful because it includes the failure stage and fallback target.

---

## 55. Common native runtime issue: `USER_PIPELINE_RESOLVE`

This means VPFX could not resolve the user pack into a runtime pipeline.

Common causes:

```text
Invalid graph
Missing resources
Unresolved input target
Invalid output target
Runtime namespace unavailable
Pack was marked unavailable after a previous failure
```

Check:

```text
F/G/S/C error codes in latest.log
pack zip layout
post_effect/main.json
shader references
```

---

## 56. Common native runtime issue: `USER_PIPELINE_CREATE`

This means the graph resolved, but pipeline creation failed.

Common causes:

```text
Shader compile failure
Shader link failure
Invalid sampler layout
Invalid output format assumptions
Driver/backend-specific shader issue
```

Check:

```text
latest.log
shader compile errors
fragment shader output declaration
sampler uniform names
GLSL version
```

---

## 57. Common native runtime issue: `USER_SHADER_DRAW`

This means the user shader pipeline was created, but drawing failed.

Common causes:

```text
Invalid texture binding
Runtime target became unavailable
Unexpected framebuffer state
Driver/backend failure
```

Report with:

```text
latest.log
latest-vpfx-error.txt
pack zip
screenshot or video
```

---

## 58. Shadow artifacts troubleshooting

Common shadow symptoms:

```text
stripe artifacts on terrain
diagonal artifacts on block sides
shadow changes when rotating the camera
entity has no shadow
player held item casts shadow but body does not
vanilla circular entity shadow appears together with VPFX shadow
block entity shadow flickers
```

Useful tests:

```text
Toggle F9 shadow debug.
Rotate the camera without moving.
Move without rotating the camera.
Test noon and sunset separately.
Test /vpfx reload builtin.
Test /vpfx off.
```

Important rule:

```text
If the shadow changes shape only because the player rotates the camera, report it clearly.
```

That usually indicates player-view-dependent shadow logic, which VPFX should avoid.

---

## 59. Entity shadow troubleshooting

If entity shadows do not appear:

```text
Check F9 shadow debug.
Test cow, sheep, zombie, dropped item, boat, minecart.
Check whether only held items appear.
Check whether the entity is invisible.
Check whether vanilla circular blob shadows are suppressed correctly.
```

If the entity appears in F9 shadow debug but not on terrain, the problem is likely receiver-side.

If the entity does not appear in F9 shadow debug, the problem is likely caster-side.

---

## 60. Vanilla circular entity shadow is still visible

VPFX suppresses vanilla circular entity shadows while VPFX world shadows are active.

If both shadows appear:

```text
VPFX entity shadow map shadow
+
vanilla circular blob shadow
```

then report it as a double-shadow issue.

Include:

```text
VPFX version
active pack
whether world shadows are active
screenshot
latest.log
```

There is also a JVM override that may intentionally keep vanilla entity shadows:

```text
-Dvulkanpostfx.shadow.keepVanillaEntityShadows=true
```

If that is enabled, vanilla blob shadows may remain by design.

---

## 61. Shader compile troubleshooting

Check:

```text
#version 150 is present.
fragColor is declared and written.
in/out names match between vertex and fragment shaders.
Sampler uniforms use <sampler_name>Sampler.
No unsupported GLSL features are used.
No missing semicolons.
No type mismatches.
No undeclared VPFX uniforms due to manual uniform block conflicts.
```

Minimal fragment shader test:

```glsl
#version 150

in vec2 texCoord;
out vec4 fragColor;

void main() {
    fragColor = vec4(1.0, 0.0, 1.0, 1.0);
}
```

Minimal vertex shader test:

```glsl
#version 150

out vec2 texCoord;

void main() {
    vec2 pos;

    if (gl_VertexID == 0) {
        pos = vec2(-1.0, -1.0);
    } else if (gl_VertexID == 1) {
        pos = vec2(3.0, -1.0);
    } else {
        pos = vec2(-1.0, 3.0);
    }

    texCoord = pos * 0.5 + 0.5;
    gl_Position = vec4(pos, 0.0, 1.0);
}
```

---

## 62. Debugging order for pack authors

When your pack breaks, use this order:

```text
1. Does /vpfx list show the pack?
2. Does latest.log show Fxxx manifest errors?
3. Does latest.log show Gxxx graph errors?
4. Does latest.log show Sxxx shader file errors?
5. Does latest.log show Ixxx include errors?
6. Does latest.log show Cxxx capability errors?
7. Does the pack output magenta?
8. Does the pack copy scene_color correctly?
9. Does one pass work before adding multiple passes?
10. Do custom targets get written before being read?
11. Does the final pass output to minecraft:main?
12. Does /vpfx off recover vanilla rendering?
```

Do not debug shadows before a one-pass color copy works.

---

## 63. What to include when asking for help

For player issues:

```text
Minecraft version:
Fabric Loader version:
VPFX version:
Operating system:
GPU:
Shaderpack name:
Shaderpack version:
Screenshot or video:
Steps to reproduce:
latest.log:
```

For pack author issues:

```text
VPFX version:
Pack zip:
pack.json:
post_effect/main.json:
Relevant shader file:
latest.log:
What you expected:
What happened:
```

For runtime fallback:

```text
latest.log
vulkanpostfx_runtime/diagnostics/latest-vpfx-error.txt
pack zip
```

---

## 64. Minimal known-good pack test

If everything is confusing, test a minimal pack:

`pack.json`:

```json
{
  "format_version": 1,
  "pack_id": "minimal_test_pack",
  "name": "Minimal Test Pack",
  "version": "1.0.0",
  "author": "Tester",
  "description": "Minimal VPFX test pack.",
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

`post_effect/main.json`:

```json
{
  "targets": {},
  "passes": [
    {
      "id": "final",
      "vertex_shader": "minimal_test_pack:composite/final",
      "fragment_shader": "minimal_test_pack:composite/final",
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

`shaders/composite/final.vsh`:

```glsl
#version 150

out vec2 texCoord;

void main() {
    vec2 pos;

    if (gl_VertexID == 0) {
        pos = vec2(-1.0, -1.0);
    } else if (gl_VertexID == 1) {
        pos = vec2(3.0, -1.0);
    } else {
        pos = vec2(-1.0, 3.0);
    }

    texCoord = pos * 0.5 + 0.5;
    gl_Position = vec4(pos, 0.0, 1.0);
}
```

`shaders/composite/final.fsh`:

```glsl
#version 150

uniform sampler2D InSampler;

in vec2 texCoord;
out vec4 fragColor;

void main() {
    fragColor = texture(InSampler, texCoord);
}
```

If this pack works, your VPFX installation and basic runtime are likely working.

If this pack fails, attach logs and report it as a runtime or loader issue.

---

## 65. Error code summary

### Manifest errors

```text
F001 pack.json missing, unreadable, or not an object
F002 unsupported format_version
F003 invalid pack_id
F005 entry_post_effect missing from zip
F006 invalid or missing manifest field
F007 shadow_depth target mapping missing
F008 texture declaration error
```

### Graph errors

```text
G001 graph entry file not found
G002 graph root invalid or no passes
G003 graph read error or pass has no inputs
G004 output target not declared
G005 input target not found
G006 invalid depth capability or depth-buffer usage
G007 invalid target identifier
G008 invalid sampler_name
G009 duplicate sampler_name
G010 target definition is not an object
G011 invalid target scale
G012 input target/texture selection error
G013 texture input not declared
G014 texture input cannot use depth buffer
G015 self-read/write hazard
G016 graph does not write to minecraft:main
G017 custom target read before written
G020 pass is not an object
G030 input is not an object
G031 use_depth_buffer is not boolean
G032 input must contain exactly one of target or texture
G033 texture input cannot use use_depth_buffer=true
G040 clear_color is not an array
G041 clear_color does not have 4 elements
G042 clear_color contains non-number values
G050 missing required object field
G052 missing required array field
G054 missing required string field
G056 required string field is blank
G058 optional string field has wrong type
G059 optional boolean field has wrong type
```

### Capability errors

```text
C001 scene_color unavailable
C002 scene_depth unavailable
C003 shadow_depth unavailable
C004 custom_targets unavailable
C005 compute unavailable
```

### Shader file and preprocess errors

```text
S001 vertex shader file not found
S002 fragment shader file not found
S003 invalid shader resource ID or path
S004 vertex shader preprocess error
S005 fragment shader preprocess error
```

### Include errors

```text
I001 include depth exceeded
I002 include cycle detected
I003 blank include path
I004 parent path traversal not allowed
I005 included shader file not found
I006 failed to read included shader file
```

### Zip errors

```text
Z001 failed to open zip file
```

---

## 66. Final checklist before reporting

Before reporting, check:

```text
Can you reproduce it?
Did you test /vpfx reload?
Did you test /vpfx off?
Did you test /vpfx reload builtin?
Did you attach latest.log?
Did you attach latest-vpfx-error.txt if it exists?
Did you attach the pack zip if it is pack-related?
Did you include VPFX version?
Did you include Minecraft version?
Did you include GPU and operating system?
Did you explain expected vs actual behavior?
```

A clear report saves time for everyone.

---

## 67. Next document

This document covers common loading, validation, shader, target, runtime, and shadow troubleshooting.

The next document should be:

```text
08 - VPFX Pack Publishing Guide
```

That document should explain:

```text
how to package a VPFX pack
how to version it
how to write release notes
what screenshots to include
how to label experimental packs
what information to include for players
how to submit packs for showcase or community testing
```
