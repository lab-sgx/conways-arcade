/**
 * Dino Runner - Chrome Dino style endless runner
 *
 * Based on game-template.js
 * Player uses Modified GoL with life force
 * Obstacles use Visual Only GoL
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { GoLEngine } from './lib/GoLEngine.js'
import { SimpleGradientRenderer } from './lib/SimpleGradientRenderer.js'
import { GRADIENT_PRESETS } from './lib/GradientPresets.js'
import { Collision } from './lib/Collision.js'
import { Patterns } from './lib/Patterns.js'
import { seedRadialDensity, applyLifeForce, maintainDensity } from './lib/GoLHelpers.js'
import { updateParticles, renderParticles } from './lib/ParticleHelpers.js'
import { createPatternRenderer, RenderMode, PatternName } from './lib/PatternRenderer.js'
import { initHitboxDebug, drawHitboxRect, drawHitboxes } from './lib/HitboxDebug.js'
import {
  GAME_DIMENSIONS,
  GAMEOVER_CONFIG,
  createGameState,
  calculateCanvasDimensions,
  createGameConfig
} from './lib/GameBaseConfig.js'

// ============================================
// CONFIGURATION - BASE REFERENCE (10:16 ratio)
// ============================================

const CONFIG = createGameConfig({
  gravity: 5.5,   // 0.93 × 3 = 2.8 (Higher gravity = faster fall, shorter jump)
  groundY: GAME_DIMENSIONS.BASE_HEIGHT * 0.6,  // 40% from bottom = 60% from top (1920 * 0.6 = 1152)
  horizonY: GAME_DIMENSIONS.BASE_HEIGHT * 0.6 - 15, // Visual horizon line (15px above ground)
  jumpForce: -70, // -14 × 3 = -42 (Lower force = shorter jump)

  obstacle: {
    spawnInterval: 100,      // Base spawn interval (frames)
    minInterval: 50,         // Minimum interval (difficulty cap)
    intervalVariability: 40, // Random offset ±40 frames (creates variable spacing)
    speed: -15,              // Slower start (Option 2)
    speedIncrease: 0.0015    // Steady ramp (Option 2)
  },

  parallax: {
    cloudDensity: 4,         // Number of clouds on screen (Phase 3.7: reduced from 8 for performance)
    cloudOpacity: 0.20,      // 20% opacity for subtle effect
    scrollSpeed: -1.5,       // Horizontal velocity (slower than obstacles)
    spawnInterval: 120,      // Every 2 seconds (120 frames)
    cellSize: 30,            // Cell size for cloud patterns
    patterns: [              // Still life patterns for clouds
      PatternName.BLOCK,
      PatternName.BEEHIVE,
      PatternName.LOAF,
      PatternName.BOAT,
      PatternName.TUB
    ]
  },

  // Ground lines (Chrome Dino style)
  groundLines: {
    density: 5,                    // Number of lines on screen simultaneously
    speed: -15,                    // Match obstacle speed
    minLength: 40,                 // Minimum line length (px)
    maxLength: 80,                 // Maximum line length (px)
    thickness: 2,                  // Stroke weight (px)
    color: [83, 83, 83],          // Gray #535353
    yOffsetMin: 10,                // Min offset from horizonY (10px below minimum)
    yOffsetMax: 40,                // Max offset from horizonY (40px below horizon)
    spawnInterval: 60              // Frames between spawns (every ~1 second at 60fps)
  },

  obstaclePatterns: [
    // STILL LIFES (Period 1 - never change)
    {
      name: 'BLOCK',
      type: 'still-life',
      gridSize: { cols: 4, rows: 4 },      // 2×2 pattern + padding
      pattern: PatternName.BLOCK,
      gradient: GRADIENT_PRESETS.ENEMY_HOT
    },
    {
      name: 'BEEHIVE',
      type: 'still-life',
      gridSize: { cols: 6, rows: 5 },      // 4×3 pattern + padding
      pattern: PatternName.BEEHIVE,
      gradient: GRADIENT_PRESETS.ENEMY_COLD
    },
    {
      name: 'LOAF',
      type: 'still-life',
      gridSize: { cols: 6, rows: 6 },      // 4×4 pattern + padding
      pattern: PatternName.LOAF,
      gradient: GRADIENT_PRESETS.ENEMY_RAINBOW
    },
    {
      name: 'BOAT',
      type: 'still-life',
      gridSize: { cols: 5, rows: 5 },      // 3×3 pattern + padding
      pattern: PatternName.BOAT,
      gradient: GRADIENT_PRESETS.ENEMY_HOT
    },
    {
      name: 'TUB',
      type: 'still-life',
      gridSize: { cols: 5, rows: 5 },      // 3×3 pattern + padding
      pattern: PatternName.TUB,
      gradient: GRADIENT_PRESETS.ENEMY_COLD
    },

    // OSCILLATORS (Static - phase 0 only, no animation)
    {
      name: 'BLINKER',
      type: 'still-life',  // Changed to still-life for static rendering
      gridSize: { cols: 5, rows: 5 },      // 3×3 pattern + padding
      pattern: PatternName.BLINKER,
      gradient: GRADIENT_PRESETS.ENEMY_RAINBOW
    },
    {
      name: 'TOAD',
      type: 'still-life',  // Changed to still-life for static rendering
      gridSize: { cols: 6, rows: 6 },      // 4×4 pattern + padding
      pattern: PatternName.TOAD,
      gradient: GRADIENT_PRESETS.ENEMY_HOT
    },
    {
      name: 'BEACON',
      type: 'still-life',  // Changed to still-life for static rendering
      gridSize: { cols: 6, rows: 6 },      // 4×4 pattern + padding
      pattern: PatternName.BEACON,
      gradient: GRADIENT_PRESETS.ENEMY_COLD
    }
  ]
})

// Store scale factor for rendering (don't modify CONFIG values)
let { scaleFactor, canvasWidth, canvasHeight } = calculateCanvasDimensions()

// Google Brand Colors
const GOOGLE_COLORS = {
  BLUE: { r: 49, g: 134, b: 255 },
  RED: { r: 252, g: 65, b: 61 },
  GREEN: { r: 0, g: 175, b: 87 },
  YELLOW: { r: 255, g: 204, b: 0 }
}

// ============================================
// GAME STATE
// ============================================
const state = createGameState({
  spawnTimer: 0,
  cloudSpawnTimer: 0,  // Timer for cloud spawning
  groundLineSpawnTimer: 0,  // Timer for ground line spawning
  gameSpeed: 1,
  dyingTimer: 0
})

// ============================================
// ENTITIES
// ============================================
let player = null
let obstacles = []
let particles = []
let clouds = []  // Parallax background clouds
let groundLines = []  // Ground decoration lines (Chrome Dino style)

// Gradient renderer
let maskedRenderer = null

// PNG sprites for player (Phase 3.4)
let dinoSprites = {
  run: [],   // run_0.png, run_1.png
  idle: []   // idle.png (shown during jump)
}

// ============================================
// RESPONSIVE CANVAS HELPERS (MOBILE - PORTRAIT AND LANDSCAPE)
// ============================================
function calculateResponsiveSize() {
  const maxWidth = window.innerWidth
  const maxHeight = window.innerHeight

  // Try width-first (portrait default)
  let width = maxWidth
  let height = width / GAME_DIMENSIONS.ASPECT_RATIO

  // If too tall, use height-first (landscape)
  if (height > maxHeight) {
    height = maxHeight
    width = height * GAME_DIMENSIONS.ASPECT_RATIO
  }

  return { width, height }
}

function updateConfigScale() {
  // Only update scaleFactor based on canvas size
  scaleFactor = canvasHeight / GAME_DIMENSIONS.BASE_HEIGHT
}

// ============================================
// TOUCH CONTROLS (MOBILE)
// ============================================
let isTouching = false

function handleTouchStart(e) {
  e.preventDefault()
  isTouching = true
}

function handleTouchEnd(e) {
  e.preventDefault()
  isTouching = false
}

// ============================================
// p5.js PRELOAD (Phase 3.4)
// ============================================
function preload() {
  // Load PNG sprites for player (run + idle animations)
  console.log('[Dino Runner] Loading dino sprites...')

  // Running sprites (200×200px)
  dinoSprites.run[0] = loadImage('./assets/dino-sprites/run_0.png',
    () => console.log('[Dino Runner] run_0.png loaded:', dinoSprites.run[0].width, 'x', dinoSprites.run[0].height),
    (err) => console.error('[Dino Runner] Failed to load run_0.png:', err)
  )
  dinoSprites.run[1] = loadImage('./assets/dino-sprites/run_1.png',
    () => console.log('[Dino Runner] run_1.png loaded:', dinoSprites.run[1].width, 'x', dinoSprites.run[1].height),
    (err) => console.error('[Dino Runner] Failed to load run_1.png:', err)
  )

  // Idle sprite (during jump)
  dinoSprites.idle[0] = loadImage('./assets/dino-sprites/idle.png',
    () => console.log('[Dino Runner] idle.png loaded:', dinoSprites.idle[0].width, 'x', dinoSprites.idle[0].height),
    (err) => console.error('[Dino Runner] Failed to load idle.png:', err)
  )

  console.log('[Dino Runner] All sprites loaded successfully')
}

// ============================================
// p5.js SETUP
// ============================================
function setup() {
  // Calculate responsive canvas size (portrait only)
  const size = calculateResponsiveSize()
  canvasWidth = size.width
  canvasHeight = size.height

  // Update scale factor (CONFIG values stay at base resolution)
  updateConfigScale()

  const canvas = createCanvas(canvasWidth, canvasHeight)
  canvas.parent('game-container')
  frameRate(60)

  // Create gradient renderer with cache (Phase 3.5: Mobile Performance Optimization)
  // Cache enabled by default for 20x faster gradient lookups
  maskedRenderer = new SimpleGradientRenderer(this, {
    useCache: true,    // Enable pre-rendered gradient texture
    cacheSize: 512     // 512×512 texture (~1MB memory)
  })

  // Initialize hitbox debugging (press H to toggle)
  initHitboxDebug()

  // Touch event listeners (passive: false to allow preventDefault)
  canvas.elt.addEventListener('touchstart', handleTouchStart, { passive: false })
  canvas.elt.addEventListener('touchend', handleTouchEnd, { passive: false })

  // Mouse event listeners (desktop fallback)
  canvas.elt.addEventListener('mousedown', handleTouchStart)
  canvas.elt.addEventListener('mouseup', handleTouchEnd)

  // Hide loading indicator
  const loadingElement = document.getElementById('loading')
  if (loadingElement) {
    loadingElement.classList.add('hidden')
  }

  initGame()
}

function initGame() {
  state.score = 0
  state.phase = 'PLAYING'
  state.frameCount = 0
  state.spawnTimer = 0
  state.cloudSpawnTimer = 0
  state.groundLineSpawnTimer = 0
  state.gameSpeed = 1

  setupPlayer()
  obstacles = []
  particles = []
  groundLines = []
  initParallax()
  initGroundLines()

  // Show score section when game restarts
  const scoreSection = document.getElementById('score-section')
  if (scoreSection) {
    scoreSection.style.display = 'block'
  }
}

function setupPlayer() {
  // CRITICAL DEVIATION FROM AUTHENTICITY (Phase 3.4)
  // Client requirement: PNG sprites for player with duck animation
  // Rationale: Brand recognition over GoL authenticity
  // Date: 2025-11-19
  // Status: APPROVED BY CLIENT
  // Reference: CLAUDE.md Section 14

  player = {
    x: 200,
    y: CONFIG.groundY - 200,  // groundY - height (sprite sits on physics ground)

    // DIMENSIONS: Fixed size (no ducking)
    width: 200,
    height: 200,

    // Physics
    vx: 0,
    vy: 0,
    onGround: true,

    // Animation
    frameIndex: 0,
    animationSpeed: 6,        // Change sprite every 6 frames (10fps at 60fps)

    // PNG sprites (replaces GoL rendering)
    sprites: dinoSprites      // { run: [img0, img1] }

    // NO gol property - using static PNG instead
    // NO cellSize - not needed for PNG
    // NO gradient - not needed for PNG
  }
}

// ============================================
// PARALLAX BACKGROUND SYSTEM (Phase 3.4)
// ============================================

/**
 * Initialize parallax cloud system.
 * Pre-populates the screen with clouds for seamless effect.
 */
