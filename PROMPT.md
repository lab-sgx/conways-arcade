# Conway's Arcade - Single File Game Generator

## 🎯 Task

Create a **[GAME_TYPE]** game using Conway's Game of Life (B3/S23) for visual aesthetics.

Generate a **complete, single HTML file** that works by double-clicking (no server required).

---

## 📦 Repository Reference

**GitHub Repository:** `https://github.com/brunobarran/conways-arcade-test`

**Live Demo:** `https://brunobarran.github.io/conways-arcade-test/`

**Reference Implementation:** Dino Runner (endless runner example)

---

## 🧩 Required Modules (Copy Inline)

You MUST read and copy these 12 modules inline into your HTML file.

Each module is available at the GitHub URLs below. Read the **RAW** content.

### Module List

| # | Module | Description | GitHub URL |
|---|--------|-------------|------------|
| 1 | `GoLEngine.js` | Conway's GoL B3/S23 (~300 lines) | `https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/GoLEngine.js` |
| 2 | `SimpleGradientRenderer.js` | Animated gradients (~200 lines) | `https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/SimpleGradientRenderer.js` |
| 3 | `GradientPresets.js` | Color presets (~100 lines) | `https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/GradientPresets.js` |
| 4 | `Collision.js` | Hitbox detection (~150 lines) | `https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/Collision.js` |
| 5 | `Patterns.js` | GoL patterns (~400 lines) | `https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/Patterns.js` |
| 6 | `GoLHelpers.js` | Helper functions (~200 lines) | `https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/GoLHelpers.js` |
| 7 | `ParticleHelpers.js` | Particle systems (~100 lines) | `https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/ParticleHelpers.js` |
| 8 | `PatternRenderer.js` | Pattern rendering (~250 lines) | `https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/PatternRenderer.js` |
| 9 | `GameBaseConfig.js` | Canvas config (~300 lines) | `https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/GameBaseConfig.js` |
| 10 | `UIHelpers.js` | UI rendering (~150 lines) | `https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/UIHelpers.js` |
| 11 | `HitboxDebug.js` | Debug tools (~100 lines) | `https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/HitboxDebug.js` |
| 12 | `GradientCache.js` | Gradient cache (~100 lines) | `https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/GradientCache.js` |

**Total:** ~2400 lines to copy inline

---

## 📐 Output Format: Single HTML File

Generate a complete HTML file with this structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <title>[GAME_NAME] - Conway's Arcade</title>

  <!-- p5.js from CDN -->
  <script src="https://cdn.jsdelivr.net/npm/p5@1.7.0/lib/p5.min.js"></script>

  <style>
    /* ============================================
       CSS STYLES
       ============================================ */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: #FFFFFF;
      font-family: 'Arial', sans-serif;
      overflow: hidden;
      touch-action: none;
    }

    canvas {
      display: block;
    }

    /* Add more styles as needed (Game Over overlay, score, etc.) */
  </style>
