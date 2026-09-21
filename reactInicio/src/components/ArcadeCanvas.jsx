import { useEffect, useRef, useState } from 'react';

// GIFs Animados transparentes de Dragon Ball
const DBZ_ANIMATIONS = {
  playerIdle: 'https://media.giphy.com/media/cb9aF9tDyiRkY/giphy.gif',   // Goku animado respirando/pose
  playerAttack: 'https://media.giphy.com/media/12k3CXfz15TqM/giphy.gif', // Goku animado ráfaga/Kamehameha
  cpuIdle: 'https://media.giphy.com/media/731L50hYTBR4Y/giphy.gif',      // Vegeta animado pose
  cpuAttack: 'https://media.giphy.com/media/4Vtk42BXYv3OM/giphy.gif'     // Vegeta animado ataque
};

export const ArcadeCanvas = ({ playerFighter, onHpChange, onGameOver }) => {
  const canvasRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const spritesRef = useRef({
    pIdle: null,
    pAttack: null,
    cIdle: null,
    cAttack: null
  });

  const gameStateRef = useRef({
    player: { x: 100, y: 160, width: 100, height: 140, hp: playerFighter?.hp || 100, isAttacking: false, vy: 0, isGrounded: true },
    cpu: { x: 580, y: 160, width: 100, height: 140, hp: 100, isAttacking: false, vy: 0 },
    keys: {}
  });

  // Precarga de los GIFs animados
  useEffect(() => {
    let isMounted = true;

    const pIdle = new Image();
    const pAttack = new Image();
    const cIdle = new Image();
    const cAttack = new Image();

    pIdle.src = DBZ_ANIMATIONS.playerIdle;
    pAttack.src = DBZ_ANIMATIONS.playerAttack;
    cIdle.src = DBZ_ANIMATIONS.cpuIdle;
    cAttack.src = DBZ_ANIMATIONS.cpuAttack;

    let count = 0;
    const onLoad = () => {
      count++;
      if (count === 4 && isMounted) {
        spritesRef.current = { pIdle, pAttack, cIdle, cAttack };
        setImagesLoaded(true);
      }
    };

    pIdle.onload = onLoad; pAttack.onload = onLoad;
    cIdle.onload = onLoad; cAttack.onload = onLoad;

    return () => { isMounted = false; };
  }, [playerFighter]);

  useEffect(() => {
    if (!imagesLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleKeyDown = (e) => { gameStateRef.current.keys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e) => { gameStateRef.current.keys[e.key.toLowerCase()] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const updateGame = () => {
      const state = gameStateRef.current;
      const { player, cpu, keys } = state;

      if (player.hp <= 0 || cpu.hp <= 0) {
        cancelAnimationFrame(animationFrameId);
        onGameOver(player.hp > 0 ? 'Victoria' : 'Derrota', player.hp);
        return;
      }

      // Movimiento
      if (keys['a'] && player.x > 0) player.x -= 6;
      if (keys['d'] && player.x < canvas.width - player.width) player.x += 6;

      // Salto
      if ((keys['w'] || keys[' ']) && player.isGrounded) {
        player.vy = -13;
        player.isGrounded = false;
      }

      player.y += player.vy;
      if (player.y < 160) {
        player.vy += 0.7;
      } else {
        player.y = 160;
        player.vy = 0;
        player.isGrounded = true;
      }

      // Ataque
      if ((keys['j'] || keys['k']) && !player.isAttacking) {
        player.isAttacking = true;
        setTimeout(() => { player.isAttacking = false; }, 400);
      }

      // IA CPU
      const distance = cpu.x - (player.x + player.width);
      if (distance > 50) cpu.x -= 2;
      else if (distance < 20) cpu.x += 2;
      else if (!cpu.isAttacking && Math.random() < 0.03) {
        cpu.isAttacking = true;
        setTimeout(() => { cpu.isAttacking = false; }, 400);
      }

      // Colisiones de daño
      if (player.isAttacking && distance < 60) {
        cpu.hp = Math.max(0, cpu.hp - 1.2);
        cpu.x += 2;
        onHpChange(player.hp, cpu.hp);
      }
      if (cpu.isAttacking && distance < 60) {
        player.hp = Math.max(0, player.hp - 0.9);
        player.x -= 2;
        onHpChange(player.hp, cpu.hp);
      }

      // Renderizado
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Arena
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(0, 300, canvas.width, 50);

      // Dibujar Jugador Animado (Intercambia GIF según si ataca o no)
      const playerSprite = player.isAttacking ? spritesRef.current.pAttack : spritesRef.current.pIdle;
      ctx.drawImage(playerSprite, player.x, player.y, player.width, player.height);

      // Dibujar CPU Animado
      const cpuSprite = cpu.isAttacking ? spritesRef.current.cAttack : spritesRef.current.cIdle;
      ctx.drawImage(cpuSprite, cpu.x, cpu.y, cpu.width, cpu.height);

      animationFrameId = requestAnimationFrame(updateGame);
    };

    updateGame();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [imagesLoaded, playerFighter, onHpChange, onGameOver]);

  if (!imagesLoaded) return <h3 style={{ textAlign: 'center', color: '#f39c12' }}>Cargando animaciones Z...</h3>;

  return (
    <div style={{ textAlign: 'center', margin: '15px 0' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={350}
        style={{ border: '4px solid #f39c12', borderRadius: '8px', backgroundColor: '#000' }}
      />
      <p style={{ color: '#aaa', fontSize: '14px' }}>
        💥 <strong>Controles:</strong> [A / D] Moverse | [W / Espacio] Saltar | [J / K] Ataque
      </p>
    </div>
  );
};