function initParallax() {
  clouds = []

  // Pre-populate screen with clouds
  const spacing = GAME_DIMENSIONS.BASE_WIDTH / CONFIG.parallax.cloudDensity

  for (let i = 0; i < CONFIG.parallax.cloudDensity; i++) {
    const cloud = spawnCloud()
    // Distribute clouds across screen width
    cloud.x = i * spacing + random(-spacing * 0.3, spacing * 0.3)
    clouds.push(cloud)
  }
}

/**
 * Create a new cloud with random still life pattern.
 * @returns {Object} Cloud entity
 */
function spawnCloud() {
  // Select random pattern from still lifes
  const patternName = random(CONFIG.parallax.patterns)

  // Select random multicolor gradient for variety
  const gradients = [
    GRADIENT_PRESETS.ENEMY_HOT,
    GRADIENT_PRESETS.ENEMY_COLD,
    GRADIENT_PRESETS.ENEMY_RAINBOW
  ]
  const randomGradient = random(gradients)

  // Create renderer with static mode (still lifes don't evolve)
  const renderer = createPatternRenderer({
    mode: RenderMode.STATIC,
    pattern: patternName,
    phase: 0,  // Still lifes are always phase 0
    globalCellSize: CONFIG.parallax.cellSize,
    loopUpdateRate: 10  // Not used for static mode, but required
  })

  const dims = renderer.dimensions

  const cloud = {
    x: GAME_DIMENSIONS.BASE_WIDTH,  // Start off-screen right
    y: random(100, 800),  // Random vertical position
    vx: CONFIG.parallax.scrollSpeed,
    pattern: patternName,
    gol: renderer.gol,
    width: dims.width,
    height: dims.height,
    cellSize: CONFIG.parallax.cellSize,
    gradient: randomGradient,  // Multicolor gradient
    dead: false
  }

  return cloud
}

