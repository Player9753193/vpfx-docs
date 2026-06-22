---
title: Community Quick Start
description: VPFX community quick start guide for players and pack authors.
---

# VPFX Community Quick Start

VPFX, also known as **Vulkan PostFX**, is an experimental post-processing and shadow pipeline for the Minecraft Fabric client.

The goal of VPFX is not to ship only one fixed visual style. The goal is to provide a runtime where external VPFX shaderpacks can be loaded, tested, shared, and improved by the community.

VPFX now has a working foundation for external shaderpacks, post-processing passes, world shadow maps, `shadow_depth`, terrain shadows, entity shadows, player shadows, block entity shadows, and an in-game shaderpack selection GUI.

This means the project is ready to move beyond “players waiting for updates.”\
Players can start testing. Pack authors can start writing.

***

## 1. Who is this for?

VPFX currently welcomes two types of community participation:

```
1. Players / testers
2. Shaderpack authors / pack creators

```

The VPFX core runtime is still maintained by the main project.\
Community members are not expected to modify the Java renderer, Mixins, runtime loader, or shadow pipeline.

***

## 2. For Players and Testers

You do not need to know GLSL, rendering pipelines, shadow matrices, or shader programming.

You can help by:

```
Installing VPFX
Testing VPFX shaderpacks
Taking screenshots or videos
Reporting visual issues
Reporting crashes
Testing performance
Trying different hardware and settings
Giving feedback to pack authors

```

Good player feedback is extremely valuable. A clear screenshot, a short video, or a reproducible bug report can help improve VPFX much faster than vague comments like “it does not work.”

***

## 3. For Shaderpack Authors

Shaderpack authors can create external VPFX packs without modifying the VPFX mod itself.

You can write:

```
Post-processing effects
Tone mapping
Color grading
Vignette effects
Bloom-style effects
Debug shaderpacks
Shadow receiver effects
Cinematic showcase packs

```

VPFX packs can use runtime-provided resources such as scene color, scene depth, and shadow depth, depending on what the pack declares and what the runtime supports.

The recommended first step is not to write a complex shadow shader.\
Start with a minimal color post-processing pack, make sure it loads, then gradually move into depth and shadow features.

***

## 4. What VPFX is not

VPFX is not currently intended to be a full Iris replacement.

VPFX is also not an OptiFine shaderpack compatibility layer. Existing OptiFine or Iris shaderpacks should not be expected to run without modification.

A better way to describe VPFX is:

```
An experimental external post-processing and shadow-pack platform for Minecraft Fabric.

```

VPFX packs should be written specifically for VPFX.

***

## 5. Player Quick Start

### Step 1: Install VPFX

Install VPFX like a normal Fabric client mod.

Basic setup:

```
1. Install Fabric Loader.
2. Install VPFX.
3. Launch Minecraft.
4. Enter the game.

```

VPFX uses the Minecraft `shaderpacks/` folder for external VPFX packs.

***

### Step 2: Install a VPFX shaderpack

Place the VPFX shaderpack `.zip` file into:

```
.minecraft/shaderpacks/

```

Important:

```
VPFX shaderpacks are not the same as OptiFine or Iris shaderpacks.

```

A valid VPFX pack zip should contain `pack.json` at the root of the zip.

Correct:

```
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

```
my_vpfx_pack.zip
└─ my_vpfx_pack/
   ├─ pack.json
   ├─ post_effect/
   └─ shaders/

```

If `pack.json` is hidden inside an extra folder, VPFX may not detect the pack correctly.

***

### Step 3: Select a pack in-game

Use the VPFX in-game shaderpack menu.

Default controls:

```
F7  - Open the VPFX shaderpack menu
F10 - Reload the current VPFX pack

```

Useful commands:

```
/vpfx list
/vpfx reload
/vpfx reload auto
/vpfx reload builtin
/vpfx off

```

Command notes:

```
/vpfx list
Lists detected VPFX packs.

/vpfx reload
Reloads the currently selected VPFX pack.

/vpfx reload auto
Scans the shaderpacks folder and tries to load an available external pack.

/vpfx reload builtin
Loads the built-in VPFX debug or showcase pack.

/vpfx off
Disables VPFX and returns to the vanilla rendering path.

```

***

## 6. How to Report Bugs

When reporting a bug, please include as much useful information as possible.

Recommended bug report format:

```
Minecraft version:
Fabric Loader version:
VPFX version:
Operating system:
GPU:
CPU:
RAM:
Shaderpack name:
Shaderpack version:
World shadows enabled:
Entity shadows enabled:
Player shadows enabled:
Block entity shadows enabled:
Screenshot or video:
Steps to reproduce:
latest.log:

```

Good reports help a lot.\
Bad reports are hard to act on.

Example of a useful report:

```
When using VPFX 1.15.5 with the BSL Tone Shadow Showcase pack, player shadows work, but block entity shadows flicker when I rotate the camera near chests. This happens in a flat world at noon. F9 shadow debug shows the chest depth appearing and disappearing. Log attached.

```

Example of a bad report:

```
shadows broken

