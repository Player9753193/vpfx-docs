---
title: Pack Author Quick Start
description: Create your first VPFX shaderpack with a minimal post-processing pass.
---

# VPFX Pack Author Quick Start

This document is for shaderpack authors who want to create external VPFX packs.

The goal is simple:

```text
Create a minimal VPFX pack.
Load it in-game.
Modify the final fragment shader.
Reload it quickly.
Confirm that the pack works.
```

This guide does not require modifying VPFX Java code.
You only need to create files inside a VPFX shaderpack zip.

---

## 1. What you are building

A VPFX pack is an external shaderpack written specifically for VPFX.

A minimal VPFX pack can:

```text
Read the current scene color.
Run a fullscreen post-processing shader.
Write the result back to the main screen.
```

In other words:

```text
minecraft:scene_color
        |
        v
your fragment shader
        |
        v
minecraft:main
```

For your first pack, do not start with shadows, depth reconstruction, bloom chains, or multiple render targets. Start with one simple pass.

---

## 2. What VPFX packs are not

VPFX packs are not OptiFine shaderpacks.

VPFX packs are not Iris shaderpacks.

You should not expect an existing OptiFine or Iris shaderpack to run in VPFX without being rewritten.

A VPFX pack has its own structure:

```text
pack.json
post_effect/
shaders/
```

A VPFX pack should be written specifically for the VPFX runtime.

---

## 3. Requirements

You need:

```text
Minecraft with VPFX installed
A text editor
Basic GLSL knowledge
A zip tool
Access to the .minecraft/shaderpacks/ folder
```

Recommended editor:

```text
Visual Studio Code
IntelliJ IDEA
Any editor with JSON and GLSL highlighting
```

You do not need:

```text
Java modding knowledge
Mixin knowledge
Fabric API knowledge
VPFX core runtime source editing
```

---

## 4. Create the pack folder

Create a folder named:

```text
example_minimal_pack/
```

Inside it, create this structure:

```text
example_minimal_pack/
├─ pack.json
├─ post_effect/
│  └─ main.json
└─ shaders/
   └─ composite/
      ├─ final.vsh
      └─ final.fsh
```

The names are not special, but this guide will use:

```text
pack_id: example_minimal_pack
entry file: post_effect/main.json
shader path: composite/final
```

Keep the first pack boring. A boring first pack is good because it lets you confirm that the pipeline works.

---

## 5. Write pack.json

Create:

```text
pack.json
```

Example:

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

Important rules:

```text
pack_id should be lowercase.
pack_id should not contain spaces.
pack_id should match the namespace used in shader references.
entry_post_effect should point to your main post effect graph.
```

Good pack IDs:

```text
example_minimal_pack
cinematic_tone_pack
myname.color_grade
debug-shadow-view
```

Bad pack IDs:

```text
Example Pack
My Shader!!!
cool pack 1
```

For your first pack, use:

```json
"shadow_depth": false
```

Do not use `shadow_depth` until your basic color pass works.

---

## 6. Write post_effect/main.json

Create:

```text
post_effect/main.json
```

Example:

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

This defines one fullscreen pass.

It reads:

```text
minecraft:scene_color
```

It writes:

```text
minecraft:main
```

The shader reference:

```text
example_minimal_pack:composite/final
```

maps to:

```text
shaders/composite/final.vsh
shaders/composite/final.fsh
```

The part before `:` is the pack namespace.
The part after `:` is the path inside the `shaders/` folder.

---

## 7. Write final.vsh

Create:

```text
shaders/composite/final.vsh
```

Use this fullscreen triangle vertex shader:

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

This draws a fullscreen triangle without needing a vertex buffer.

---

## 8. Write final.fsh

Create:

```text
shaders/composite/final.fsh
```

Use this minimal fragment shader:

```glsl
#version 150

uniform sampler2D InSampler;

in vec2 texCoord;
out vec4 fragColor;

void main() {
    vec4 color = texture(InSampler, texCoord);
    fragColor = color;
}
```

This shader does nothing visually. It copies the scene color to the output.

That is intentional.

Your first goal is not to make a beautiful effect.
Your first goal is to confirm that the pack loads and renders correctly.

---

## 9. Understand sampler names

In `main.json`, you wrote:

```json
{
  "sampler_name": "In",
  "target": "minecraft:scene_color"
}
```

In GLSL, that becomes:

```glsl
uniform sampler2D InSampler;
```

The naming pattern is:

```text
<sampler_name>Sampler
```

Examples:

```text
In       -> InSampler
Color    -> ColorSampler
Scene    -> SceneSampler
Depth    -> DepthSampler
Shadow   -> ShadowSampler
```