</head>
<body>
  <script>
    // ============================================
    // MODULE 1: GoLEngine.js
    // Source: https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/GoLEngine.js
    // ============================================

    /* COPY ENTIRE CONTENT FROM URL ABOVE */

    const ALIVE = 1
    const DEAD = 0

    class GoLEngine {
      constructor(cols, rows, updateRateFPS = 10) {
        // ... [COPY FULL CLASS CODE] ...
      }
      // ... [ALL METHODS] ...
    }

    // ============================================
    // MODULE 2: SimpleGradientRenderer.js
    // Source: https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/SimpleGradientRenderer.js
    // ============================================

    /* COPY ENTIRE CONTENT FROM URL */

    class SimpleGradientRenderer {
      // ... [COPY FULL CLASS CODE] ...
    }

    // ============================================
    // MODULE 3: GradientPresets.js
    // Source: https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/GradientPresets.js
    // ============================================

    /* COPY ENTIRE CONTENT FROM URL */

    const GOOGLE_COLORS = {
      BLUE: '#4285F4',
      RED: '#EA4335',
      // ... [COPY ALL] ...
    }

    const GRADIENT_PRESETS = {
      PLAYER: { /* ... */ },
      // ... [COPY ALL] ...
    }

    // ============================================
    // CONTINUE FOR ALL 12 MODULES
    // ============================================

    // MODULE 4: Collision.js
    /* COPY FROM: https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/Collision.js */

    // MODULE 5: Patterns.js
    /* COPY FROM: https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/Patterns.js */

    // MODULE 6: GoLHelpers.js
    /* COPY FROM: https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/GoLHelpers.js */

    // MODULE 7: ParticleHelpers.js
    /* COPY FROM: https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/ParticleHelpers.js */

    // MODULE 8: PatternRenderer.js
    /* COPY FROM: https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/PatternRenderer.js */

    // MODULE 9: GameBaseConfig.js
    /* COPY FROM: https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/GameBaseConfig.js */

    // MODULE 10: UIHelpers.js
    /* COPY FROM: https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/UIHelpers.js */

    // MODULE 11: HitboxDebug.js
    /* COPY FROM: https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/HitboxDebug.js */

    // MODULE 12: GradientCache.js
    /* COPY FROM: https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/lib/GradientCache.js */

    // ============================================
    // GAME CONFIGURATION
    // ============================================

    const GAME_DIMENSIONS = {
      BASE_WIDTH: 1200,
      BASE_HEIGHT: 1920,
      ASPECT_RATIO: 0.625  // Portrait 10:16
    }

    const CONFIG = createGameConfig({
      // [YOUR GAME-SPECIFIC CONFIG HERE]
      // Example for Flappy Bird:
      // gravity: 0.8,
      // jumpForce: -12,
      // pipeSpeed: -6
    })

    // ============================================
    // GAME STATE
    // ============================================

    const state = createGameState({
      level: 1,
      // [YOUR GAME-SPECIFIC STATE]
    })

    // ============================================
    // ENTITIES
    // ============================================

    let player = null
    let enemies = []
    let projectiles = []
    let particles = []
    let maskedRenderer = null

    // ============================================
    // SETUP (p5.js)
    // ============================================

    function setup() {
      // Calculate responsive canvas size
      const canvasHeight = windowHeight
      const canvasWidth = canvasHeight * GAME_DIMENSIONS.ASPECT_RATIO

      createCanvas(canvasWidth, canvasHeight)
      frameRate(60)

      // Create gradient renderer
      maskedRenderer = new SimpleGradientRenderer(window)

      // Initialize game
      initGame()
    }

    function initGame() {
      state.score = 0
      state.lives = 1
      state.phase = 'PLAYING'
      state.frameCount = 0

      setupPlayer()
      // [YOUR GAME INITIALIZATION]
    }

    function setupPlayer() {
      player = {
        x: CONFIG.width / 2,
        y: CONFIG.height - 300,
        width: 180,
        height: 180,
        vx: 0,
        vy: 0,
        gol: new GoLEngine(6, 6, 12),
        cellSize: 30,
        gradient: GRADIENT_PRESETS.PLAYER
      }

      // Seed GoL with radial density
      seedRadialDensity(player.gol, 0.85, 0.0)
    }

    // ============================================
    // UPDATE LOOP (p5.js)
    // ============================================

    function draw() {
      state.frameCount++
      background(255)

      if (state.phase === 'PLAYING') {
        updateGame()
      }

      renderGame()

      // UI
      fill(0)
      textSize(24)
      textAlign(LEFT, TOP)
      text(`Score: ${state.score}`, 20, 20)
    }

    function updateGame() {
      // Update player
      updatePlayer()

      // [YOUR GAME LOGIC HERE]
      // - Update enemies
      // - Update projectiles
      // - Check collisions
      // - Spawn entities
      // - Update score
    }

    function updatePlayer() {
      // Update GoL
      player.gol.updateThrottled(state.frameCount)
      applyLifeForce(player)

      // [YOUR PLAYER LOGIC]
      // Example for Flappy Bird:
      // player.vy += CONFIG.gravity
      // player.y += player.vy
      // player.y = constrain(player.y, 0, height - player.height)
    }

    function renderGame() {
      // Render player
      maskedRenderer.renderMaskedGrid(
        player.gol,
        player.x,
        player.y,
        player.cellSize,
        player.gradient
      )

      // [YOUR RENDERING LOGIC]
    }

    // ============================================
    // INPUT HANDLING
    // ============================================

    function keyPressed() {
      if (state.phase === 'PLAYING') {
        if (key === ' ' || keyCode === UP_ARROW) {
          // [YOUR JUMP/ACTION LOGIC]
        }
      } else if (state.phase === 'GAMEOVER') {
        if (key === ' ') {
          initGame()  // Restart
        }
      }

      // Debug: Toggle hitbox
      if (key === 'h' || key === 'H') {
        toggleHitboxDebug()
      }
    }

    function touchStarted() {
      if (state.phase === 'PLAYING') {
        // [YOUR TOUCH LOGIC]
      } else if (state.phase === 'GAMEOVER') {
        initGame()  // Restart
      }
      return false  // Prevent default
    }

    // ============================================
    // WINDOW RESIZE
    // ============================================

    function windowResized() {
      const canvasHeight = windowHeight
      const canvasWidth = canvasHeight * GAME_DIMENSIONS.ASPECT_RATIO
      resizeCanvas(canvasWidth, canvasHeight)
    }

    // Make functions global for p5.js
    window.setup = setup
    window.draw = draw
    window.keyPressed = keyPressed
    window.touchStarted = touchStarted
    window.windowResized = windowResized
  </script>
