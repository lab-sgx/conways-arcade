/**
 * Flappy Bird - Conway's Arcade Mobile Edition
 *
 * Player: GoL LWSS (Lightweight Spaceship)
 * Obstacles: Pipe pairs with still life patterns
 * Input: Tap to flap
 *
 * @author Conway's Arcade
 * @license ISC
 */

// ============================================
// IMPORTS
// ============================================
import { GoLEngine } from '../lib/GoLEngine.js'
import { SimpleGradientRenderer } from '../lib/SimpleGradientRenderer.js'
import { GRADIENT_PRESETS } from '../lib/GradientPresets.js'
import { Collision } from '../lib/Collision.js'
import { Patterns } from '../lib/Patterns.js'
import { seedRadialDensity, applyLifeForce } from '../lib/GoLHelpers.js'
import { updateParticles, renderParticles } from '../lib/ParticleHelpers.js'
import { createPatternRenderer, RenderMode, PatternName } from '../lib/PatternRenderer.js'
import { initHitboxDebug, drawHitboxRect } from '../lib/HitboxDebug.js'
import {
  GAME_DIMENSIONS,
  GAMEOVER_CONFIG,
  createGameState,
  calculateCanvasDimensions,
  createGameConfig
} from '../lib/GameBaseConfig.js'

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = createGameConfig({
  player: {
    width: 210,    // LWSS: 7 cols x 30px
    height: 180,   // LWSS: 6 rows x 30px
    cellSize: 30,
    x: 300,
    startY: 960
  },

  gravity: 1.0,
  jumpForce: -22,
  terminalVelocity: 15,
  groundY: 1450,
  ceilingY: 0,

  pipe: {
    width: 180,
    gapStart: 600,
    gapMin: 400,
    gapDecrement: 20,
    speedStart: -15,
    speedMin: -45,
    speedIncrement: -3,
    spawnInterval: 100,
    cellSize: 30
  },

  parallax: {
    cloudDensity: 4,
    cloudOpacity: 0.20,
    scrollSpeed: -1.5,
    spawnInterval: 120,
    cellSize: 30,
    patterns: [
      PatternName.BLOCK,
      PatternName.BEEHIVE,
      PatternName.LOAF,
      PatternName.BOAT,
      PatternName.TUB
    ]
  }
})

// Store scale factor for rendering
let { scaleFactor, canvasWidth, canvasHeight } = calculateCanvasDimensions()

// ============================================
// GAME STATE
// ============================================
const state = createGameState({
  level: 1,
  spawnTimer: 0,
  cloudSpawnTimer: 0,
  dyingTimer: 0
})

// ============================================
// ENTITIES
// ============================================
let player = null
let pipes = []
let particles = []
let clouds = []

// Gradient renderer
let maskedRenderer = null

// ============================================
// RESPONSIVE CANVAS HELPERS
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
  scaleFactor = canvasHeight / GAME_DIMENSIONS.BASE_HEIGHT
}

// ============================================
// TOUCH CONTROLS
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
// p5.js SETUP
// ============================================
function setup() {
  const size = calculateResponsiveSize()
  canvasWidth = size.width
  canvasHeight = size.height

  updateConfigScale()

  const canvas = createCanvas(canvasWidth, canvasHeight)
  canvas.parent('game-container')
  frameRate(60)

  // Create gradient renderer with cache
  maskedRenderer = new SimpleGradientRenderer(this, {
    useCache: true,
    cacheSize: 512
  })

  // Initialize hitbox debugging (press H to toggle)
  initHitboxDebug()

  // Touch event listeners
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
  state.phase = 'WAITING'  // Wait for first tap before starting physics
  state.frameCount = 0
  state.level = 1
  state.spawnTimer = 0
  state.cloudSpawnTimer = 0
  state.dyingTimer = 0

  setupPlayer()
  pipes = []
  particles = []
  initParallax()

  // Show touch hint when waiting
  const touchHint = document.getElementById('touch-hint')
  if (touchHint) {
    touchHint.style.display = 'block'
  }

  // Show score section when game restarts
  const scoreSection = document.getElementById('score-section')
  if (scoreSection) {
    scoreSection.style.display = 'block'
  }
}

