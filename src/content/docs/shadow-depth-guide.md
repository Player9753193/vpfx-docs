---
title: shadow_depth Guide
description: Guide to VPFX shadow_depth target for shaderpack authors.
---

# VPFX shadow_depth Guide

This document explains the current VPFX `shadow_depth` target.

It is written for VPFX shaderpack authors who want to inspect, debug, or eventually use VPFX shadow maps.

Important:

```text
shadow_depth is not scene_depth.
shadow_depth is not main camera depth.
shadow_depth is a light-space shadow map.
shadow_depth currently uses reversed-Z depth.
```

If you are writing your first VPFX pack, do not start here.
Start with scene color, then scene depth, then read this guide.

---

## 1. What shadow_depth is

`shadow_depth` is the VPFX shadow map depth target.

It is rendered before VPFX post-processing passes so that a shaderpack can sample the shadow map as an input texture.

Current public target aliases:

```text
vulkanpostfx:shadow_depth
minecraft:shadow_depth
```

Recommended target name:

```text
vulkanpostfx:shadow_depth
```

Use `minecraft:shadow_depth` only as a compatibility alias.

---

## 2. What shadow_depth is not

`shadow_depth` is not:

```text
the main camera depth
minecraft:scene_depth
a screen-space depth buffer
a color texture
an Iris-compatible shadow map API
a complete custom receiver API by itself
```

Do not treat it like this:

```glsl
float sceneDepth = texture(ShadowSampler, texCoord).r;
```

That reads the shadow map at screen UVs, not the scene depth at the current pixel.

---

## 3. Current shadow_depth contents

In the current VPFX shadow pass, `shadow_depth` is written by the shadow caster pipeline.

The current code path guarantees:

```text
terrain shadow casters
entity shadow casters
player model shadow casters through entity rendering
held item shadow casters through entity rendering
moving/block-model submits that arrive through eligible entity rendering
```

Entity shadow submission filters out:

```text
vanilla circular entity blob shadows
name tags
text
flame
leash
outlines
gizmos
particles
custom geometry that is not explicitly allowed
```

This means `shadow_depth` is intended to contain real caster geometry, not vanilla entity shadow decals.

Dedicated block entity caster coverage may be version-dependent. If you are testing block entity shadows, use the shadow debug view and verify whether the object actually appears in `shadow_depth`.

---

## 4. How shadow_depth is created

VPFX allocates a square shadow target.

Current default request:

```text
8192 x 8192
```

If allocation fails, the runtime can fall back to a lower size. The minimum fallback size in the current code is:

```text
1024 x 1024
```

The actual current size is exposed to shaders as:

```glsl
vpfx_ShadowMapSize
```

If no shadow map is available, this value may be `0.0`.

---

## 5. Shadow map depth convention

VPFX currently uses reversed-Z for the shadow map.

Important rules:

```text
clear depth = 0.0
nearer shadow casters write larger depth values
farther values are smaller
depth test uses greater-or-equal style behavior
```

This is different from the common beginner assumption that “smaller depth means closer.”

For VPFX shadow depth:

```text
larger value = closer to the shadow camera
0.0 = cleared / empty / far side
```

---

## 6. How to request shadow_depth in pack.json

If your pack needs `shadow_depth`, declare it in `pack.json`.

Example:

```json
{
  "format_version": 1,
  "pack_id": "example_shadow_debug",
  "name": "Example Shadow Debug",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "A VPFX pack that visualizes shadow_depth.",
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

Rules:

```text
capabilities.shadow_depth must be true.
targets.shadow_depth must exist.
targets.shadow_depth should map to vulkanpostfx:shadow_depth.
compute must currently remain false.
```

If `shadow_depth` is enabled but `targets.shadow_depth` is missing, VPFX rejects the manifest.

---

## 7. How to read shadow_depth in post_effect/main.json

Use `vulkanpostfx:shadow_depth` as a pass input.

Recommended example:

```json
{
  "targets": {},
  "passes": [
    {
      "id": "shadow_depth_debug",
      "debug_label": "Shadow Depth Debug",
      "vertex_shader": "example_shadow_debug:post/fullscreen",
      "fragment_shader": "example_shadow_debug:post/shadow_depth_debug",
      "inputs": [
        {
          "sampler_name": "Shadow",
          "target": "vulkanpostfx:shadow_depth",
          "use_depth_buffer": true
        }
      ],
      "output": "minecraft:main"
    }
  ]
}
```

In the current native graph path, `vulkanpostfx:shadow_depth` is treated as a depth input automatically, but `use_depth_buffer: true` is recommended for clarity.

GLSL sampler name:

```glsl
uniform sampler2D ShadowSampler;
```

because:

```json
"sampler_name": "Shadow"
```

maps to:

```text
ShadowSampler
```

---

## 8. Minimal shadow_depth debug shader

This shader displays the shadow map directly.

```glsl
#version 150

