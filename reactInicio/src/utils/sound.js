// URLs estables y 100% funcionales para efectos y música
const SFX_URLS = {
  buttonClick: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  hit: 'https://assets.mixkit.co/active_storage/sfx/2152/2152-preview.mp3',
  ko: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  bgm: 'https://assets.mixkit.co/music/preview/mixkit-game-level-music-689.mp3'
};

// Precargar audio en memoria
const audioCache = {
  buttonClick: new Audio(SFX_URLS.buttonClick),
  hit: new Audio(SFX_URLS.hit),
  ko: new Audio(SFX_URLS.ko),
  bgm: new Audio(SFX_URLS.bgm)
};

// Configuración de la música de fondo
audioCache.bgm.loop = true;
audioCache.bgm.volume = 0.2;

export const playSound = (type) => {
  const sound = audioCache[type];
  if (!sound) return;

  // Reiniciar el audio si ya se estaba reproduciendo
  sound.currentTime = 0;
  sound.volume = type === 'hit' ? 0.5 : type === 'ko' ? 0.8 : 0.4;
  
  sound.play().catch((err) => console.log(`Audio ${type} esperando interacción:`, err));
};

export const startBGM = () => {
  audioCache.bgm.currentTime = 0;
  
  // Promesa para iniciar la música tras desbloquear el navegador
  const playPromise = audioCache.bgm.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Si el navegador lo bloquea, se activa en el primer clic dentro de la página
      const unlockAudio = () => {
        audioCache.bgm.play();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };
      window.addEventListener('click', unlockAudio);
      window.addEventListener('keydown', unlockAudio);
    });
  }
};

export const stopBGM = () => {
  audioCache.bgm.pause();
  audioCache.bgm.currentTime = 0;
};