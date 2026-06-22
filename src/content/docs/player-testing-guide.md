---
title: Player Testing Guide
description: Guide for players and testers to help test VPFX, report issues, and give useful feedback.
---

# VPFX Player Testing Guide

This document is for players and testers who want to help test VPFX, report issues, share screenshots, and give useful feedback.

You do not need to know GLSL or rendering internals to help.
Good testing is not about being a developer. It is about giving clear information that can be reproduced.

---

## 1. What player testing is for

VPFX is an experimental post-processing and shadow pipeline for Minecraft Fabric.

Player testing helps verify:

```text
Does the mod launch?
Does the shaderpack load?
Does the image look correct?
Do shadows behave correctly?
Does the game crash?
Does performance drop too much?
Does the issue happen only with one pack, one setting, or one hardware setup?
```

A good test report helps separate three different problems:

```text
1. VPFX runtime bug
2. Shaderpack bug
3. Hardware / driver / compatibility issue
```

This is important because not every visual problem comes from the same place.

---

## 2. What testers can help with

Players and testers can help by:

```text
Installing VPFX
Testing VPFX shaderpacks
Testing different worlds and lighting conditions
Testing shadows
Testing entities and block entities
Taking screenshots
Recording short videos
Reporting crashes
Reporting visual glitches
Reporting performance problems
Sharing hardware information
Confirming whether an issue happens with multiple packs
```

You do not need to modify VPFX source code.

---

## 3. Before reporting an issue

Before reporting a bug, please try these quick checks.

### 3.1 Make sure the pack is actually a VPFX pack

VPFX packs are not the same as OptiFine or Iris shaderpacks.

A valid VPFX pack should normally contain:

```text
pack.json
post_effect/
shaders/
```

If you are trying to load an Iris or OptiFine shaderpack directly, it may not work.

---

### 3.2 Try reloading VPFX

Use:

```text
F10
```

or:

```text
/vpfx reload
```

If the issue disappears after a reload, mention that in your report.

---

### 3.3 Try disabling VPFX

Use:

```text
/vpfx off
```

Then check whether the issue still exists.

If the issue still happens with VPFX disabled, it may not be a VPFX bug.

---

### 3.4 Try the built-in pack

If possible, test with the built-in VPFX pack:

```text
/vpfx reload builtin
```

If the issue happens only with one external pack, it may be a shaderpack-specific issue.

If the issue happens with the built-in pack too, it is more likely to be a VPFX runtime issue.

---

## 4. Useful bug report format

When reporting a bug, please include this information:

```text
Minecraft version:
Fabric Loader version:
VPFX version:
Operating system:
GPU:
CPU:
RAM:
Shaderpack name:
Shaderpack version:
World type:
Dimension:
World shadows enabled:
Entity shadows enabled:
Player shadows enabled:
Block entity shadows enabled:
Steps to reproduce:
Expected result:
Actual result:
Screenshot or video:
latest.log:
```

You do not need to fill every field perfectly, but the more information you provide, the easier it is to fix the issue.

---

## 5. Good report vs bad report

### Bad report

```text
shadows broken
```

This is not enough. It does not explain what is broken, where it happens, or how to reproduce it.

---

### Better report

```text
In VPFX 1.15.5, using the BSL Tone Shadow Showcase pack, entity shadows work, but player body shadows disappear when I switch to third-person view. The held item still casts a shadow. This happens in a flat world at noon. F9 shadow debug shows the held item but not the player body. Reloading the pack does not fix it. Screenshot and latest.log attached.
```

This is useful because it tells us:

```text
VPFX version
Pack name
What works
What does not work
Where it happens
Lighting condition
Debug result
Whether reload helps
```

---

## 6. Screenshot guidelines

Screenshots are very useful for visual bugs.

When taking screenshots, please try to include:

```text
The bug itself
The surrounding terrain
The time of day if shadows are involved
The selected shaderpack
The relevant VPFX debug view if possible
```