uniform sampler2D ShadowSampler;

in vec2 texCoord;
out vec4 fragColor;

void main() {
    float d = texture(ShadowSampler, texCoord).r;
    fragColor = vec4(vec3(d), 1.0);
}
```

This is useful for checking whether `shadow_depth` exists and whether casters are being written.

It is not a shadow receiver.

---

## 9. Better debug visualization

Because reversed-Z uses larger values for closer casters, raw depth may look unintuitive.

Try this:

```glsl
#version 150

uniform sampler2D ShadowSampler;

in vec2 texCoord;
out vec4 fragColor;

void main() {
    float d = texture(ShadowSampler, texCoord).r;

    // Empty cleared areas are near 0.0.
    float visible = smoothstep(0.0001, 0.01, d);

    // Boost contrast for debugging.
    float boosted = pow(clamp(d, 0.0, 1.0), 0.25);

    vec3 color = mix(vec3(0.02, 0.02, 0.04), vec3(boosted), visible);
    fragColor = vec4(color, 1.0);
}
```

This makes very small non-zero depth values easier to see.

---

## 10. Built-in debug view

VPFX includes a built-in shadow depth debug effect.

The current built-in graph reads:

```text
vulkanpostfx:shadow_depth
```

with:

```json
"use_depth_buffer": true
```

and displays the depth value directly.

The default debug key is:

```text
F9
```

Use this when testing whether terrain, entities, players, or other casters are present in the shadow map.

---

## 11. Required uniforms for shadow-aware work

VPFX currently exposes these public built-in shadow-related values through `VpfxBuiltins`:

```glsl
vpfx_ShadowMapSize
vpfx_ShadowBias
vpfx_ShadowViewMatrix
vpfx_InverseShadowViewMatrix
vpfx_ShadowProjectionMatrix
vpfx_InverseShadowProjectionMatrix
vpfx_ShadowViewProjectionMatrix
vpfx_ShadowLightPosition
vpfx_ShadowAngle
```

Raw matrix aliases also exist:

```glsl
shadowModelView
shadowProjection
shadowViewProjection
```

These are public post-effect uniforms.

---

## 12. Important current limitation: shadowOrigin

The current internal VPFX shadow caster and terrain receiver pipeline uses a stable shadow origin.

Internal caster and receiver logic uses this rule:

```text
shadow-relative position = world position - shadowOrigin
```

Then:

```text
shadow clip position = ShadowViewProjectionMatrix * vec4(shadow-relative position, 1.0)
```

However, in the current public `VpfxBuiltins` block, `shadowOrigin` is not exposed as a public post-effect uniform.

This matters.

If an external pack reconstructs world position from `scene_depth`, it gets a main-camera world position. To correctly project that position into VPFX shadow space, the pack also needs the same `shadowOrigin` used by the shadow caster pass.

Without public `shadowOrigin`, a pack should not assume it can write a correct full custom terrain shadow receiver only from:

```glsl
vpfx_WorldPositionFromRaw(...)
vpfx_ShadowViewProjectionMatrix
```

That is incomplete for the current internal shadow-space convention.

---

## 13. Safe uses of shadow_depth right now

The following uses are safe for community packs in the current public API:

```text
direct shadow_depth debug display
shadow map inspection
caster coverage debugging
stylized full-screen visualization
pack loading tests requiring shadow_depth
experimental tools for checking whether the shadow target is available
```

Examples:

```text
show shadow_depth on screen
tint the image when shadow_depth is available
visualize shadow map occupancy
make a debug pack for pack authors
```

---

## 14. Risky uses of shadow_depth right now

The following uses are risky with the current public API:

```text
writing a physically correct custom terrain shadow receiver
reprojecting scene pixels into shadow map space
doing screen-space shadow compare from scene_depth
replacing the built-in terrain receiver
porting Iris shadow receiver code directly
assuming shadow_depth uses main-camera UVs
```

These require a stable public shadow-space contract that includes `shadowOrigin`.

A future VPFX version should expose `shadowOrigin` publicly before external packs are encouraged to implement full custom receivers.

---

## 15. Why texCoord sampling is not enough

This code samples the shadow map as an image:

```glsl
float d = texture(ShadowSampler, texCoord).r;
```

That is fine for debug display.

But this does not answer:

```text
Is the current screen pixel in shadow?
```

To answer that, a shader must:

```text
1. Read scene depth.
2. Reconstruct the screen pixel's world position.
3. Convert world position into VPFX shadow-relative space.
4. Apply VPFX shadow view-projection.
5. Convert to shadow map UV.
6. Compare receiver depth against stored shadow depth.
7. Apply bias and filtering.
```

The missing public piece today is:

```text
shadowOrigin
```

So direct `texCoord` sampling is only a debug view, not a real receiver.

---

## 16. Internal terrain receiver behavior

VPFX currently has an internal terrain receiver path.

The internal receiver uses an internal uniform block:

```glsl
layout(std140) uniform VpfxTerrainShadow
```

This internal block includes:

```text
ShadowInfo
ShadowLightInfo
ShadowOriginInfo
ShadowViewProjMat
```

The internal receiver can correctly compute:

```text
worldPos - ShadowOriginInfo.xyz
```

because `ShadowOriginInfo` is provided internally.

External VPFX post-effect packs should not rely on `VpfxTerrainShadow`, because it is not the public post-effect uniform contract.

Use `VpfxBuiltins` for external pack shaders.

---

## 17. Internal receiver side-face artifact rule

The internal terrain receiver avoids using player-screen derivatives to decide whether block faces can receive shadows.

The current receiver uses stable block/face information from chunk vertex color to avoid side-face diagonal artifacts.

For external authors, the important rule is:

```text
Do not use player camera direction or screen-space derivatives to decide shadow direction.
```

Shadow direction must come from:

```text
the light direction
the shadow matrices
the VPFX shadow-space contract
```

not from the player look direction.

---

## 18. Correct mental model

Think of `shadow_depth` like this:

```text
A square texture rendered from the sun or moon's shadow view.
It stores caster depth in shadow space.
It is centered around a stable shadow origin near the player for coverage.
It does not rotate with the player's camera.
It is not laid out like the screen.
```

Wrong mental model:

```text
shadow_depth is a grayscale screen overlay.
```

Correct mental model:

```text
shadow_depth is a light-space map.
```

---

## 19. Current shadow light selection

VPFX chooses a primary shadow light.

Current possible primary lights:

```text
sun
moon
none
```

At low-light transition periods, such as sunrise or sunset, VPFX may choose:

```text
none
```

When primary light is `none`, dynamic shadow rendering may be disabled or faded out.

The shadow map should not be assumed to be valid at all times of day.

Use:

```glsl
vpfx_ShadowMapSize > 0.5
```

as a basic shader-side availability check, but remember that this only checks target size, not whether a physically useful shadow pass was rendered this frame.

---

## 20. Shadow map availability checklist

A shadow-aware pack should expect `shadow_depth` to be unavailable or visually empty when:

```text
VPFX is disabled.
The pack did not request shadow_depth capability.
The runtime cannot allocate the shadow target.
The world is not loaded.
The shadow light is not renderable.
The current time is in a weak-light transition zone.
The shadow pass failed.
The active runtime has fallen back to vanilla/disabled behavior.
```

Do not crash or assume valid shadow content every frame.

---

## 21. Shader-side availability pattern

A simple debug shader can handle missing shadow maps like this:

```glsl
#version 150