</body>
</html>
```

---

## 📖 Reference Implementation

**Study the complete Dino Runner game:**

**HTML + CSS:**
- `https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/index.html`

**Game Logic:**
- `https://raw.githubusercontent.com/brunobarran/conways-arcade-test/main/game.js`

Read these files to understand:
- Full game structure
- How entities are set up
- Update loop patterns
- Collision detection
- GoL pattern usage

---

## 🎮 Game Type Examples

### Flappy Bird

```javascript
const CONFIG = createGameConfig({
  gravity: 0.8,
  jumpForce: -12,
  pipeGap: 300,
  pipeSpeed: -6
})

function updatePlayer() {
  player.vy += CONFIG.gravity
  player.y += player.vy
  player.y = constrain(player.y, 0, CONFIG.height - player.height)

  player.gol.updateThrottled(state.frameCount)
  applyLifeForce(player)
}

function touchStarted() {
  if (state.phase === 'PLAYING') {
    player.vy = CONFIG.jumpForce
  }
  return false
}

function spawnPipe() {
  const gapY = random(200, CONFIG.height - 400)

  // Top pipe
  pipes.push({
    x: CONFIG.width,
    y: 0,
    width: 120,
    height: gapY,
    gol: new GoLEngine(4, Math.floor(gapY / 30), 15),
    gradient: GRADIENT_PRESETS.ENEMY_HOT,
    passed: false
  })

  // Bottom pipe
  pipes.push({
    x: CONFIG.width,
    y: gapY + CONFIG.pipeGap,
    width: 120,
    height: CONFIG.height - gapY - CONFIG.pipeGap,
    gol: new GoLEngine(4, Math.floor((CONFIG.height - gapY - CONFIG.pipeGap) / 30), 15),
    gradient: GRADIENT_PRESETS.ENEMY_COLD,
    passed: false
  })

  // Seed pipes with patterns
  pipes[pipes.length - 2].gol.setPattern(Patterns.BEEHIVE, 1, 1)
  pipes[pipes.length - 1].gol.setPattern(Patterns.LOAF, 1, 1)
}
```

### Space Invaders