If your sampler name and GLSL uniform do not match, your pack may fail or render incorrectly.

---

## 10. Zip the pack correctly

When you zip the pack, `pack.json` must be at the root of the zip.

Correct:

```text
example_minimal_pack.zip
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
example_minimal_pack.zip
└─ example_minimal_pack/
   ├─ pack.json
   ├─ post_effect/
   │  └─ main.json
   └─ shaders/
      └─ composite/
         ├─ final.vsh
         └─ final.fsh
```

The second structure has an extra nested folder. VPFX may not detect it correctly.

---

## 11. Install the pack

Copy the zip file to:

```text
.minecraft/shaderpacks/
```

Then start Minecraft with VPFX installed.

Open the VPFX shaderpack menu:

```text
F7
```

Select your pack.

Click Done.

If the pack loads, the screen should look the same as vanilla because your shader currently only copies the scene color.

That is a successful first test.

---

## 12. Reload while editing

After changing your shader files, rebuild the zip and reload the pack.

Default reload key:

```text
F10
```

Command:

```text
/vpfx reload
```

Useful commands:

```text
/vpfx list
/vpfx reload
/vpfx reload auto
/vpfx reload builtin
/vpfx off
```

A typical edit loop is:

```text
Edit final.fsh
Zip the pack again
Copy it to shaderpacks/
Press F10 in-game
Check the result
Repeat
```

Later, tooling can make this faster, but the manual loop is enough for the first pack.

---

## 13. Make your first visible effect

Once the copy pass works, modify `final.fsh`.

Try this:

```glsl
#version 150

uniform sampler2D InSampler;

in vec2 texCoord;
out vec4 fragColor;

void main() {
    vec4 color = texture(InSampler, texCoord);

    float contrast = 1.08;
    vec3 result = (color.rgb - 0.5) * contrast + 0.5;

    result *= vec3(1.04, 0.99, 0.94);

    fragColor = vec4(result, color.a);
}
```

This adds a small contrast boost and a slight warm tone.

If you see the image change, your VPFX pack is working.

---

## 14. Add a simple vignette

Try this version:

```glsl
#version 150

uniform sampler2D InSampler;

in vec2 texCoord;
out vec4 fragColor;

void main() {
    vec4 color = texture(InSampler, texCoord);

    vec3 result = color.rgb;

    float contrast = 1.06;
    result = (result - 0.5) * contrast + 0.5;

    result *= vec3(1.04, 0.98, 0.92);

    float dist = length(texCoord - vec2(0.5));
    float vignette = 1.0 - smoothstep(0.42, 0.78, dist);

    result *= mix(0.72, 1.0, vignette);

    fragColor = vec4(result, color.a);
}
```

This is still a single-pass effect.

It uses only:

```text
minecraft:scene_color
```

It does not use scene depth or shadow depth.

---

## 15. Recommended first-pack rules

For your first VPFX pack:

```text
Use one pass.
Use only scene_color.
Output to minecraft:main.
Do not use custom targets yet.
Do not use scene_depth yet.
Do not use shadow_depth yet.
Do not use history buffers yet.
Do not use compute.
```

This keeps debugging simple.

Once this works, you can gradually add complexity.

---

## 16. Common issue: pack does not appear

Check:

```text
The zip is inside .minecraft/shaderpacks/.
pack.json is at the root of the zip.
pack.json is valid JSON.
pack_id is valid.
The file extension is .zip.
The pack is not inside an extra nested folder.
```

Also check the game log:

```text
.minecraft/logs/latest.log
```

Search for:

```text
VPFX
```

---

## 17. Common issue: shader is missing

If the shader cannot be found, check your shader reference.

In `main.json`:

```json
"fragment_shader": "example_minimal_pack:composite/final"
```

This must match:

```text
pack_id = example_minimal_pack
file = shaders/composite/final.fsh
```

Also check:

```text
Is the folder named shaders, not shader?
Is the file extension .fsh, not .frag?
Is the path lowercase and consistent?
Does final.vsh exist too?
```

---

## 18. Common issue: black screen

A black screen usually means one of these happened:

```text
The shader failed to compile.
The fragment shader did not write fragColor.
The sampler uniform name is wrong.
The pass did not output to minecraft:main.
The pack read from an invalid target.
The pack has a JSON syntax error.
```

Check `latest.log` first.

Also try returning a constant color:

```glsl
#version 150

in vec2 texCoord;
out vec4 fragColor;

void main() {
    fragColor = vec4(1.0, 0.0, 1.0, 1.0);
}
```

