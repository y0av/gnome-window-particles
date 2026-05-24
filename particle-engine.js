import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { Effects, EffectType } from './effects.js';

/**
 * Particle Engine - Handles particle creation and animation
 */
export class ParticleEngine {
  constructor() {
    this.activeParticles = [];
    this.maxParticles = 300; // Prevent performance degradation from too many particles
    this.baseMaxParticles = 300; // Store the base limit for adaptive scaling
    this.lastCleanupTime = 0;
    this.cleanupInterval = 5000; // Cleanup every 5 seconds
  }

  /**
   * Create particles for a window close event
   * Particles spawn from random points across the window area
   * Limited by maxParticles to maintain performance
   * Adaptive throttling reduces particle count under heavy load
   */
  spawnEffect(windowX, windowY, windowWidth, windowHeight, effectType) {
    if (!effectType) effectType = EffectType.SPARKLES;
    
    const effectConfig = Effects[effectType];
    if (!effectConfig) {
      log(`[ParticleEngine] Unknown effect type: ${effectType}`);
      return;
    }

    // Periodic cleanup to prevent memory leaks from stuck particles
    this._performPeriodicCleanup();
    
    // Adaptive particle throttling: reduce particles under heavy load
    const adaptiveLimit = this._calculateAdaptiveLimit();

    // Prevent excessive particles from degrading performance
    const particlesToSpawn = Math.min(
      effectConfig.particleCount,
      Math.max(1, adaptiveLimit - this.activeParticles.length)
    );
    
    if (particlesToSpawn === 0) {
      log(`[ParticleEngine] Particle limit reached (adaptive: ${adaptiveLimit}, active: ${this.activeParticles.length}). Skipping effect.`);
      return;
    }

    for (let i = 0; i < particlesToSpawn; i++) {
      // Random spawn point across the window surface
      const spawnX = windowX + Math.random() * windowWidth;
      const spawnY = windowY + Math.random() * windowHeight;
      this._createParticle(spawnX, spawnY, effectConfig, i);
    }
    
    if (particlesToSpawn < effectConfig.particleCount) {
      log(`[ParticleEngine] Spawned ${particlesToSpawn}/${effectConfig.particleCount} particles (adaptive limit: ${adaptiveLimit})`);
    }
  }

  /**
   * Calculate adaptive particle limit based on active particle load
   * Under heavy load, reduce new particles to maintain frame rate
   * Load levels:
   * - Light (0-100 particles): 100% of base limit (300)
   * - Medium (100-200): 80% of base limit (240)
   * - Heavy (200-300): 60% of base limit (180)
   */
  _calculateAdaptiveLimit() {
    const activeCount = this.activeParticles.length;
    
    if (activeCount < 100) {
      // Light load: maintain full capacity
      return this.baseMaxParticles;
    } else if (activeCount < 200) {
      // Medium load: reduce to 80%
      return Math.floor(this.baseMaxParticles * 0.8);
    } else {
      // Heavy load: reduce to 60%
      return Math.floor(this.baseMaxParticles * 0.6);
    }
  }

  /**
   * Periodically clean up orphaned particles
   * Prevents memory leaks from particles that failed to animate cleanly
   */
  _performPeriodicCleanup() {
    const now = Date.now();
    if (now - this.lastCleanupTime < this.cleanupInterval) {
      return; // Skip cleanup if interval hasn't passed
    }

    this.lastCleanupTime = now;
    const initialCount = this.activeParticles.length;
    
    // Remove any particles that are no longer in the stage
    this.activeParticles = this.activeParticles.filter((particle) => {
      try {
        return particle.get_parent() !== null;
      } catch (e) {
        return false;
      }
    });

    const cleanedCount = initialCount - this.activeParticles.length;
    if (cleanedCount > 0) {
      log(`[ParticleEngine] Cleaned up ${cleanedCount} orphaned particles (${this.activeParticles.length} remaining)`);
    }
  }

  /**
   * Create a single particle and animate it
   */
  _createParticle(originX, originY, config, index) {
    // Set initial size - effects can define a size multiplier
    const sizeMultiplier = config.sizeMultiplier || 1.0;
    const fontSize = Math.floor(14 * sizeMultiplier);
    
    const particle = new St.Label({
      text: config.particleChar,
      style: `color: ${config.colors[index % config.colors.length]}; font-size: ${fontSize}px;`,
    });

    particle.set_position(originX, originY);
    global.stage.add_child(particle);

    // Calculate trajectory
    const velocity = this._calculateVelocity(config, index, config.particleCount);

    const targetX = originX + velocity.vx;
    const targetY = originY + velocity.vy;

    // Animation properties
    const animProps = {
      x: targetX,
      y: targetY,
      opacity: 0,
      duration: config.duration,
      mode: Clutter.AnimationMode.EASE_OUT_CUBIC,
      onComplete: () => {
        try {
          global.stage.remove_child(particle);
        } catch (e) {
        }
        const idx = this.activeParticles.indexOf(particle);
        if (idx > -1) this.activeParticles.splice(idx, 1);
      },
    }

    // Optional: Add rotation
    if (config.rotation) {
      animProps.rotation_angle_z = 360 + Math.random() * 360;
    }

    // Optional: Add scaling (grows or shrinks during animation)
    if (config.scale) {
      animProps.scale_x = config.scale;
      animProps.scale_y = config.scale;
    }

    particle.ease(animProps);
    this.activeParticles.push(particle);
  }

  /**
   * Calculate velocity based on effect angle and particle index
   * Particles burst outward from their spawn point
   * 
   * Note on gravity: Gravity is applied over the animation duration.
   * With duration D and gravity G, total vertical displacement includes:
   * - Initial velocity component: vy * D / 1000
   * - Gravity acceleration: -0.5 * G * (D / 1000)^2
   * This creates realistic parabolic arcs for explosion/confetti effects.
   */
  _calculateVelocity(config, index, totalParticles) {
    let angle, speed;

    if (config.angle === 'radial') {
      // Full 360 degree burst - each particle gets a unique angle
      angle = (Math.PI * 2 * index) / totalParticles + (Math.random() - 0.5) * 0.3;
      speed = config.velocity + (Math.random() - 0.5) * config.velocityVariation;
    } else if (config.angle === 'upward') {
      // Primarily upward with spread
      angle = (Math.PI / 2) + (Math.random() - 0.5) * (Math.PI / 3);
      speed = config.velocity + (Math.random() - 0.5) * config.velocityVariation;
    } else {
      // Default to radial with randomness
      angle = Math.random() * Math.PI * 2;
      speed = config.velocity + (Math.random() - 0.5) * config.velocityVariation;
    }

    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    // Gravity accelerates particles downward during animation
    // The velocity here is the INITIAL velocity; gravity modifies the path shape
    // Real physics: y_final = y_0 + vy*t - 0.5*g*t^2
    // We use Clutter's easing, so we approximate by adjusting final Y position
    if (config.gravity) {
      const durationSeconds = config.duration / 1000;
      const gravityEffect = 0.5 * config.gravity * durationSeconds * durationSeconds;
      
      return {
        vx: vx,
        vy: vy + gravityEffect, // Add gravity displacement to Y velocity
      };
    }

    return {
      vx: vx,
      vy: vy,
    };
  }

  /**
   * Clean up all active particles
   */
  cleanup() {
    this.activeParticles.forEach((particle) => {
      try {
        global.stage.remove_child(particle);
      } catch (e) {
        // Particle may have already been removed
      }
    });
    this.activeParticles = [];
  }
};