uniform sampler2D InSampler;
uniform sampler2D ShadowSampler;

in vec2 texCoord;
out vec4 fragColor;

void main() {
    vec4 scene = texture(InSampler, texCoord);

    if (vpfx_ShadowMapSize <= 0.5) {
        fragColor = scene;
        return;
    }

    float d = texture(ShadowSampler, texCoord).r;
    float visible = smoothstep(0.0001, 0.01, d);

    vec3 debug = mix(scene.rgb, vec3(d), visible * 0.75);
    fragColor = vec4(debug, scene.a);
}
```

Graph inputs:

```json
"inputs": [
  {
    "sampler_name": "In",
    "target": "minecraft:scene_color"
  },
  {
    "sampler_name": "Shadow",
    "target": "vulkanpostfx:shadow_depth",
    "use_depth_buffer": true
  }
]
```

---

## 22. Reversed-Z compare concept

If you eventually write a custom receiver after the public API exposes the required data, remember the compare direction.

For reversed-Z shadow depth:

```text
storedDepth > receiverDepth + bias
```

usually means there is a closer caster between the light and the receiver.

A simplified compare shape looks like this:

```glsl
float blocker = smoothstep(
    0.00018,
    0.00155,
    storedDepth - receiverDepth - bias
);
```

This is only a conceptual example.
A real receiver also needs correct shadow UVs, edge checks, bias, filtering, and the correct shadow-origin-relative coordinate.

---

## 23. PCF concept

PCF means percentage-closer filtering.

The idea is:

```text
sample several nearby shadow texels
compare each one
average the result
```

Conceptual shape:

```glsl
float sum = 0.0;
float count = 0.0;