If the screen becomes magenta, the shader is running.
If not, the pass is probably not executing or the shader failed to compile.

---

## 19. Common issue: sampler does not work

If this does not work:

```glsl
uniform sampler2D In;
```

Use this instead:

```glsl
uniform sampler2D InSampler;
```

The sampler name from JSON gets `Sampler` appended in GLSL.

JSON:

```json
"sampler_name": "In"
```

GLSL:

```glsl
uniform sampler2D InSampler;
```

---

## 20. Common issue: JSON syntax

JSON does not allow trailing commas.

Invalid:

```json
{
  "format_version": 1,
  "pack_id": "example_minimal_pack",
}
```

Valid:

```json
{
  "format_version": 1,
  "pack_id": "example_minimal_pack"
}
```

If the pack suddenly disappears after editing JSON, check for:

```text
Trailing commas
Missing commas
Missing quotes
Wrong brackets
Invalid file encoding
```

---

## 21. About custom targets

A custom target is an intermediate render target used between passes.

You do not need custom targets for your first pack.

Later, custom targets are useful for:

```text
Blur
Bloom
Multi-pass tone mapping
Temporal effects
Debug overlays
Downsample / upsample chains
```

A future document will explain targets and multi-pass graphs in detail.

For now, keep:

```json
"targets": {}
```

and write directly to:

```text
minecraft:main
```

---

## 22. About scene_depth

`minecraft:scene_depth` is the main camera depth.

It can be used for:

```text
Fog effects
Depth-based color grading
Depth debug views
Underwater or distance effects
Outline-like effects
```

Do not use it in your first pack.
Depth requires understanding depth format and reconstruction rules.

Use scene color first.

---

## 23. About shadow_depth

`shadow_depth` is VPFX shadow map depth.

It may include:

```text
Terrain casters
Entity casters
Player casters
Block entity casters
```

Important:

```text
shadow_depth is not the same as scene_depth.
shadow_depth is not main camera depth.
shadow_depth uses shadow-space coordinates.
shadow_depth uses reversed-Z.
shadow_depth is based on shadowOrigin-relative world positions.
```

Do not use `shadow_depth` in your first pack.

Read the dedicated `VPFX shadow_depth Guide` before writing custom shadow receivers.

---

## 24. What to share when asking for help

When asking for help with a pack, include:

```text
Your pack zip
VPFX version
Minecraft version
A screenshot of the problem
latest.log
What you expected to happen
What actually happened
```

If the issue is shader-related, also include:

```text
pack.json
post_effect/main.json
The shader file that fails
```

A good help request:

```text
I am making a single-pass color grading pack. The pack appears in the VPFX menu, but selecting it gives a black screen. I expected the image to become warmer. latest.log shows a shader compile error near line 12 in final.fsh. Pack zip attached.
```

A bad help request:

```text
my pack broken
```

---

## 25. Suggested first pack ideas

Good first packs:

```text
Warm tone pack
Cold tone pack
High contrast pack
Low saturation pack
Simple vignette pack
Night visibility test pack
Depth-free cinematic pack
Debug solid color pack
```

Avoid these for your first pack:

```text
Full shadow receiver
Bloom chain
Temporal accumulation
Motion blur
Screen-space reflections
Complex depth reconstruction
Iris shaderpack port
```

Start small.
Make one thing work.
Then add one more thing.

---

## 26. Pack author checklist

Before sharing your pack, check:

```text
Does pack.json exist at the zip root?
Does pack_id match your shader namespace?
Does the pack appear in the VPFX menu?
Does it load without errors?
Does F10 reload work?
Does /vpfx off recover vanilla rendering?
Does the pack output to minecraft:main?
Does latest.log contain VPFX errors?
Did you test in at least one normal world?
Did you test day and night if your effect changes brightness?
```

---

## 27. Recommended development path

A good learning path:

```text
1. Minimal copy pass
2. Simple color grading
3. Vignette
4. Multiple passes
5. Custom targets
6. Scene depth
7. Shadow depth
8. Shadow receiver
9. Showcase pack
```

Do not skip straight to step 7.

Most pack authoring problems become easier once you understand steps 1–5.

---

## 28. Final goal

By the end of this guide, you should have:

```text
A valid VPFX pack zip
A working pack.json
A working post_effect/main.json
A fullscreen vertex shader
A fragment shader that modifies scene color
A pack that appears in the VPFX menu
A pack that reloads with F10
```

Once you have that, you are ready for the next document:

```text
03 - Pack Manifest Format
```

That document will explain every `pack.json` field in detail.
