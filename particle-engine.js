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
  }

  /**
   * Create particles for a window close event
   * Particles spawn from random points across the window area
   * Limited by maxParticles to maintain performance
   */
  spawnEffect(windowX, windowY, windowWidth, windowHeight, effectType) {
    if (!effectType) effectType = EffectType.SPARKLES;
    
    const effectConfig = Effects[effectType];
    if (!effectConfig) {
      log(`[ParticleEngine] Unknown effect type: ${effectType}`);
      return;
    }

    // Prevent excessive particles from degrading performance
    const particlesToSpawn = Math.min(
      effectConfig.particleCount,
      Math.max(1, this.maxParticles - this.activeParticles.length)
    );
    
    if (particlesToSpawn === 0) {
      log(`[ParticleEngine] Particle limit reached (${this.maxParticles}). Skipping effect.`);
      return;
    }

    for (let i = 0; i < particlesToSpawn; i++) {
      // Random spawn point across the window surface
      const spawnX = windowX + Math.random() * windowWidth;
      const spawnY = windowY + Math.random() * windowHeight;
      this._createParticle(spawnX, spawnY, effectConfig, i);
    }
    
    if (particlesToSpawn < effectConfig.particleCount) {
      log(`[ParticleEngine] Spawned ${particlesToSpawn}/${effectConfig.particleCount} particles (limit: ${this.maxParticles})`);
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

    // Apply gravity if configured
    if (config.gravity) {
      return {
        vx: vx,
        vy: vy - config.gravity,
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
