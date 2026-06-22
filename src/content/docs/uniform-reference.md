---
title: Uniform Reference
description: VPFX built-in uniform reference for shaderpack authors.
---

# VPFX Uniform Reference

This document describes the current public VPFX built-in uniforms available to VPFX pack shaders.

This reference is based on the current implementation of:

```text
VpfxBuiltinUniformBuffer
VpfxBuiltinUniformSourceInjector
VpfxFrameProjectionState
VpfxFrameEnvironmentState
VpfxNativeFrameGraphPipelineCache
VpfxNativeFrameGraphExecutor
```

The main public uniform block is:

```glsl
layout(std140) uniform VpfxBuiltins
```

VPFX automatically injects this block into `.vsh` and `.fsh` shader entry files unless the shader already declares it.

---

## 1. Scope of this document

This document covers uniforms available to external VPFX post-effect / fullscreen shaderpack passes.

It covers:

```text
Time uniforms
Frame size uniforms
Camera position
Projection matrices
View rotation matrices
Scene depth reconstruction helpers
Fog and sky uniforms
Sun, moon, and shadow light direction helpers
Shadow matrix uniforms
Shadow map size and bias
Iris-style aliases currently provided by VPFX
```

It does not fully document the internal terrain receiver uniform block:

```glsl
VpfxTerrainShadow
```

`VpfxTerrainShadow` is used internally by VPFX terrain shadow receiver shaders. External post-effect packs should use `VpfxBuiltins` unless a future API explicitly exposes additional terrain-shadow-specific blocks.

---

## 2. Automatic injection

VPFX preprocesses user shaders in this order:

```text
1. Expand #include directives.
2. Inject VPFX built-in uniform declarations.
```

The built-in uniform block is injected into:

```text
.vsh
.fsh
```

It is not injected into:

```text
.glsl include files
```

This prevents duplicate uniform block declarations when includes are reused by multiple shaders.

---

## 3. How to use built-in uniforms

In most shaders, you do not need to declare `VpfxBuiltins` manually.

You can directly use the provided macros:

```glsl
#version 150

uniform sampler2D InSampler;

in vec2 texCoord;
out vec4 fragColor;

void main() {
    vec3 color = texture(InSampler, texCoord).rgb;

    float pulse = 0.5 + 0.5 * sin(vpfx_Time);
    color *= mix(0.9, 1.1, pulse);

    fragColor = vec4(color, 1.0);
}
```

VPFX injects the required uniform block after the `#version` line.

---

## 4. Do not redeclare built-ins unless necessary

The injector skips injection if the shader source already contains one of these:

```text
VPFX_BUILTIN_UNIFORMS
layout(std140) uniform VpfxBuiltins
uniform VpfxBuiltins
```

For normal pack authoring, do not write your own `VpfxBuiltins` block.
Use the injected one.

Manual redeclaration can break if the runtime layout changes.

---

## 5. Full current GLSL block

The current injected block is:

```glsl
#ifndef VPFX_BUILTIN_UNIFORMS
#define VPFX_BUILTIN_UNIFORMS

layout(std140) uniform VpfxBuiltins {
    vec4 vpfx_TimeInfo;
    vec4 vpfx_ViewInfo;
    vec4 vpfx_SceneInfo;
    vec4 vpfx_ShadowInfo;
    vec4 vpfx_FogColorInfo;
    vec4 vpfx_FogDistanceInfoA;
    vec4 vpfx_FogDistanceInfoB;
    vec4 vpfx_SkyColorInfo;
    vec4 vpfx_CelestialAngleInfo;
    vec4 vpfx_SunPositionInfo;
    vec4 vpfx_MoonPositionInfo;
    vec4 vpfx_ShadowLightPositionInfo;
    vec4 vpfx_UpPositionInfo;
    mat4 gbufferProjection;
    mat4 vpfx_InverseProjectionMatrix;
    mat4 gbufferPreviousProjection;
    mat4 vpfx_PreviousInverseProjectionMatrix;
    mat4 gbufferModelView;
    mat4 vpfx_InverseViewRotationMatrix;
    mat4 gbufferPreviousModelView;
    mat4 vpfx_PreviousInverseViewRotationMatrix;
    mat4 vpfx_ViewProjectionMatrix;
    mat4 vpfx_InverseViewProjectionMatrix;
    mat4 shadowModelView;
    mat4 vpfx_InverseShadowViewMatrix;
    mat4 shadowProjection;
    mat4 vpfx_InverseShadowProjectionMatrix;
    mat4 vpfx_ShadowViewProjectionMatrix;
};

#endif
```