```

***

## 7. Shaderpack Author Quick Start

A minimal VPFX pack looks like this:

```
minimal_vpfx_pack/
├─ pack.json
├─ post_effect/
│  └─ main.json
└─ shaders/
   └─ composite/
      ├─ final.vsh
      └─ final.fsh

```

When zipped, `pack.json` must be at the root.

Correct zip layout:

```
minimal_vpfx_pack.zip
├─ pack.json
├─ post_effect/main.json
└─ shaders/composite/final.vsh
└─ shaders/composite/final.fsh

```

***

## 8. Minimal pack.json

`pack.json` describes the pack.

Example:

```
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

Recommended rules:

```
Use lowercase pack IDs.
Use only letters, numbers, underscores, hyphens, and dots.
Keep the first pack simple.
Do not enable shadow_depth in your first test pack.

```

Start with scene color only. Once your pack loads and renders correctly, move on to scene depth and shadow depth.

***

## 9. Minimal post\_effect/main.json

Example:

```
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

This pass reads:

```
minecraft:scene_color

```

Then writes to:

```
minecraft:main

```

The shader reference:

```
example_minimal_pack:composite/final

```

maps to:

```
shaders/composite/final.vsh
shaders/composite/final.fsh

```

***

## 10. Minimal final.vsh

```
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

***

## 11. Minimal final.fsh

```
#version 150

uniform sampler2D InSampler;

in vec2 texCoord;
out vec4 fragColor;

void main() {
    vec4 color = texture(InSampler, texCoord);
    fragColor = color;
}

```

Sampler naming note:

```
sampler_name: "In"

```

becomes:

```
uniform sampler2D InSampler;

```

So:

```
In    -> InSampler
Color -> ColorSampler
Scene -> SceneSampler

```

***

## 12. First simple effect

After your minimal pack works, try a very small color effect:

```
#version 150

uniform sampler2D InSampler;

in vec2 texCoord;
out vec4 fragColor;

void main() {
    vec4 color = texture(InSampler, texCoord);

    float contrast = 1.06;
    vec3 contrasted = (color.rgb - 0.5) * contrast + 0.5;

    vec3 warm = contrasted * vec3(1.04, 0.98, 0.92);

    float vignette = 1.0 - smoothstep(
        0.48,
        1.32,
        length(texCoord - 0.5) * 1.38
    );

    fragColor = vec4(warm * vignette, color.a);
}

```

This does not use scene depth or shadow depth.\
It is a good first test because it only modifies the final image color.

***

## 13. About shadow\_depth

VPFX provides `shadow_depth` for shadow-aware packs.

It may contain:

```
Terrain casters
Entity casters
Player casters
Block entity casters

```

Important rules:

```
shadow_depth is not the main camera depth.
shadow_depth uses shadow-space depth.
shadow_depth uses reversed-Z.
shadow_depth is based on shadowOrigin-relative world positions.
shadow_depth should be used with VPFX-provided shadow uniforms.

```

Do not assume `shadow_depth` works like `minecraft:scene_depth`.

If you are writing your first VPFX pack, do not start with `shadow_depth`.\
Start with scene color, then scene depth, then shadow depth.

A separate `VPFX shadow_depth Guide` should be used before writing custom shadow receivers.

***

## 14. Common mistakes

### Pack does not appear

Check:

```
The zip is inside shaderpacks/.
pack.json is at the root of the zip.
pack.json is valid JSON.
pack_id is valid.
The pack is not inside an extra nested folder.

```

### Shader is missing

Check:

```
The shader path uses pack_id:path.
The pack_id matches pack.json.
The shader files are inside shaders/.
Both .vsh and .fsh exist.
File names and folder names match exactly.

```

### Black screen

Check:

```
The fragment shader writes fragColor.
The sampler uniform name is correct.
The final pass outputs to minecraft:main.
The pack is not reading from a target before it has been written.

```

### Self-read/write issue

Do not read and write the same custom target in one pass.

Bad example:

```
{
  "inputs": [
    {
      "sampler_name": "Temp",
      "target": "example_pack:temp"
    }
  ],
  "output": "example_pack:temp"
}

```

Use separate targets or a ping-pong setup instead.

***

## 15. Recommended learning path

For players:

```
1. Install VPFX.
2. Install a VPFX shaderpack.
3. Select it with F7.
4. Reload it with F10.
5. Submit screenshots, videos, and useful bug reports.

```

For pack authors:

```
1. Create a minimal post-processing pack.
2. Modify the final fragment shader.
3. Add simple color grading.
4. Learn custom targets.
5. Learn multiple passes.
6. Learn scene depth.
7. Learn shadow depth.
8. Publish your own VPFX shaderpack.

```

***

## 16. Current community goal

The current goal is to build a healthy VPFX pack ecosystem.

We need:

```
More testers
More screenshots
More hardware feedback
More minimal working packs
More tone mapping packs
More debug packs
More shadow experiments
More showcase packs

```

If you are a player, start by testing and reporting.

If you are a pack author, start with a minimal post-processing pack.

VPFX is moving from a single mod into a small shaderpack platform.\
The next step is community-made packs.