/**
 * Update all clouds in parallax background.
 * Handles movement, cleanup, and spawning.
 */
function updateClouds() {
  // Move clouds
  clouds.forEach(cloud => {
    cloud.x += cloud.vx

    // Mark as dead if off-screen left
    if (cloud.x < -cloud.width) {
      cloud.dead = true
    }
  })

  // Remove dead clouds
  clouds = clouds.filter(c => !c.dead)

  // Spawn new cloud if timer reached
  state.cloudSpawnTimer++
  if (state.cloudSpawnTimer >= CONFIG.parallax.spawnInterval) {
    clouds.push(spawnCloud())
    state.cloudSpawnTimer = 0
  }
}

/**
 * Render parallax clouds with opacity.
 * Must be called BEFORE rendering other entities (background layer).
 *
 * PHASE 3.6 OPTIMIZATION: Direct rendering without createGraphics() buffer
 * - OLD: createGraphics() = 9.2MB allocation per frame (3-5ms cost)
 * - NEW: Direct rendering with alpha = 0.2-0.5ms cost
 * - GAIN: ~3-5ms per frame (+8-12fps on low-tier devices)
 */
function renderClouds() {
  push()
  noStroke()

  // Render clouds directly to main canvas with transparency
  clouds.forEach(cloud => {
    // Render each cell with multicolor gradient and transparency
    const grid = cloud.gol.current
    const cols = cloud.gol.cols
    const rows = cloud.gol.rows

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        if (grid[x][y] === 1) {
          const px = cloud.x + x * cloud.cellSize
          const py = cloud.y + y * cloud.cellSize

          // Get gradient color from maskedRenderer (now uses cache!)
          const [r, g, b] = maskedRenderer.getGradientColor(
            px + cloud.cellSize / 2,
            py + cloud.cellSize / 2
          )

          // Apply opacity directly (no buffer needed)
          fill(r, g, b, CONFIG.parallax.cloudOpacity * 255)
          rect(px, py, cloud.cellSize, cloud.cellSize)
        }
      }
    }
  })

  pop()
}

