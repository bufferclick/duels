export const SynthPresets = {
  punch: { freq: 120, type: 'sine' as OscillatorType, decay: 0.12 },
  hitHeavy: { freq: 60, type: 'square' as OscillatorType, decay: 0.22 },
  whoosh: { freq: 2200, type: 'sawtooth' as OscillatorType, filter: 2200 },
  roar: { freq: 45, type: 'sawtooth' as OscillatorType, filter: 900 },
};