The block uses `std140` layout.

Current CPU-side layout size:

```text
13 vec4 + 15 mat4
1168 bytes
```

Pack authors normally do not need to care about the byte layout unless debugging GPU binding problems.

---

## 6. Time uniforms

Raw field:

```glsl
vec4 vpfx_TimeInfo;
```

Macros:

```glsl
#define vpfx_Time       (vpfx_TimeInfo.x)
#define vpfx_DeltaTime  (vpfx_TimeInfo.y)
#define vpfx_GameTime   (vpfx_TimeInfo.z)
#define vpfx_FrameIndex (vpfx_TimeInfo.w)
```

| Macro             |  Type | Meaning                                            |
| ----------------- | ----: | -------------------------------------------------- |
| `vpfx_Time`       | float | Accumulated runtime time in seconds.               |
| `vpfx_DeltaTime`  | float | Delta time in seconds for the current VPFX frame.  |
| `vpfx_GameTime`   | float | World game time in seconds when a world is loaded. |
| `vpfx_FrameIndex` | float | Incrementing frame counter stored as a float.      |

Example:

```glsl
float wave = 0.5 + 0.5 * sin(vpfx_Time * 2.0);
```

Use cases:

```text
animated color grading
debug flashing
temporal noise phase
simple time-based effects
```

---

## 7. View and weather uniforms

Raw field:

```glsl
vec4 vpfx_ViewInfo;
```

Macros:

```glsl
#define vpfx_CameraPos    (vpfx_ViewInfo.xyz)
#define vpfx_RainStrength (vpfx_ViewInfo.w)
```

| Macro               |  Type | Meaning                                               |
| ------------------- | ----: | ----------------------------------------------------- |
| `vpfx_CameraPos`    |  vec3 | Current camera/world position used by VPFX built-ins. |
| `vpfx_RainStrength` | float | Rain level, usually in `[0, 1]`.                      |

Example:

```glsl
float wetLook = smoothstep(0.2, 1.0, vpfx_RainStrength);
```

Important note:

`vpfx_CameraPos` is for main-scene reconstruction and general world-position effects.
Do not use camera view direction to decide shadow direction. VPFX shadow direction is based on the selected light direction and shadow matrices, not the player look direction.

---

## 8. View size uniforms

Raw field:

```glsl
vec4 vpfx_SceneInfo;
```

Macros:

```glsl
#define vpfx_ViewSize    (vpfx_SceneInfo.xy)
#define vpfx_InvViewSize (vpfx_SceneInfo.zw)
```

| Macro              | Type | Meaning                        |
| ------------------ | ---: | ------------------------------ |
| `vpfx_ViewSize`    | vec2 | Framebuffer width and height.  |
| `vpfx_InvViewSize` | vec2 | `1.0 / width`, `1.0 / height`. |

Example:

```glsl
vec2 texel = vpfx_InvViewSize;
vec3 left = texture(InSampler, texCoord - vec2(texel.x, 0.0)).rgb;
vec3 right = texture(InSampler, texCoord + vec2(texel.x, 0.0)).rgb;
```

Use cases:

```text
blur kernels
edge detection
pixel offsets
resolution-independent effects
```

---

## 9. Depth and shadow info uniforms

Raw field:

```glsl
vec4 vpfx_ShadowInfo;
```

Macros:

```glsl
#define vpfx_ZNear         (vpfx_ShadowInfo.x)
#define vpfx_ZFar          (vpfx_ShadowInfo.y)
#define vpfx_ShadowMapSize (vpfx_ShadowInfo.z)
#define vpfx_ShadowBias    (vpfx_ShadowInfo.w)
```