for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
        vec2 uv = shadowUv + vec2(x, y) * shadowTexel;
        float stored = texture(ShadowSampler, uv).r;
        sum += storedDepthCompare(stored, receiverDepth, bias);
        count += 1.0;
    }
}

float shadow = sum / count;
```

Do not use this directly until the public shadow receiver API is complete.

---

## 24. Bias concept

Shadow bias is used to reduce self-shadow artifacts.

VPFX exposes:

```glsl
vpfx_ShadowBias
```

Internal receiver logic also applies additional stability rules.

Common problems:

```text
bias too low  -> acne, stripes, diagonal artifacts
bias too high -> peter-panning, detached shadows
```

For external packs, treat `vpfx_ShadowBias` as a guide value, not a complete final solution.

---

## 25. Edge fade concept

Shadow maps only cover a finite region.

If a receiver samples near the edge of the shadow map, artifacts are likely.

A typical receiver should fade near edges:

```glsl
float edgeFade(vec2 uv) {
    vec2 edge = min(uv, 1.0 - uv);
    return smoothstep(0.0, 0.04, min(edge.x, edge.y));
}
```

Again, this is a receiver concept, not needed for a direct debug view.

---

## 26. No-player-view rule

VPFX shadow rendering must not depend on the player's view direction.

Allowed:

```text
Use player/camera position to choose a local coverage region.
Use light direction to build shadow view.
Use shadowOrigin to stabilize caster and receiver coordinates.
```

Not allowed:

```text
Use player yaw to rotate the shadow map.
Use player pitch to rotate the shadow map.
Use player look vector as shadow light direction.
Use screen-space derivatives to decide physical shadow direction.
Use main camera relative coordinates as shadow caster coordinates.
```

For pack authors, this means:

```text
If a shadow changes shape only because the player rotates the camera, something is wrong.
```

---

## 27. Relationship with vanilla entity shadows

Minecraft has vanilla circular entity shadows, sometimes called blob shadows.

VPFX suppresses those while the VPFX shadow map is active.

This avoids double shadows:

```text
vanilla circular blob shadow
+
VPFX shadow map entity shadow
=
incorrect double shadow
```

The suppressor only affects vanilla circular shadow submits. It does not remove VPFX entity shadow casters.

A useful test:

```text
VPFX off:
vanilla circular entity shadow may appear.

VPFX shadow map active:
vanilla circular entity shadow should disappear.
VPFX shadow map entity shadow should remain.
```

---

## 28. Relationship with external shaderpacks

If an external VPFX pack declares `shadow_depth`, it is saying:

```text
This pack expects the runtime to provide a VPFX shadow depth target.
```

The pack is not saying:

```text
The pack can automatically use all VPFX internal terrain receiver data.
```

Current safe authoring pattern:

```text
Use shadow_depth for debug and inspection.
Use it to verify caster coverage.
Wait for a documented public shadowOrigin uniform before writing full custom receivers.
```

---

## 29. Recommended shadow_depth debug pack

`pack.json`:

```json
{
  "format_version": 1,
  "pack_id": "example_shadow_depth_debug",
  "name": "Example Shadow Depth Debug",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "Displays VPFX shadow_depth for debugging.",
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
  },
  "metadata": {
    "tags": [
      "debug",
      "shadow-depth"
    ]
  }
}
```

`post_effect/main.json`:

```json
{
  "targets": {},
  "passes": [
    {
      "id": "shadow_debug",
      "debug_label": "Shadow Depth Debug",
      "vertex_shader": "example_shadow_depth_debug:post/fullscreen",
      "fragment_shader": "example_shadow_depth_debug:post/shadow_debug",
      "inputs": [
        {
          "sampler_name": "Shadow",
          "target": "vulkanpostfx:shadow_depth",
          "use_depth_buffer": true
        }
      ],
      "output": "minecraft:main"
    }
  ]
}
```

`shaders/post/fullscreen.vsh`:

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

`shaders/post/shadow_debug.fsh`:

```glsl
#version 150

