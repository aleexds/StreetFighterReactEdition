// URLs directas a efectos de sonido y música arcade sin derechos de autor (royalty free)
const SFX = {
  buttonClick: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  hit: 'https://assets.mixkit.co/active_storage/sfx/2152/2152-preview.mp3',
  ko: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  bgm: 'https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3'
};

// Instancia global de la música de fondo
const bgmAudio = new Audio(SFX.bgm);
bgmAudio.loop = true;
bgmAudio.volume = 0.25; // Volumen suave para no opacar el juego

export const playSound = (type) => {
  if (!SFX[type]) return;
  const audio = new Audio(SFX[type]);
  audio.volume = type === 'hit' ? 0.6 : 0.4;
  audio.play().catch(() => {
    // Los navegadores bloquean el autoplays hasta que el usuario interactúa con la página
  });
};

export const startBGM = () => {
  bgmAudio.play().catch(() => {
    console.log('Esperando interacción del usuario para reproducir BGM...');
  });
};

export const stopBGM = () => {
  bgmAudio.pause();
  bgmAudio.currentTime = 0;
};