| Macro                |  Type | Meaning                                               |
| -------------------- | ----: | ----------------------------------------------------- |
| `vpfx_ZNear`         | float | Main camera near plane.                               |
| `vpfx_ZFar`          | float | Main camera far plane.                                |
| `vpfx_ShadowMapSize` | float | Current VPFX shadow map size. `0.0` when unavailable. |
| `vpfx_ShadowBias`    | float | Current built-in shadow bias value.                   |

Example:

```glsl
bool hasShadowMap = vpfx_ShadowMapSize > 0.5;
vec2 shadowTexel = hasShadowMap ? vec2(1.0 / vpfx_ShadowMapSize) : vec2(0.0);
```

Important:

`vpfx_ShadowMapSize > 0.0` only means a shadow target size is known. It does not by itself guarantee that a pack is correctly applying `shadow_depth`.

---

## 10. Fog color uniforms

Raw field:

```glsl
vec4 vpfx_FogColorInfo;
```

Macro:

```glsl
#define vpfx_FogColor (vpfx_FogColorInfo)
```

Alias:

```glsl
#define fogColor (vpfx_FogColor.rgb)
```

| Macro           | Type | Meaning                       |
| --------------- | ---: | ----------------------------- |
| `vpfx_FogColor` | vec4 | Current fog color.            |
| `fogColor`      | vec3 | Iris-style alias for fog RGB. |

Example:

```glsl
vec3 fogTint = fogColor;
```

---

## 11. Fog distance uniforms

Raw fields:

```glsl
vec4 vpfx_FogDistanceInfoA;
vec4 vpfx_FogDistanceInfoB;
```

Macros:

```glsl
#define vpfx_FogStart    (vpfx_FogDistanceInfoA.x)
#define vpfx_FogEnd      (vpfx_FogDistanceInfoA.y)
#define vpfx_SkyFogEnd   (vpfx_FogDistanceInfoB.x)
#define vpfx_CloudFogEnd (vpfx_FogDistanceInfoB.y)
#define vpfx_FogKind     (vpfx_FogDistanceInfoB.z)
```

Aliases:

```glsl
#define fogStart (vpfx_FogStart)
#define fogEnd   (vpfx_FogEnd)
```

| Macro              |  Type | Meaning                                    |
| ------------------ | ----: | ------------------------------------------ |
| `vpfx_FogStart`    | float | Fog start distance.                        |
| `vpfx_FogEnd`      | float | Fog end distance.                          |
| `vpfx_SkyFogEnd`   | float | Sky fog end distance.                      |
| `vpfx_CloudFogEnd` | float | Cloud fog end distance.                    |
| `vpfx_FogKind`     | float | Numeric fog kind value from runtime state. |

Use cases:

```text
fog-aware color grading
distance haze
debug fog views
dimension-specific atmosphere tuning
```

---

## 12. Sky color and day state

Raw field:

```glsl
vec4 vpfx_SkyColorInfo;
```

Macros:

```glsl
#define vpfx_SkyColor (vpfx_SkyColorInfo.rgb)
#define vpfx_IsDay    (vpfx_SkyColorInfo.w > 0.5)
```

Alias:

```glsl
#define skyColor (vpfx_SkyColor)
```

| Macro           |            Type | Meaning                                                               |
| --------------- | --------------: | --------------------------------------------------------------------- |
| `vpfx_SkyColor` |            vec3 | Current sky color.                                                    |
| `vpfx_IsDay`    | bool expression | Whether VPFX considers the current primary light to be day/sun-based. |
| `skyColor`      |            vec3 | Iris-style alias.                                                     |

Example:

```glsl
vec3 dayTone = vpfx_IsDay ? vec3(1.0, 0.98, 0.92) : vec3(0.75, 0.82, 1.0);
```

---

## 13. Celestial angle uniforms

Raw field:

```glsl
vec4 vpfx_CelestialAngleInfo;
```

Macros:

```glsl
#define vpfx_SunAngle    (vpfx_CelestialAngleInfo.x)
#define vpfx_MoonAngle   (vpfx_CelestialAngleInfo.y)
#define vpfx_ShadowAngle (vpfx_CelestialAngleInfo.z)
```

Aliases:

```glsl
#define sunAngle    (vpfx_SunAngle)
#define moonAngle   (vpfx_MoonAngle)
#define shadowAngle (vpfx_ShadowAngle)
```