function setupPlayer() {
  player = {
    x: CONFIG.player.x,
    y: CONFIG.player.startY,
    width: CONFIG.player.width,
    height: CONFIG.player.height,
    cellSize: CONFIG.player.cellSize,

    // Physics
    vy: 0,

    // GoL engine - LWSS: 7x6 grid at 15fps
    gol: new GoLEngine(7, 6, 15),

    // Gradient
    gradient: GRADIENT_PRESETS.PLAYER
  }

  // Set LWSS pattern
  player.gol.setPattern(Patterns.LIGHTWEIGHT_SPACESHIP, 0, 0)
}

// ============================================
// PARALLAX BACKGROUND SYSTEM
// ============================================
function initParallax() {
  clouds = []

  const spacing = GAME_DIMENSIONS.BASE_WIDTH / CONFIG.parallax.cloudDensity

  for (let i = 0; i < CONFIG.parallax.cloudDensity; i++) {
    const cloud = spawnCloud()
    cloud.x = i * spacing + random(-spacing * 0.3, spacing * 0.3)
    clouds.push(cloud)
  }
}

function spawnCloud() {
  const patternName = random(CONFIG.parallax.patterns)

  const gradients = [
    GRADIENT_PRESETS.ENEMY_HOT,
    GRADIENT_PRESETS.ENEMY_COLD,
    GRADIENT_PRESETS.ENEMY_RAINBOW
  ]
  const randomGradient = random(gradients)

  const renderer = createPatternRenderer({
    mode: RenderMode.STATIC,
    pattern: patternName,
    phase: 0,
    globalCellSize: CONFIG.parallax.cellSize,
    loopUpdateRate: 10
  })

  const dims = renderer.dimensions

  return {
    x: GAME_DIMENSIONS.BASE_WIDTH,
    y: random(300, 1200),
    vx: CONFIG.parallax.scrollSpeed,
    pattern: patternName,
    gol: renderer.gol,
    width: dims.width,
    height: dims.height,
    cellSize: CONFIG.parallax.cellSize,
    gradient: randomGradient,
    dead: false
  }
}

function updateClouds() {
  clouds.forEach(cloud => {
    cloud.x += cloud.vx

    if (cloud.x < -cloud.width) {
      cloud.dead = true
    }
  })

  clouds = clouds.filter(c => !c.dead)

  state.cloudSpawnTimer++
  if (state.cloudSpawnTimer >= CONFIG.parallax.spawnInterval) {
    clouds.push(spawnCloud())
    state.cloudSpawnTimer = 0
  }
}

function renderClouds() {
  push()
  noStroke()

  clouds.forEach(cloud => {
    const grid = cloud.gol.current
    const cols = cloud.gol.cols
    const rows = cloud.gol.rows

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        if (grid[x][y] === 1) {
          const px = cloud.x + x * cloud.cellSize
          const py = cloud.y + y * cloud.cellSize

          const [r, g, b] = maskedRenderer.getGradientColor(
            px + cloud.cellSize / 2,
            py + cloud.cellSize / 2
          )

          fill(r, g, b, CONFIG.parallax.cloudOpacity * 255)
          rect(px, py, cloud.cellSize, cloud.cellSize)
        }
      }
    }
  })

  pop()
}

// ============================================
// PIPE SYSTEM
// ============================================
const PIPE_STILL_LIFES = [
  Patterns.BLOCK,
  Patterns.BEEHIVE,
  Patterns.LOAF,
  Patterns.BOAT,
  Patterns.TUB,
  Patterns.SHIP,
  Patterns.POND
]

function fillPipeWithStillLifes(gol, cols, rows, openSide) {
  const numPatterns = Math.floor((cols * rows) / 8)

  for (let i = 0; i < numPatterns; i++) {
    const pattern = random(PIPE_STILL_LIFES)
    const x = Math.floor(random(0, cols))
    const y = Math.floor(random(0, rows))
    gol.setPattern(pattern, x, y)
  }

  // Fill perimeter with open side
  if (openSide !== 'top') {
    for (let x = 0; x < cols; x++) {
      gol.current[x][0] = 1
    }
  }
  if (openSide !== 'bottom') {
    for (let x = 0; x < cols; x++) {
      gol.current[x][rows - 1] = 1
    }
  }
  for (let y = 0; y < rows; y++) {
    gol.current[0][y] = 1
    gol.current[cols - 1][y] = 1
  }
}