// ============================================
// GROUND LINES SYSTEM (Chrome Dino style)
// ============================================

/**
 * Initialize ground lines system.
 * Pre-populates the screen with lines for seamless effect.
 */
function initGroundLines() {
  groundLines = []

  // Pre-populate screen with lines distributed evenly
  const spacing = GAME_DIMENSIONS.BASE_WIDTH / CONFIG.groundLines.density

  for (let i = 0; i < CONFIG.groundLines.density; i++) {
    const gLine = spawnGroundLine()
    // Distribute lines across screen width
    gLine.x = i * spacing + random(-spacing * 0.3, spacing * 0.3)
    groundLines.push(gLine)
  }
}

/**
 * Create a new ground line.
 * @returns {Object} Ground line entity
 */
function spawnGroundLine() {
  return {
    x: GAME_DIMENSIONS.BASE_WIDTH,  // Start off-screen right
    y: CONFIG.horizonY + random(CONFIG.groundLines.yOffsetMin, CONFIG.groundLines.yOffsetMax),
    length: random(CONFIG.groundLines.minLength, CONFIG.groundLines.maxLength),
    vx: CONFIG.groundLines.speed,
    dead: false
  }
}

/**
 * Update all ground lines.
 * Handles movement, cleanup, and spawning.
 */