| Macro              |  Type | Meaning                                  |
| ------------------ | ----: | ---------------------------------------- |
| `vpfx_SunAngle`    | float | Sun angle value from environment state.  |
| `vpfx_MoonAngle`   | float | Moon angle value from environment state. |
| `vpfx_ShadowAngle` | float | VPFX shadow angle value.                 |

Use these for broad time-of-day effects.

Example:

```glsl
float sunsetBoost = smoothstep(0.20, 0.30, vpfx_SunAngle) *
                    (1.0 - smoothstep(0.32, 0.42, vpfx_SunAngle));
```

---

## 14. Sun, moon, shadow light, and up vectors

Raw fields:

```glsl
vec4 vpfx_SunPositionInfo;
vec4 vpfx_MoonPositionInfo;
vec4 vpfx_ShadowLightPositionInfo;
vec4 vpfx_UpPositionInfo;
```

Macros:

```glsl
#define vpfx_SunPosition         (vpfx_SunPositionInfo.xyz)
#define vpfx_MoonPosition        (vpfx_MoonPositionInfo.xyz)
#define vpfx_ShadowLightPosition (vpfx_ShadowLightPositionInfo.xyz)
#define vpfx_UpPosition          (vpfx_UpPositionInfo.xyz)
```

Aliases:

```glsl
#define sunPosition         (vpfx_SunPosition)
#define moonPosition        (vpfx_MoonPosition)
#define shadowLightPosition (vpfx_ShadowLightPosition)
#define upPosition          (vpfx_UpPosition)
```

| Macro                      | Type | Meaning                                                                  |
| -------------------------- | ---: | ------------------------------------------------------------------------ |
| `vpfx_SunPosition`         | vec3 | Sun direction-like vector transformed into view space and scaled.        |
| `vpfx_MoonPosition`        | vec3 | Moon direction-like vector transformed into view space and scaled.       |
| `vpfx_ShadowLightPosition` | vec3 | Current selected shadow light vector: sun during day, moon during night. |
| `vpfx_UpPosition`          | vec3 | View-space up vector scaled by runtime.                                  |

Important:

These are direction-like helper vectors, not physical world coordinates of a real sun object.

Example:

```glsl
vec3 lightDirView = normalize(vpfx_ShadowLightPosition);
```

Use cases:

```text
light-aware tone mapping
day/night color grading
debug visualizations
simple directional post effects
```

---

## 15. Projection matrices

Raw matrices:

```glsl
mat4 gbufferProjection;
mat4 vpfx_InverseProjectionMatrix;
mat4 gbufferPreviousProjection;
mat4 vpfx_PreviousInverseProjectionMatrix;
```

Macros and aliases:

```glsl
#define vpfx_ProjectionMatrix         (gbufferProjection)
#define vpfx_PreviousProjectionMatrix (gbufferPreviousProjection)

#define gbufferProjectionInverse         (vpfx_InverseProjectionMatrix)
#define gbufferPreviousProjectionInverse (vpfx_PreviousInverseProjectionMatrix)
```

| Name                                   | Type | Meaning                                           |
| -------------------------------------- | ---: | ------------------------------------------------- |
| `vpfx_ProjectionMatrix`                | mat4 | Current main camera projection matrix.            |
| `vpfx_InverseProjectionMatrix`         | mat4 | Inverse of current main camera projection matrix. |
| `vpfx_PreviousProjectionMatrix`        | mat4 | Previous main camera projection matrix.           |
| `vpfx_PreviousInverseProjectionMatrix` | mat4 | Previous inverse main camera projection matrix.   |

Use cases:

```text
scene depth reconstruction
view-space position reconstruction
temporal effects
debug views
```

---

## 16. View rotation matrices

Raw matrices:

```glsl
mat4 gbufferModelView;
mat4 vpfx_InverseViewRotationMatrix;
mat4 gbufferPreviousModelView;
mat4 vpfx_PreviousInverseViewRotationMatrix;
```

Macros and aliases:

```glsl
#define vpfx_ViewRotationMatrix         (gbufferModelView)
#define vpfx_PreviousViewRotationMatrix (gbufferPreviousModelView)

#define gbufferModelViewInverse         (vpfx_InverseViewRotationMatrix)
#define gbufferPreviousModelViewInverse (vpfx_PreviousInverseViewRotationMatrix)
```