function spawnPipes() {
  state.spawnTimer++

  if (state.spawnTimer >= CONFIG.pipe.spawnInterval) {
    state.spawnTimer = 0

    const currentSpeed = Math.max(
      CONFIG.pipe.speedMin,
      CONFIG.pipe.speedStart + (state.level - 1) * CONFIG.pipe.speedIncrement
    )

    const currentGap = Math.max(
      CONFIG.pipe.gapMin,
      CONFIG.pipe.gapStart - (state.level - 1) * CONFIG.pipe.gapDecrement
    )

    const minGapTop = CONFIG.ceilingY + 60
    const maxGapTop = CONFIG.groundY - currentGap - 60
    const gapTop = random(minGapTop, maxGapTop)

    // Top pipe
    const topPipeCols = Math.floor(CONFIG.pipe.width / 30)
    const topPipeRows = Math.floor((gapTop - CONFIG.ceilingY) / 30)

    const topPipe = {
      x: GAME_DIMENSIONS.BASE_WIDTH,
      y: CONFIG.ceilingY,
      width: CONFIG.pipe.width,
      height: gapTop - CONFIG.ceilingY,
      cellSize: CONFIG.pipe.cellSize,
      vx: currentSpeed,
      scored: false,
      gol: new GoLEngine(topPipeCols, topPipeRows, 0),
      gradient: GRADIENT_PRESETS.ENEMY_HOT,
      dead: false
    }

    // Bottom pipe
    const bottomPipeCols = Math.floor(CONFIG.pipe.width / 30)
    const bottomPipeRows = Math.floor((CONFIG.groundY - (gapTop + currentGap)) / 30)

    const bottomPipe = {
      x: GAME_DIMENSIONS.BASE_WIDTH,
      y: gapTop + currentGap,
      width: CONFIG.pipe.width,
      height: CONFIG.groundY - (gapTop + currentGap),
      cellSize: CONFIG.pipe.cellSize,
      vx: currentSpeed,
      scored: false,
      gol: new GoLEngine(bottomPipeCols, bottomPipeRows, 0),
      gradient: GRADIENT_PRESETS.ENEMY_COLD,
      dead: false
    }

    fillPipeWithStillLifes(topPipe.gol, topPipeCols, topPipeRows, 'top')
    fillPipeWithStillLifes(bottomPipe.gol, bottomPipeCols, bottomPipeRows, 'bottom')

    pipes.push(topPipe, bottomPipe)
  }
}

function updatePipes() {
  pipes.forEach(pipe => {
    pipe.x += pipe.vx

    // Score when player passes pipe
    if (!pipe.scored && pipe.x + pipe.width < player.x) {
      pipe.scored = true
      state.score++
    }

    // Remove off-screen pipes
    if (pipe.x < -pipe.width) {
      pipe.dead = true
    }
  })

  pipes = pipes.filter(p => !p.dead)
}

