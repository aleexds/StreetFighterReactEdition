// Contexto de audio Web Audio API (Sintetizador integrado en el navegador)
let audioCtx = null;
let bgmInterval = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Generador de efectos de sonido sintetizados
export const playSound = (type) => {
  try {
    const ctx = getAudioContext();

    if (type === 'buttonClick') {
      // Clic de botón (Pitched Beep)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } 
    else if (type === 'hit') {
      // Golpe / Impacto (Noise / Punch)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } 
    else if (type === 'ko') {
      // Sonido de K.O. / Final de partida (Retro Defeat Scale)
      const notes = [400, 350, 300, 200];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + index * 0.15;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    }
  } catch (e) {
    console.log('Error al reproducir audio:', e);
  }
};

// Música de fondo 8-bit sintetizada (Melodía de Pelea Arcade)
export const startBGM = () => {
  stopBGM(); // Limpiar cualquier música anterior
  
  const ctx = getAudioContext();
  const melody = [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66]; // Do - Re - Mi - Fa - Sol
  let noteIndex = 0;

  bgmInterval = setInterval(() => {
    try {
      if (ctx.state === 'running') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'square'; // Sonido clásico de consola 8-bits
        osc.frequency.setValueAtTime(melody[noteIndex], ctx.currentTime);
        
        gain.gain.setValueAtTime(0.05, ctx.currentTime); // Volumen suave
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
        
        noteIndex = (noteIndex + 1) % melody.length;
      }
    } catch (e) {
      console.log('Error en BGM:', e);
    }
  }, 200); // Ritmo arcade constante
};

export const stopBGM = () => {
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }
};