Important:

`gbufferModelView` in VPFX post-effect shaders is a camera-relative rotation matrix. It does not include a full world translation.

This differs from a full model-view matrix used during normal geometry rendering.

Use cases:

```text
rotating reconstructed view-space directions into world-relative directions
scene depth reconstruction helpers
view-aware debug effects
```

---

## 17. View-projection matrices

Raw matrices:

```glsl
mat4 vpfx_ViewProjectionMatrix;
mat4 vpfx_InverseViewProjectionMatrix;
```

| Name                               | Type | Meaning                                    |
| ---------------------------------- | ---: | ------------------------------------------ |
| `vpfx_ViewProjectionMatrix`        | mat4 | Current projection * view-rotation matrix. |
| `vpfx_InverseViewProjectionMatrix` | mat4 | Inverse of current view-projection matrix. |

These are used by VPFX helper functions to reconstruct world-space positions from raw scene depth.

Important:

The reconstructed world position uses `vpfx_CameraPos` to restore world translation.

---

## 18. Shadow matrices

Raw matrices:

```glsl
mat4 shadowModelView;
mat4 vpfx_InverseShadowViewMatrix;
mat4 shadowProjection;
mat4 vpfx_InverseShadowProjectionMatrix;
mat4 vpfx_ShadowViewProjectionMatrix;
```

Macros and aliases:

```glsl
#define vpfx_ShadowViewMatrix       (shadowModelView)
#define vpfx_ShadowProjectionMatrix (shadowProjection)

#define shadowModelViewInverse      (vpfx_InverseShadowViewMatrix)
#define shadowProjectionInverse     (vpfx_InverseShadowProjectionMatrix)
#define shadowViewProjection        (vpfx_ShadowViewProjectionMatrix)
```

| Name                                 | Type | Meaning                                |
| ------------------------------------ | ---: | -------------------------------------- |
| `vpfx_ShadowViewMatrix`              | mat4 | Current VPFX shadow view matrix.       |
| `vpfx_InverseShadowViewMatrix`       | mat4 | Inverse shadow view matrix.            |
| `vpfx_ShadowProjectionMatrix`        | mat4 | Current VPFX shadow projection matrix. |
| `vpfx_InverseShadowProjectionMatrix` | mat4 | Inverse shadow projection matrix.      |
| `vpfx_ShadowViewProjectionMatrix`    | mat4 | `shadowProjection * shadowModelView`.  |

Important:

VPFX shadow matrices are based on the selected light direction and stable shadow-space rules. They must not be treated as the player camera view matrix.

Current limitation:

The public `VpfxBuiltins` block currently exposes shadow matrices, shadow map size, and shadow bias, but it does not expose `shadowOrigin` as a public post-effect uniform.

Because the internal shadow caster and terrain receiver use `worldPos - shadowOrigin`, external packs should not assume they can fully reconstruct shadow-map UVs from `scene_depth` using only `vpfx_WorldPositionFromRaw` and `vpfx_ShadowViewProjectionMatrix`.

For now:

```text
shadow_depth is safe for debug display.
shadow_depth can be sampled directly as a texture.
full custom terrain shadow receiver logic should wait for a public shadowOrigin uniform.
```

A later `shadow_depth` guide should document this more deeply.

---

## 19. Scene depth reconstruction helpers

VPFX injects two helper functions.

### 19.1 `vpfx_ViewPositionFromRaw`

```glsl
vec3 vpfx_ViewPositionFromRaw(sampler2D depthSampler, vec2 uv)
```

This reconstructs a view-space position from raw scene depth.

Example:

```glsl
vec3 viewPos = vpfx_ViewPositionFromRaw(DepthSampler, texCoord);
```

Use cases:

```text
depth debug
distance fog
view-space effects
depth-based edge detection
```

---

### 19.2 `vpfx_WorldPositionFromRaw`

```glsl
vec3 vpfx_WorldPositionFromRaw(sampler2D depthSampler, vec2 uv)
```

This reconstructs a world-space position from raw scene depth.