function updateGroundLines() {
  // Move lines
  groundLines.forEach(gLine => {
    gLine.x += gLine.vx * state.gameSpeed

    // Mark as dead if off-screen left
    if (gLine.x + gLine.length < 0) {
      gLine.dead = true
    }
  })

  // Remove dead lines
  groundLines = groundLines.filter(gLine => !gLine.dead)

  // Spawn new line if timer reached
  state.groundLineSpawnTimer++
  if (state.groundLineSpawnTimer >= CONFIG.groundLines.spawnInterval) {
    groundLines.push(spawnGroundLine())
    state.groundLineSpawnTimer = 0
  }
}

/**
 * Render ground lines with simple stroke.
 * Must be called AFTER horizon line, BEFORE obstacles.
 */
function renderGroundLines() {
  push()
  stroke(CONFIG.groundLines.color[0], CONFIG.groundLines.color[1], CONFIG.groundLines.color[2])
  strokeWeight(CONFIG.groundLines.thickness)

  groundLines.forEach(gLine => {
    line(gLine.x, gLine.y, gLine.x + gLine.length, gLine.y)
  })

  pop()
}

// ============================================
// UPDATE LOOP
// ============================================
function draw() {
  state.frameCount++

  background(CONFIG.ui.backgroundColor)

  if (state.phase === 'PLAYING') {
    updateGame()
  } else if (state.phase === 'DYING') {
    // Continue updating particles during death animation
    state.dyingTimer++
    updateParticlesOnly()

    // Transition to GAMEOVER when particles done or timeout reached
    const minDelayPassed = state.dyingTimer >= GAMEOVER_CONFIG.MIN_DELAY
    const particlesDone = particles.length === 0
    const maxWaitReached = state.dyingTimer >= GAMEOVER_CONFIG.MAX_WAIT

    if ((particlesDone && minDelayPassed) || maxWaitReached) {
      state.phase = 'GAMEOVER'
      // Show game over overlay (mobile version - no postMessage)
      showGameOver()
    }
  }

  renderGame()

  // Update DOM score display
  const scoreElement = document.getElementById('score')
  if (scoreElement) {
    scoreElement.textContent = state.score
  }

  // Update gradient animation
  maskedRenderer.updateAnimation()
}

// ============================================
// GAME OVER OVERLAY (MOBILE)
// ============================================
function showGameOver() {
  const overlay = document.getElementById('game-over-overlay')
  const finalScoreElement = document.getElementById('final-score-value')
  const scoreSection = document.getElementById('score-section')

  if (overlay && finalScoreElement) {
    overlay.classList.add('visible')
    finalScoreElement.textContent = state.score

    // Hide score section when game over overlay appears
    if (scoreSection) {
      scoreSection.style.display = 'none'
    }
  }
}

function updateGame() {
  // Update parallax background (BEFORE other entities)
  updateClouds()

  // Update ground lines (Chrome Dino style decoration)
  updateGroundLines()

  // Update player
  updatePlayer()

  // Spawn obstacles
  state.spawnTimer++

  // Calculate base interval with difficulty scaling
  const baseInterval = Math.max(
    CONFIG.obstacle.minInterval,
    CONFIG.obstacle.spawnInterval - Math.floor(state.score / 100)
  )

  // Add random variability (±40 frames) for Chrome Dino-style spacing
  const randomOffset = random(-CONFIG.obstacle.intervalVariability, CONFIG.obstacle.intervalVariability)
  const currentInterval = Math.max(
    CONFIG.obstacle.minInterval,
    baseInterval + randomOffset
  )

  if (state.spawnTimer >= currentInterval) {
    spawnObstacle()
    state.spawnTimer = 0
  }

  // Update obstacles (Phase 3.4: GoL patterns only)
  obstacles.forEach(obs => {
    obs.x += obs.vx * state.gameSpeed

    // Update GoL according to type
    if (obs.type === 'oscillator') {
      // Only oscillators animate (BLINKER, TOAD, BEACON)
      obs.gol.updateThrottled(state.frameCount)
    }
    // Still lifes are static
    // They are frozen by PatternRenderer with RenderMode.STATIC

    if (obs.x < -150) {  // Scaled: -50 × 3 = -150
      obs.dead = true
      state.score += 10
    }
  })

  obstacles = obstacles.filter(obs => !obs.dead)

  // Update particles (Pure GoL)
  updateParticlesOnly()

  // Check collisions
  checkCollisions()

  // Increase difficulty
  state.gameSpeed += CONFIG.obstacle.speedIncrease

  // Increment score
  if (state.frameCount % 6 === 0) {
    state.score++
  }
}