uniform sampler2D ShadowSampler;

in vec2 texCoord;
out vec4 fragColor;

void main() {
    float d = texture(ShadowSampler, texCoord).r;

    float visible = smoothstep(0.0001, 0.01, d);
    float boosted = pow(clamp(d, 0.0, 1.0), 0.25);

    vec3 color = mix(vec3(0.02, 0.02, 0.04), vec3(boosted), visible);
    fragColor = vec4(color, 1.0);
}
```

---

## 30. Testing shadow_depth

When testing `shadow_depth`, check:

```text
flat terrain
walls
stairs
entities
players
held items
boats
minecarts
moving entities
time of day
camera rotation stability
```

Important tests:

```text
Open F9 shadow debug.
Check whether casters appear.
Rotate the camera without moving.
Check whether the shadow map content incorrectly changes with view direction.
Move around.
Check whether the shadow coverage updates near the player.
Change time of day.
Check whether shadows fade or disable near weak-light periods.
```

---

## 31. Common mistakes

### 31.1 Treating shadow_depth as scene_depth

Wrong:

```glsl
float viewDepth = texture(ShadowSampler, texCoord).r;
```

This samples the shadow map at screen UVs. It is not view depth.

---

### 31.2 Writing a receiver without shadowOrigin

Wrong assumption:

```text
worldPos * vpfx_ShadowViewProjectionMatrix is enough.
```

Current VPFX shadow space uses:

```text
(worldPos - shadowOrigin) * shadow matrix
```

`shadowOrigin` is not currently public in `VpfxBuiltins`.

---

### 31.3 Using player view direction

Wrong:

```text
Use camera look vector as shadow direction.
```

Correct:

```text
Use VPFX shadow light / shadow matrices.
```

---

### 31.4 Expecting shadow_depth to always be valid

Wrong:

```text
shadow_depth always contains useful data.
```

Correct:

```text
shadow_depth may be empty or unavailable depending on runtime state, world state, time of day, and fallback behavior.
```

---

### 31.5 Forgetting manifest capabilities

Wrong:

```json
"shadow_depth": false
```

while reading:

```json
"target": "vulkanpostfx:shadow_depth"
```

Correct:

```json
"shadow_depth": true
```

and:

```json
"targets": {
  "shadow_depth": "vulkanpostfx:shadow_depth"
}
```

---

## 32. Current authoring recommendation

For current VPFX pack authors:

```text
1. Use shadow_depth for debug packs first.
2. Use F9 to compare your output with the built-in shadow debug view.
3. Do not write a full custom terrain receiver until shadowOrigin is public.
4. Do not port Iris shadow receiver logic directly.
5. Do not assume shadow_depth is scene_depth.
6. Do not use player camera direction to drive shadow behavior.
```

The best current community shadow packs are likely to be:

```text
shadow debug packs
shadow map visualizers
caster coverage test packs
tools for checking shadow stability
experimental stylized shadow previews
```

Full receiver packs should wait for a more complete public shadow API.

---

## 33. Future public API needs

For external custom shadow receivers, VPFX should eventually expose:

```text
shadowOrigin
shadow frame validity
primaryLight
shadow light intensity
shadow distance
terrain/entity caster flags
receiver-space helper functions
possibly cascade data if cascaded shadows are added later
```

Once these are public and documented, external packs can safely implement full shadow receivers.

---

## 34. Summary

Remember these rules:

```text
shadow_depth is light-space depth.
shadow_depth uses reversed-Z.
shadow_depth is not scene_depth.
shadow_depth is sampled through vulkanpostfx:shadow_depth.
Use use_depth_buffer: true for clarity.
Declare shadow_depth in pack.json capabilities.
Declare targets.shadow_depth in pack.json.
Use shadow_depth safely for debug and visualization.
Do not write a full receiver without public shadowOrigin.
Do not use player view direction for shadow logic.
```

The next document should be:

```text
07 - Common Errors and Troubleshooting
```

That document should cover common loading, validation, shader compile, target, sampler, scene depth, and shadow depth mistakes.