```javascript
const CONFIG = createGameConfig({
  invaderRows: 3,
  invaderCols: 5,
  invaderSpeed: 2,
  playerSpeed: 10,
  bulletSpeed: -12
})

function setupInvaders() {
  invaders = []
  for (let row = 0; row < CONFIG.invaderRows; row++) {
    for (let col = 0; col < CONFIG.invaderCols; col++) {
      const invader = {
        x: col * 150 + 200,
        y: row * 120 + 100,
        width: 120,
        height: 120,
        gol: new GoLEngine(4, 4, 15),
        gradient: GRADIENT_PRESETS.ENEMY_HOT,
        alive: true
      }
      seedRadialDensity(invader.gol, 0.8, 0.0)
      invaders.push(invader)
    }
  }
}

function updatePlayer() {
  // Movement
  if (keyIsDown(LEFT_ARROW)) player.x -= CONFIG.playerSpeed
  if (keyIsDown(RIGHT_ARROW)) player.x += CONFIG.playerSpeed
  player.x = constrain(player.x, 0, CONFIG.width - player.width)

  // Update GoL
  player.gol.updateThrottled(state.frameCount)
  applyLifeForce(player)
}

function keyPressed() {
  if (key === ' ' && state.phase === 'PLAYING') {
    shootBullet()
  }
}

function shootBullet() {
  bullets.push({
    x: player.x + player.width / 2 - 15,
    y: player.y,
    width: 30,
    height: 60,
    vy: CONFIG.bulletSpeed,
    gol: new GoLEngine(1, 2, 30),
    gradient: GRADIENT_PRESETS.BULLET
  })
}
```

---

## 🧬 Conway's Game of Life Rules

**CRITICAL:** Use GoL correctly for authentic visuals.

### B3/S23 Rules

- **Birth (B3):** Dead cell with exactly 3 live neighbors becomes alive
- **Survival (S2/S3):** Live cell with 2-3 neighbors survives
- **Death:** Live cell with <2 (underpopulation) or >3 (overpopulation) neighbors dies

### Usage Guidelines

| Entity | Strategy | Code Example |
|--------|----------|--------------|
| **Player** | Modified GoL + life force | `applyLifeForce(player)` |
| **Enemies** | Modified GoL or static patterns | `seedRadialDensity(enemy.gol, 0.8, 0.0)` |
| **Projectiles** | Static patterns | `gol.setPattern(Patterns.BLOCK, 1, 1)` |
| **Explosions** | Pure GoL | `seedRadialDensity(explosion.gol, 0.9, 0.0)` |

### Key Functions

```javascript
// Seed with radial density (organic look)
seedRadialDensity(entity.gol, 0.85, 0.0)  // 85% center, 0% edges

// Keep core alive (prevent death)
applyLifeForce(entity)  // Call every frame

// Use canonical patterns
entity.gol.setPattern(Patterns.BLINKER, 1, 1)
entity.gol.setPattern(Patterns.GLIDER, 2, 2)
```

---

## 🎨 Visual Guidelines

### Google Brand Colors

```javascript
GRADIENT_PRESETS.PLAYER          // Blue (#4285F4)
GRADIENT_PRESETS.ENEMY_HOT       // Red-Orange (#EA4335)
GRADIENT_PRESETS.ENEMY_COLD      // Blue-Purple
GRADIENT_PRESETS.ENEMY_RAINBOW   // Multi-color
GRADIENT_PRESETS.BULLET          // Yellow (#FBBC04)
GRADIENT_PRESETS.EXPLOSION       // Red-Yellow gradient
```

### Standard Entity Sizes

```javascript
// Large entities (player, big enemies)
{
  width: 180,
  height: 180,
  gol: new GoLEngine(6, 6, 12),  // 6×6 grid, 12fps
  cellSize: 30
}

// Small entities (projectiles)
{
  width: 90,
  height: 90,
  gol: new GoLEngine(3, 3, 15),  // 3×3 grid, 15fps
  cellSize: 30
}

// Explosions (fast animation)
{
  width: 180,
  height: 180,
  gol: new GoLEngine(6, 6, 30),  // 6×6 grid, 30fps
  cellSize: 30
}
```

---

## 🚫 Common Mistakes (AVOID)

