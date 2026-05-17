// Particle Effects Library for GNOME Window Particles Extension

const EffectType = {
  SPARKLES: 'sparkles',
  CONFETTI: 'confetti',
  SMOKE: 'smoke',
  EXPLOSION: 'explosion',
  RAINBOW: 'rainbow',
};

const Effects = {
  [EffectType.SPARKLES]: {
    name: 'Sparkles',
    particleCount: 20,
    colors: ['#FFD700', '#FFA500', '#FF69B4'],
    particleChar: '✨',
    duration: 1000,
    velocity: 150,
    velocityVariation: 100,
    angle: 'radial', // 360 degree burst
  },

  [EffectType.CONFETTI]: {
    name: 'Confetti',
    particleCount: 30,
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    particleChar: '■', // Square shape
    duration: 1200,
    velocity: 120,
    velocityVariation: 80,
    angle: 'radial',
    rotation: true, // Particles rotate
    gravity: 200, // Falls down slightly
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
    growSize: true, // Particles grow as they dissipate
  },

  [EffectType.EXPLOSION]: {
    name: 'Explosion',
    particleCount: 40,
    colors: ['#FF4500', '#FFD700', '#FF6347', '#FFA500'],
    particleChar: '●',
    duration: 900,
    velocity: 250, // Faster burst
    velocityVariation: 120,
    angle: 'radial',
    gravity: 150,
  },

  [EffectType.RAINBOW]: {
    name: 'Rainbow',
    particleCount: 35,
    colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
    particleChar: '★',
    duration: 1100,
    velocity: 140,
    velocityVariation: 90,
    angle: 'radial',
    rotation: true,
  },
};

/**
 * Get effect config by type
 */
function getEffect(effectType) {
  return Effects[effectType] || Effects[EffectType.SPARKLES];
}

/**
 * Get all available effects
 */
function listEffects() {
  return Object.values(Effects);
}
