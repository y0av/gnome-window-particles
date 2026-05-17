import St from 'gi://St';
import Clutter from 'gi://Clutter';
import { Effects, EffectType } from './effects.js';

/**
 * Particle Engine - Handles particle creation and animation
 */
export class ParticleEngine {
  constructor() {
    this.activeParticles = [];
  }

  /**
   * Create particles for a window close event
   */
  spawnEffect(x, y, effectType = EffectType.SPARKLES) {
    const effectConfig = Effects[effectType];
    if (!effectConfig) {
      console.warn(`[ParticleEngine] Unknown effect type: ${effectType}`);
      return;
    }

    for (let i = 0; i < effectConfig.particleCount; i++) {
      this._createParticle(x, y, effectConfig, i);
    }
  }

  /**
   * Create a single particle and animate it
   */
  _createParticle(originX, originY, config, index) {
    const particle = new St.Label({
      text: config.particleChar,
      style: `color: ${config.colors[index % config.colors.length]};`,
    });

    particle.set_position(originX, originY);
    global.stage.add_child(particle);

    // Calculate trajectory
    const { velocityX, velocityY } = this._calculateVelocity(
      config,
      index,
      config.particleCount
    );

    const targetX = originX + velocityX;
    const targetY = originY + velocityY;

    // Animation properties
    const animProps = {
      x: targetX,
      y: targetY,
      opacity: 0,
      duration: config.duration,
      mode: Clutter.AnimationMode.EASE_OUT_CUBIC,
      onComplete: () => {
        global.stage.remove_child(particle);
        const idx = this.activeParticles.indexOf(particle);
        if (idx > -1) this.activeParticles.splice(idx, 1);
      },
    };

    // Optional: Add rotation
    if (config.rotation) {
      animProps.rotation_angle_z = 360 + Math.random() * 360;
    }

    particle.ease(animProps);
    this.activeParticles.push(particle);
  }

  /**
   * Calculate velocity based on effect angle and particle index
   */
  _calculateVelocity(config, index, totalParticles) {
    let angle, speed;

    if (config.angle === 'radial') {
      // Full 360 degree burst
      angle = (Math.PI * 2 * index) / totalParticles;
      speed = config.velocity + (Math.random() - 0.5) * config.velocityVariation;
    } else if (config.angle === 'upward') {
      // Primarily upward with spread
      angle = (Math.PI / 2) + (Math.random() - 0.5) * (Math.PI / 4);
      speed = config.velocity + (Math.random() - 0.5) * config.velocityVariation;
    } else {
      // Default to radial
      angle = (Math.PI * 2 * index) / totalParticles;
      speed = config.velocity + (Math.random() - 0.5) * config.velocityVariation;
    }

    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    // Apply gravity if configured
    if (config.gravity) {
      return {
        velocityX: vx,
        velocityY: vy - config.gravity, // Negative because Y down is positive
      };
    }

    return {
      velocityX: vx,
      velocityY: vy,
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
}
