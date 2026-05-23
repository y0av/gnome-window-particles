// Particle Effects Library for GNOME Window Particles Extension

export const EffectType = {
  SPARKLES: 'sparkles',
  CONFETTI: 'confetti',
  SMOKE: 'smoke',
  EXPLOSION: 'explosion',
  RAINBOW: 'rainbow',
};

export const Effects = {
  [EffectType.SPARKLES]: {
    name: 'Sparkles',
    particleCount: 20,
    colors: ['#FFD700', '#FFA500', '#FF69B4'],
    particleChar: '✨',
    duration: 1000,
    velocity: 150,
    velocityVariation: 100,
    angle: 'radial', // 360 degree burst
    gravity: 0, // Sparkles float gracefully, no gravity
    sizeMultiplier: 1.0,
  },

  [EffectType.CONFETTI]: {
    name: 'Confetti',
    particleCount: 30,
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    particleChar: '■', // Square shape
    duration: 1200,
    velocity: 130,  // Slightly increased from 120
    velocityVariation: 85,  // Slightly increased from 80
    angle: 'radial',
    rotation: true, // Particles rotate
    gravity: 220, // Increased from 200 for more natural falling
    sizeMultiplier: 1.2,
  },

  [EffectType.SMOKE]: {
    name: 'Smoke',
    particleCount: 15,
    colors: ['#999999', '#CCCCCC', '#FFFFFF'],
    particleChar: '●', // Circle
    duration: 1500,
    velocity: 80,
    velocityVariation: 40,
    angle: 'upward', // Move upward
    opacity: 0.6,
    sizeMultiplier: 1.8, // Smoke particles are bigger
    scale: 1.5, // Grow as they dissipate
    gravity: 0, // No gravity for smoke - naturally floats up
  },

  [EffectType.EXPLOSION]: {
    name: 'Explosion',
    particleCount: 60,
    colors: ['#FF4500', '#FFD700', '#FF6347', '#FFA500', '#FF69B4'],
    particleChar: '●',
    duration: 1200,
    velocity: 320,  // Increased from 300 for snappier burst
    velocityVariation: 160,  // Increased from 150 for more spread
    angle: 'radial',
    gravity: 200,
    rotation: true,
    sizeMultiplier: 1.4,
    scale: 0.3, // Shrink as they fly away
  },

  [EffectType.RAINBOW]: {
    name: 'Rainbow',
    particleCount: 35,
    colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
    particleChar: '★',
    duration: 1100,
    velocity: 150,  // Slightly increased from 140 for snappier effect
    velocityVariation: 95,  // Slightly increased from 90
    angle: 'radial',
    rotation: true,
    gravity: 150, // Added gravity for more organic motion
    sizeMultiplier: 1.3,
  },
};

/**
 * Get effect config by type
 */
export function getEffect(effectType) {
  return Effects[effectType] || Effects[EffectType.SPARKLES];
}

/**
 * Get all available effects
 */
export function listEffects() {
  return Object.values(Effects);
}