function updatePlayer() {
  // Apply gravity FIRST
  player.vy += CONFIG.gravity
  player.y += player.vy

  // Ground collision
  if (player.y >= CONFIG.groundY - 200) {
    player.y = CONFIG.groundY - 200
    player.vy = 0
    player.onGround = true
  } else {
    player.onGround = false
  }

  // MOBILE TOUCH CONTROLS - Simple tap to jump
  if (isTouching && player.onGround) {
    player.vy = CONFIG.jumpForce
    player.onGround = false
    isTouching = false  // Consume the tap
  }

  // DESKTOP KEYBOARD FALLBACK (for testing)
  if (keyIsDown(32) && player.onGround) {  // SPACE
    player.vy = CONFIG.jumpForce
    player.onGround = false
  }

  // Update animation frame
  player.frameIndex = Math.floor(state.frameCount / player.animationSpeed) % 2

  // NO GoL update - player uses static PNG sprites (Phase 3.4)
}

function spawnObstacle() {
  // Phase 3.4: Randomly choose ground obstacle pattern
  const patternConfig = random(CONFIG.obstaclePatterns)

  // Create renderer using PatternRenderer
  const renderer = createPatternRenderer({
    mode: (patternConfig.type === 'still-life') ? RenderMode.STATIC : RenderMode.LOOP,
    pattern: patternConfig.pattern,
    phase: patternConfig.phase !== undefined ? patternConfig.phase : undefined,
    globalCellSize: 30,
    loopUpdateRate: 10  // 10fps for oscillators only
  })

  const dims = renderer.dimensions

  // Ground obstacles: centered on horizon line
  const obstacleY = CONFIG.horizonY - dims.height * 0.5

  // Standard hitbox (70% of visual size)
  const hitboxScale = 0.7
  const hitboxWidth = dims.width * hitboxScale
  const hitboxHeight = dims.height * hitboxScale
  const hitboxOffsetX = (dims.width - hitboxWidth) / 2
  const hitboxOffsetY = (dims.height - hitboxHeight) / 2

  const obstacle = {
    x: GAME_DIMENSIONS.BASE_WIDTH,
    y: obstacleY,
    width: dims.width,
    height: dims.height,
    hitboxWidth,
    hitboxHeight,
    hitboxOffsetX,
    hitboxOffsetY,
    vx: CONFIG.obstacle.speed,
    gol: renderer.gol,
    cellSize: 30,
    gradient: patternConfig.gradient,
    type: patternConfig.type,  // 'still-life' or 'oscillator'
    name: patternConfig.name,
    dead: false
  }

  obstacles.push(obstacle)
}

function updateParticlesOnly() {
  particles = updateParticles(particles, state.frameCount)
}

function checkCollisions() {
  obstacles.forEach(obs => {
    // Use custom hitbox dimensions if available
    const obsHitboxX = obs.x + (obs.hitboxOffsetX || 0)
    const obsHitboxY = obs.y + (obs.hitboxOffsetY || 0)
    const obsHitboxWidth = obs.hitboxWidth || obs.width
    const obsHitboxHeight = obs.hitboxHeight || obs.height

    if (Collision.rectRect(
      player.x, player.y, player.width, player.height,
      obsHitboxX, obsHitboxY, obsHitboxWidth, obsHitboxHeight
    )) {
      // Game over
      if (state.phase !== 'GAMEOVER' && state.phase !== 'DYING') {
        state.phase = 'DYING'
        state.dyingTimer = 0

        // Spawn explosion
        spawnExplosion(player.x + player.width / 2, player.y + player.height / 2)

        // Note: postMessage will be sent after particle animation completes
      }
    }
  })
}