1. ❌ **Using `import` statements**
   - All code must be inline in `<script>` tags
   - No ES6 modules in single file

2. ❌ **Using GoL cells for collision**
   - Use fixed hitboxes: `Collision.rectRect(...)`
   - GoL is visual only

3. ❌ **Forgetting to copy all 12 modules**
   - Missing modules = runtime errors
   - Copy each module completely

4. ❌ **Not removing `export` keywords**
   - When copying modules, remove all `export` statements
   - Example: `export class GoLEngine` → `class GoLEngine`

5. ❌ **Desktop-only controls**
   - Must support keyboard AND touch
   - Test on mobile

6. ❌ **Not making p5.js functions global**
   ```javascript
   // ✅ CORRECT
   window.setup = setup
   window.draw = draw

   // ❌ WRONG (p5.js won't find them)
   ```

7. ❌ **Hardcoding canvas size**
   ```javascript
   // ✅ CORRECT (responsive)
   const canvasHeight = windowHeight
   const canvasWidth = canvasHeight * GAME_DIMENSIONS.ASPECT_RATIO

   // ❌ WRONG (fixed size)
   createCanvas(1200, 1920)
   ```

---

## 🔍 Module Reading Order (Dependency Chain)

Copy modules in this order to avoid dependency errors:

1. **GoLEngine.js** (no dependencies)
2. **GradientPresets.js** (no dependencies)
3. **GradientCache.js** (depends on GradientPresets)
4. **SimpleGradientRenderer.js** (depends on GradientCache)
5. **Collision.js** (no dependencies)
6. **Patterns.js** (no dependencies)
7. **GoLHelpers.js** (depends on GoLEngine)
8. **ParticleHelpers.js** (depends on GoLEngine, GoLHelpers)
9. **PatternRenderer.js** (depends on GoLEngine, Patterns)
10. **GameBaseConfig.js** (no dependencies)
11. **UIHelpers.js** (depends on GameBaseConfig)
12. **HitboxDebug.js** (no dependencies)

---

## ✅ Output Requirements

Generate a **complete, working HTML file** that:

1. ✅ Contains all 12 modules copied inline (~2400 lines)
2. ✅ Implements the requested game mechanics
3. ✅ Uses GoL patterns for visual aesthetics
4. ✅ Works by double-clicking (no server needed)
5. ✅ Runs at 60fps on modern browsers
6. ✅ Supports desktop (keyboard) and mobile (touch)
7. ✅ Uses Google brand colors (GRADIENT_PRESETS)
8. ✅ Has responsive portrait layout (10:16 aspect ratio)

**File size:** ~150-200 KB (all inline)

---

## 🚀 User Instructions (Include in HTML comment)

Add this comment at the top of the generated HTML:

```html
<!--
  [GAME_NAME] - Conway's Arcade Edition

  HOW TO PLAY:
  1. Save this file as "my-game.html"
  2. Double-click to open in browser
  3. Desktop: Use arrow keys or space
  4. Mobile: Tap to jump/shoot

  POWERED BY:
  - Conway's Game of Life (B3/S23)
  - p5.js 1.7.0
  - Generated from: https://github.com/brunobarran/conways-arcade-test

  LICENSE: ISC
-->
```

---

## 📋 Quick Start Checklist

- [ ] Read all 12 module files from GitHub (RAW URLs)
- [ ] Copy HTML structure from template above
- [ ] Paste modules inline in dependency order
- [ ] Remove all `import` and `export` statements
- [ ] Implement game-specific CONFIG
- [ ] Implement game-specific logic (update, render)
- [ ] Add input handlers (keyboard + touch)
- [ ] Use GoL patterns from `Patterns.js`
- [ ] Apply Google brand colors (GRADIENT_PRESETS)
- [ ] Test in browser (should work with file://)

---

**Ready?** Read the 12 modules from GitHub and generate the complete single-file HTML game.

**Total output:** ~3500-4000 lines (2400 modules + 1000-1500 game logic)