// ============================================
// UPDATE LOOP
// ============================================
function draw() {
  state.frameCount++

  background(CONFIG.ui.backgroundColor)

  if (state.phase === 'WAITING') {
    updateWaiting()
  } else if (state.phase === 'PLAYING') {
    updateGame()
  } else if (state.phase === 'DYING') {
    state.dyingTimer++
    particles = updateParticles(particles, state.frameCount)

    const minDelayPassed = state.dyingTimer >= GAMEOVER_CONFIG.MIN_DELAY
    const particlesDone = particles.length === 0
    const maxWaitReached = state.dyingTimer >= GAMEOVER_CONFIG.MAX_WAIT

    if ((particlesDone && minDelayPassed) || maxWaitReached) {
      state.phase = 'GAMEOVER'
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

function showGameOver() {
  const overlay = document.getElementById('game-over-overlay')
  const finalScoreElement = document.getElementById('final-score-value')
  const scoreSection = document.getElementById('score-section')

  if (overlay && finalScoreElement) {
    overlay.classList.add('visible')
    finalScoreElement.textContent = state.score

    if (scoreSection) {
      scoreSection.style.display = 'none'
    }
  }
}

function updateWaiting() {
  // Update clouds for visual effect while waiting
  updateClouds()

  // Gentle hover animation for player
  player.y = CONFIG.player.startY + Math.sin(state.frameCount * 0.05) * 20

  // Update GoL pattern for visual effect
  player.gol.updateThrottled(state.frameCount)
  applyLifeForce(player)

  // Check for first tap to start game
  if (isTouching) {
    state.phase = 'PLAYING'
    player.vy = CONFIG.jumpForce  // First flap
    isTouching = false

    // Hide touch hint
    const touchHint = document.getElementById('touch-hint')
    if (touchHint) {
      touchHint.style.display = 'none'
    }
  }

  // Desktop keyboard start
  if (keyIsDown(32) || keyIsDown(UP_ARROW) || keyIsDown(87) || keyIsDown(78)) {
    state.phase = 'PLAYING'
    player.vy = CONFIG.jumpForce

    const touchHint = document.getElementById('touch-hint')
    if (touchHint) {
      touchHint.style.display = 'none'
    }
  }
}

function updateGame() {
  // Update level based on score
  state.level = Math.floor(state.score / 5) + 1

  updateClouds()
  updatePlayer()
  updatePipes()
  particles = updateParticles(particles, state.frameCount)
  checkCollisions()
  spawnPipes()
}

function updatePlayer() {
  // MOBILE TOUCH - Tap to flap
  if (isTouching) {
    player.vy = CONFIG.jumpForce
    isTouching = false  // Consume tap
  }

  // DESKTOP KEYBOARD FALLBACK
  if (keyIsDown(32) || keyIsDown(UP_ARROW) || keyIsDown(87) || keyIsDown(78)) {
    player.vy = CONFIG.jumpForce
  }

  // Apply gravity
  player.vy += CONFIG.gravity

  // Apply terminal velocity
  player.vy = Math.min(player.vy, CONFIG.terminalVelocity)

  player.y += player.vy

  // Ceiling collision
  if (player.y < CONFIG.ceilingY) {
    player.y = CONFIG.ceilingY
    player.vy = 0
  }

  // Ground collision
  if (player.y > CONFIG.groundY - player.height && state.phase !== 'GAMEOVER' && state.phase !== 'DYING') {
    state.phase = 'DYING'
    state.dyingTimer = 0
    spawnExplosion(player.x + player.width / 2, player.y + player.height / 2)
  }

  // Update GoL with life force
  player.gol.updateThrottled(state.frameCount)
  applyLifeForce(player)
}

function checkCollisions() {
  pipes.forEach(pipe => {
    if (Collision.rectRect(
      player.x, player.y, player.width, player.height,
      pipe.x, pipe.y, pipe.width, pipe.height
    )) {
      if (state.phase !== 'GAMEOVER' && state.phase !== 'DYING') {
        state.phase = 'DYING'
        state.dyingTimer = 0
        spawnExplosion(player.x + player.width / 2, player.y + player.height / 2)
      }
    }
  })
}

function spawnExplosion(x, y) {
  for (let i = 0; i < 8; i++) {
    const particle = {
      x: x + random(-30, 30),
      y: y + random(-30, 30),
      vx: random(-9, 9),
      vy: random(-9, 9),
      alpha: 255,
      width: 180,
      height: 180,
      gol: new GoLEngine(6, 6, 30),
      cellSize: 30,
      gradient: GRADIENT_PRESETS.EXPLOSION,
      dead: false
    }

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

  // Render parallax clouds (background layer)
  renderClouds()

  // Render player with gradient (hide during DYING and GAMEOVER)
  if (state.phase === 'PLAYING' || state.phase === 'WAITING') {
    maskedRenderer.renderMaskedGrid(
      player.gol,
      player.x,
      player.y,
      player.cellSize,
      player.gradient
    )
  }

  // Render pipes with gradients
  pipes.forEach(pipe => {
    maskedRenderer.renderMaskedGrid(
      pipe.gol,
      pipe.x,
      pipe.y,
      pipe.cellSize,
      pipe.gradient
    )
  })

  // Render particles with gradients and alpha
  renderParticles(particles, maskedRenderer, 30)

  // Debug: Draw hitboxes (press H to toggle)
  if (state.phase === 'PLAYING' || state.phase === 'WAITING') {
    drawHitboxRect(player.x, player.y, player.width, player.height, 'player', '#00FF00')
  }
  pipes.forEach((pipe, index) => {
    drawHitboxRect(pipe.x, pipe.y, pipe.width, pipe.height, `pipe ${index}`, '#FF0000')
  })

  pop()
}

// ============================================
// INPUT
// ============================================
function keyPressed() {
  // Desktop testing only
}

// ============================================
// WINDOW RESIZE HANDLER
// ============================================
function windowResized() {
  const size = calculateResponsiveSize()
  canvasWidth = size.width
  canvasHeight = size.height
  updateConfigScale()
  resizeCanvas(canvasWidth, canvasHeight)
}

// ============================================
// RESTART HANDLER - Tap anywhere on overlay
// ============================================
window.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('game-over-overlay')
  if (overlay) {
    overlay.addEventListener('click', () => {
      overlay.classList.remove('visible')
      initGame()
    })
  }
})

// Export for p5.js
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
window.windowResized = windowResized