Implementation concept:

```text
raw scene depth
-> clip position
-> inverse view-projection
-> camera position added back
```

Example:

```glsl
vec3 worldPos = vpfx_WorldPositionFromRaw(DepthSampler, texCoord);
```

Use cases:

```text
world-height fog
distance-based color grading
debug world-position views
```

Important:

This helper reconstructs main-camera world position. It does not automatically convert positions into VPFX shadow-origin-relative coordinates.

---

## 20. Safe denominator helper

VPFX also injects:

```glsl
float vpfx_InternalSafeSignedDenominator(float value)
```

This is an internal helper used by the reconstruction functions.

Pack authors normally do not need to call it directly.

---

## 21. Example: scene depth debug view

`pack.json` should enable scene depth:

```json
"capabilities": {
  "scene_color": true,
  "scene_depth": true,
  "shadow_depth": false,
  "custom_targets": true,
  "compute": false
}
```

Graph input:

```json
{
  "sampler_name": "Depth",
  "target": "vulkanpostfx:scene_depth"
}
```

Fragment shader:

```glsl
#version 150

uniform sampler2D DepthSampler;

in vec2 texCoord;
out vec4 fragColor;

void main() {
    float rawDepth = texture(DepthSampler, texCoord).r;
    fragColor = vec4(vec3(rawDepth), 1.0);
}
```

This displays raw depth, not linearized distance.

---

## 22. Example: view-distance fog from depth

```glsl
#version 150

uniform sampler2D InSampler;
uniform sampler2D DepthSampler;

in vec2 texCoord;
out vec4 fragColor;

void main() {
    vec4 color = texture(InSampler, texCoord);

    vec3 viewPos = vpfx_ViewPositionFromRaw(DepthSampler, texCoord);
    float viewDistance = length(viewPos);

    float fogAmount = smoothstep(vpfx_FogStart, vpfx_FogEnd, viewDistance);
    vec3 result = mix(color.rgb, fogColor, fogAmount);

    fragColor = vec4(result, color.a);
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
    "sampler_name": "Depth",
    "target": "vulkanpostfx:scene_depth"
  }
]
```

---

## 23. Example: simple rain-aware color grading

```glsl
#version 150

uniform sampler2D InSampler;

in vec2 texCoord;
out vec4 fragColor;

void main() {
    vec4 color = texture(InSampler, texCoord);

    vec3 rainyTint = color.rgb * vec3(0.82, 0.88, 1.05);
    vec3 result = mix(color.rgb, rainyTint, vpfx_RainStrength * 0.45);

    fragColor = vec4(result, color.a);
}
```

This uses:

```text
vpfx_RainStrength
```

and does not need scene depth.

---

## 24. Example: day/night tone split

```glsl
#version 150

uniform sampler2D InSampler;

in vec2 texCoord;
out vec4 fragColor;

void main() {
    vec4 color = texture(InSampler, texCoord);

    vec3 dayGrade = color.rgb * vec3(1.04, 0.99, 0.94);
    vec3 nightGrade = color.rgb * vec3(0.78, 0.86, 1.10);

    vec3 result = vpfx_IsDay ? dayGrade : nightGrade;

    fragColor = vec4(result, color.a);
}
```

This uses:

```text
vpfx_IsDay
```

---

## 25. Example: shadow depth debug view

`pack.json` should enable shadow depth:

```json
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
```

Graph input:

```json
{
  "sampler_name": "Shadow",
  "target": "vulkanpostfx:shadow_depth"
}
```

Fragment shader:

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

This displays the shadow map as a texture. It is useful for debugging whether `shadow_depth` is present, but it is not a final shadow receiver.

---

## 26. Matrix and coordinate-space notes

### 26.1 Main scene depth

Scene depth belongs to the main camera.

Use:

```glsl
vpfx_ViewPositionFromRaw(...)
vpfx_WorldPositionFromRaw(...)
```

for scene-depth reconstruction.

---

### 26.2 Shadow depth

Shadow depth belongs to the VPFX shadow pass.

It is not main camera depth.

Current VPFX shadow pass rules:

```text
The shadow map uses shadow-space depth.
The shadow map uses reversed-Z.
The shadow pass is based on the selected light direction.
The shadow pass must not depend on player view direction.
Terrain, entities, players, and block entities may be written into shadow_depth.
```

Current public uniform limitation:

```text
VpfxBuiltins does not currently expose shadowOrigin.
```

Therefore, custom pack authors should not yet treat the public uniform set as a complete final shadow receiver API.

---

## 27. Iris-style aliases currently provided

VPFX currently provides several aliases inspired by common shaderpack naming conventions.

Projection aliases:

```glsl
gbufferProjection
gbufferProjectionInverse
gbufferPreviousProjection
gbufferPreviousProjectionInverse
```

View aliases:

```glsl
gbufferModelView
gbufferModelViewInverse
gbufferPreviousModelView
gbufferPreviousModelViewInverse
```

Shadow aliases:

```glsl
shadowModelView
shadowModelViewInverse
shadowProjection
shadowProjectionInverse
shadowViewProjection
```

Environment aliases:

```glsl
fogColor
fogStart
fogEnd
skyColor
sunAngle
moonAngle
shadowAngle
sunPosition
moonPosition
shadowLightPosition
upPosition
```

Important:

These aliases do not mean VPFX is fully compatible with Iris or OptiFine shaderpacks.

They are convenience names for VPFX pack authors.

---

## 28. What not to assume

Do not assume:

```text
Existing Iris packs can run directly.
shadow_depth is scene_depth.
shadow matrices are player camera matrices.
gbufferModelView contains full world translation.
shadowOrigin is currently exposed in VpfxBuiltins.
compute shaders are available.
all future VPFX versions will keep internal-only uniforms unchanged.
```

Use only documented public uniforms when writing community packs.

---

## 29. Current public uniform checklist

You can use these safely in VPFX pack shaders:

```text
vpfx_Time
vpfx_DeltaTime
vpfx_GameTime
vpfx_FrameIndex
vpfx_CameraPos
vpfx_RainStrength
vpfx_ViewSize
vpfx_InvViewSize
vpfx_ZNear
vpfx_ZFar
vpfx_ShadowMapSize
vpfx_ShadowBias
vpfx_FogColor
vpfx_FogStart
vpfx_FogEnd
vpfx_SkyFogEnd
vpfx_CloudFogEnd
vpfx_FogKind
vpfx_SkyColor
vpfx_IsDay
vpfx_SunAngle
vpfx_MoonAngle
vpfx_ShadowAngle
vpfx_SunPosition
vpfx_MoonPosition
vpfx_ShadowLightPosition
vpfx_UpPosition
vpfx_ProjectionMatrix
vpfx_InverseProjectionMatrix
vpfx_PreviousProjectionMatrix
vpfx_PreviousInverseProjectionMatrix
vpfx_ViewRotationMatrix
vpfx_InverseViewRotationMatrix
vpfx_PreviousViewRotationMatrix
vpfx_PreviousInverseViewRotationMatrix
vpfx_ViewProjectionMatrix
vpfx_InverseViewProjectionMatrix
vpfx_ShadowViewMatrix
vpfx_InverseShadowViewMatrix
vpfx_ShadowProjectionMatrix
vpfx_InverseShadowProjectionMatrix
vpfx_ShadowViewProjectionMatrix
vpfx_ViewPositionFromRaw(...)
vpfx_WorldPositionFromRaw(...)
```

---

## 30. Recommended first uses

For new pack authors, start with:

```text
vpfx_Time
vpfx_ViewSize
vpfx_InvViewSize
vpfx_RainStrength
vpfx_IsDay
vpfx_SkyColor
vpfx_FogColor
```

Then move to:

```text
scene depth
projection matrices
view-position reconstruction
world-position reconstruction
```

Only after that, study:

```text
shadow_depth
shadow matrices
custom shadow receivers
```

---

## 31. Next document

This document covers built-in uniforms and helper functions.

The next document should be:

```text
06 - VPFX shadow_depth Guide
```

That document should explain:

```text
What shadow_depth contains
How reversed-Z shadow depth works
What can and cannot be done with current public uniforms
Why shadowOrigin matters
How to debug shadow_depth
How to avoid treating shadow_depth as scene_depth
Future shadow receiver API requirements
```