For shadow issues, one screenshot from the normal view and one screenshot from the shadow debug view is ideal.

---

## 7. Video guidelines

Short videos are useful when a bug changes over time.

A good video should show:

```text
The issue
How you trigger it
Whether it changes when moving
Whether it changes when rotating the camera
Whether it changes after reloading VPFX
```

For shadow bugs, rotating the camera slowly can help identify whether the shadow is incorrectly depending on player view direction.

---

## 8. Log files

For crashes or loading failures, logs are very important.

The most useful file is usually:

```text
.minecraft/logs/latest.log
```

If the game crashes, also include the crash report if one exists:

```text
.minecraft/crash-reports/
```

Please do not paste extremely long logs directly into chat if possible. Upload the file instead.

---

## 9. Testing shaderpack loading

When testing pack loading, check these things:

```text
Does the pack appear in the VPFX menu?
Can it be selected?
Does it load without errors?
Does F10 reload it?
Does /vpfx reload work?
Does /vpfx off correctly disable VPFX?
Does /vpfx reload builtin work after using the external pack?
```

If the pack does not appear, check whether `pack.json` is at the root of the zip.

Correct zip layout:

```text
my_pack.zip
├─ pack.json
├─ post_effect/
└─ shaders/
```

Incorrect zip layout:

```text
my_pack.zip
└─ my_pack/
   ├─ pack.json
   ├─ post_effect/
   └─ shaders/
```

---

## 10. Testing visual effects

For general post-processing effects, test:

```text
Daytime
Nighttime
Caves
Nether
End
Water
Lava
Rain
Snow
Bright blocks
Dark blocks
UI overlays
Inventory screen
Third-person view
```

Useful things to report:

```text
Black screen
Overexposure
Very dark image
Wrong colors
Flickering
Effect disappears after reload
Effect only appears in some dimensions
Effect affects GUI incorrectly
```

---

## 11. Testing shadows

VPFX supports shadow map based shadows. Depending on the current version and settings, shadow depth may contain:

```text
Terrain casters
Entity casters
Player casters
Block entity casters
```

When testing shadows, please check:

```text
Flat ground
Slopes
Stairs
Walls
Caves near sunlight
Entities
Players
Held items
Chests
Beds
Signs
Banners
Moving entities
Third-person view
```

Important shadow checks:

```text
Do shadows move with the sun/moon?
Do shadows stay stable when rotating the camera?
Do shadows disappear when moving?
Are there stripe artifacts on flat ground?
Are there diagonal artifacts on block sides?
Do entities cast shadows?
Do players cast shadows?
Do held items cast shadows?
Do block entities cast shadows?
Is the vanilla circular entity shadow still visible when VPFX shadows are active?
```

If a shadow changes shape only when you rotate the camera, mention it clearly. That is an important bug.

---

## 12. Testing entity shadows

For entity shadows, test:

```text
Cow
Sheep
Zombie
Skeleton
Creeper
Item entity
Boat
Minecart
Armor stand
Player model
Held item
```

Useful checks:

```text
Does the entity appear in shadow debug view?
Does it cast a visible shadow on terrain?
Does the shadow remain stable when the camera rotates?
Does the shadow move correctly when the entity moves?
Does the held item cast a shadow?
Does the player body cast a shadow?
```

If only the held item casts a shadow but the player body does not, report that separately.

---

## 13. Testing block entity shadows

For block entity shadows, test:

```text
Chest
Ender chest
Shulker box
Bed
Sign
Hanging sign
Banner
Bell
Lectern
Spawner
Decorated pot
Item frame if supported
```

Useful checks:

```text
Does the block entity appear in shadow debug view?
Does it cast a visible shadow?
Does it flicker?
Does it disappear at some distances?
Does it behave differently when rotating the camera?
Does it work in different dimensions?
```

---

## 14. Testing vanilla entity shadow suppression

VPFX may suppress Minecraft’s vanilla circular entity shadows while VPFX world shadows are active.

Please test:

```text
VPFX off:
Vanilla circular entity shadow should still appear.

VPFX shadows active:
Vanilla circular entity shadow should disappear.
VPFX shadow map based entity shadow should remain.
```

If both shadows appear at the same time, report it as a double shadow issue.

If no entity shadow appears at all, report whether VPFX shadow debug shows the entity.

---

## 15. Performance testing

When reporting performance, please include:

```text
FPS with VPFX off
FPS with VPFX on
Shaderpack name
Render distance
Shadow map size if visible
World type
Entity count if relevant
GPU
CPU
Resolution
```

Performance issues are easier to understand when there is a comparison.

Example:

```text
VPFX off: 120 FPS
VPFX on with Example Pack: 72 FPS
Render distance: 16
Resolution: 1920x1080
GPU: RTX 3060
CPU: Ryzen 5 5600
World: flat world with around 80 entities
```

Avoid reports like:

```text
laggy
```

Try to provide numbers.

---

## 16. Compatibility testing

If you use other mods, please mention them.

Important mod categories:

```text
Rendering mods
Optimization mods
Shader mods
Camera mods
HUD mods
World rendering mods
Entity rendering mods
Resource packs
```

If a bug only happens with another mod installed, please mention that clearly.

If possible, test with only:

```text
Fabric Loader
Fabric API if required
VPFX
One VPFX shaderpack
```

This helps determine whether the issue is caused by VPFX or by a mod conflict.

---

## 17. What not to report as a VPFX bug

Please avoid reporting these as VPFX bugs unless you have evidence that VPFX is involved:

```text
A normal OptiFine/Iris shaderpack does not load as a VPFX pack.
A resource pack texture looks wrong without VPFX enabled.
A server-side gameplay bug.
A crash that still happens after removing VPFX.
A visual issue caused by another rendering mod.
A pack-specific effect choice that is intentional.
```

If you are unsure, it is okay to ask. Just include enough information.

---

## 18. How to test a new VPFX release

When a new VPFX release is posted, a useful test order is:

```text
1. Launch the game.
2. Enter a world with VPFX disabled.
3. Enable a known working VPFX pack.
4. Test F7 menu.
5. Test F10 reload.
6. Test /vpfx reload.
7. Test /vpfx off.
8. Test world shadows.
9. Test entity shadows.
10. Test player shadows.
11. Test block entity shadows.
12. Take screenshots.
13. Check latest.log for warnings or errors.
```

If something breaks, try to identify which step breaks first.

---

## 19. Minimal test scene

A good shadow test scene should include:

```text
Flat ground
A small wall
Stairs or slabs
A chest
A bed
A sign
A banner
A few mobs
A dropped item
A boat or minecart
The player in third-person view
```

Test it at:

```text
Morning
Noon
Sunset
Night if moon shadows are enabled
Rain if relevant
```

This kind of simple test scene helps catch many common shadow issues quickly.

---

## 20. Reporting checklist

Before sending a report, check:

```text
Did I include the VPFX version?
Did I include the shaderpack name?
Did I explain what I expected?
Did I explain what actually happened?
Did I include screenshots or video?
Did I include steps to reproduce?
Did I test /vpfx reload?
Did I test /vpfx off?
Did I include latest.log if there was a crash or loading error?
```

A report does not need to be perfect.
It just needs to be clear enough that someone else can try to reproduce it.

---

## 21. Current testing priorities

The current priority is to test VPFX as a shaderpack platform.

Most useful testing areas:

```text
External shaderpack loading
Pack reload behavior
World shadows
Entity shadows
Player shadows
Block entity shadows
Vanilla entity shadow suppression
Shadow stability when rotating the camera
Performance on different GPUs
Visual correctness in different dimensions
```

If you only have time for one thing, test a VPFX pack in a simple world and report whether shadows and reload behavior work correctly.

---

## 22. Thank you

Testing is not just waiting for updates.
Testing is part of building the platform.

Every useful report helps make VPFX more stable for players and more reliable for shaderpack authors.