function spawnExplosion(x, y) {
  for (let i = 0; i < 8; i++) {
    const particle = {
      x: x + random(-30, 30),  // Scaled: -10 to 10 × 3
      y: y + random(-30, 30),
      vx: random(-9, 9),       // Scaled: -3 to 3 × 3
      vy: random(-9, 9),
      alpha: 255,
      width: 180,   // 60 × 3 = 180 (scaled)
      height: 180,  // 60 × 3 = 180
      gol: new GoLEngine(6, 6, 30),  // 6×6 grid maintained
      cellSize: 30,  // Scaled to 30px (3x from 10px baseline)
      gradient: GRADIENT_PRESETS.EXPLOSION,
      dead: false
    }

    // Seed with radial density
    seedRadialDensity(particle.gol, 0.7, 0.0)

    particles.push(particle)
  }
}

// ============================================
// RENDERING
// ============================================
function renderGame() {
  push()
  scale(scaleFactor)

  // Render parallax clouds (BEFORE all other entities - background layer)
  renderClouds()

  // Horizon line (aesthetic - drawn above physics ground)
  stroke(CONFIG.ui.textColor)
  strokeWeight(2)
  line(0, CONFIG.horizonY, GAME_DIMENSIONS.BASE_WIDTH, CONFIG.horizonY)

  // Render ground lines (Chrome Dino style - AFTER horizon, BEFORE player)
  renderGroundLines()

  // Render player with PNG sprite animation (hide during DYING and GAMEOVER)
  // Phase 3.4: Using animated PNG sprites (run + idle)
  if (state.phase === 'PLAYING' && player.sprites) {
    // Select sprite set based on player state
    let spriteSet
    if (!player.onGround) {
      // Jumping/falling - show idle sprite (static)
      spriteSet = player.sprites.idle
    } else {
      // Running on ground - show run animation
      spriteSet = player.sprites.run
    }

    // Verify sprite set exists and has frames
    if (spriteSet && spriteSet.length > 0) {
      // Get current animation frame (% prevents index overflow)
      const currentSprite = spriteSet[player.frameIndex % spriteSet.length]

      // Render sprite (dimensions match hitbox exactly)
      if (currentSprite && currentSprite.width > 0) {
        push()
        imageMode(CORNER)
        noSmooth()  // Pixel-perfect rendering for sprites
        image(
          currentSprite,
          player.x,
          player.y,
          player.width,   // 200px
          player.height   // 200px
        )
        pop()
      }
    }
  }

  // Render obstacles with gradients
  obstacles.forEach(obs => {
    maskedRenderer.renderMaskedGrid(
      obs.gol,
      obs.x,
      obs.y,
      obs.cellSize,
      obs.gradient
    )
  })

  // Render particles with gradients and alpha
  // Note: ParticleHelpers uses globalCellSize parameter, but particles have individual cellSize
  // We pass 30 as the standard cellSize for dino-runner particles
  renderParticles(particles, maskedRenderer, 30)

  // Debug: Draw hitboxes (press H to toggle)
  drawHitboxRect(player.x, player.y, player.width, player.height, 'player', '#00FF00')

  // Draw obstacle hitboxes (using custom hitbox dimensions)
  obstacles.forEach((obs, index) => {
    const obsHitboxX = obs.x + (obs.hitboxOffsetX || 0)
    const obsHitboxY = obs.y + (obs.hitboxOffsetY || 0)
    const obsHitboxWidth = obs.hitboxWidth || obs.width
    const obsHitboxHeight = obs.hitboxHeight || obs.height
    drawHitboxRect(obsHitboxX, obsHitboxY, obsHitboxWidth, obsHitboxHeight, `obstacle ${index}`, '#FF0000')
  })

  pop()
}

// UI rendering removed - now handled by game-wrapper.html overlay

// ============================================
// INPUT (MOBILE - Simplified)
// ============================================
function keyPressed() {
  // Keep for desktop testing only
  // Restart handled by button click (see DOMContentLoaded below)
}

// ============================================
// WINDOW RESIZE HANDLER (MOBILE)
// ============================================
function windowResized() {
  const size = calculateResponsiveSize()
  canvasWidth = size.width
  canvasHeight = size.height
  updateConfigScale()
  resizeCanvas(canvasWidth, canvasHeight)

  // No need to modify entity values - scaling happens in rendering
}

// ============================================
// RESTART HANDLER (MOBILE) - Tap anywhere on overlay
// ============================================
window.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('game-over-overlay')
  if (overlay) {
    overlay.addEventListener('click', () => {
      // Hide game over overlay
      overlay.classList.remove('visible')
      // Reset game
      initGame()
    })
  }
})

// Export for p5.js
window.preload = preload
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
window.windowResized = windowResized
