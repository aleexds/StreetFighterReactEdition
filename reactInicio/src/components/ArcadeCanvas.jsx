import { useEffect, useRef, useState } from 'react';

// GIFs Animados oficiales transparentes de la PokeAPI (Showdown Sprites)
const POKEMON_SPRITES = {
  // Pikachu (Jugador) - Frente y Ataque (Espalda)
  playerIdle: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif',
  playerAttack: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/25.gif',
  
  // Charizard (CPU) - Frente y Ataque (Espalda)
  cpuIdle: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/6.gif',
  cpuAttack: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/back/6.gif'
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
    player: {
      x: 100,
      y: 150,
      width: 110,
      height: 110,
      hp: playerFighter?.hp || 100,
      isAttacking: false,
      vy: 0,
      isGrounded: true
    },
    cpu: {
      x: 580,
      y: 130,
      width: 130,
      height: 130,
      hp: 100,
      isAttacking: false,
      vy: 0
    },
    keys: {}
  });

  // 1. Precarga limpia de los GIFs de la PokeAPI
  useEffect(() => {
    let isMounted = true;

    const pIdle = new Image();
    const pAttack = new Image();
    const cIdle = new Image();
    const cAttack = new Image();

    pIdle.src = POKEMON_SPRITES.playerIdle;
    pAttack.src = POKEMON_SPRITES.playerAttack;
    cIdle.src = POKEMON_SPRITES.cpuIdle;
    cAttack.src = POKEMON_SPRITES.cpuAttack;

    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 4 && isMounted) {
        spritesRef.current = { pIdle, pAttack, cIdle, cAttack };
        setImagesLoaded(true);
      }
    };

    pIdle.onload = checkLoaded; pAttack.onload = checkLoaded;
    cIdle.onload = checkLoaded; cAttack.onload = checkLoaded;

    return () => { isMounted = false; };
  }, [playerFighter]);

  // 2. Loop del juego en el Canvas
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
        if (onGameOver) onGameOver(player.hp > 0 ? 'Victoria' : 'Derrota', player.hp);
        return;
      }

      // Movimiento Jugador
      if (keys['a'] && player.x > 0) player.x -= 6;
      if (keys['d'] && player.x < canvas.width - player.width) player.x += 6;

      // Salto
      if ((keys['w'] || keys[' ']) && player.isGrounded) {
        player.vy = -12;
        player.isGrounded = false;
      }

      player.y += player.vy;
      if (player.y < 150) {
        player.vy += 0.7;
      } else {
        player.y = 150;
        player.vy = 0;
        player.isGrounded = true;
      }

      // Ataque Jugador
      if ((keys['j'] || keys['k']) && !player.isAttacking) {
        player.isAttacking = true;
        setTimeout(() => { player.isAttacking = false; }, 400);
      }

      // IA CPU (Charizard)
      const distance = cpu.x - (player.x + player.width);
      if (distance > 60) cpu.x -= 2;
      else if (distance < 20) cpu.x += 2;
      else if (!cpu.isAttacking && Math.random() < 0.03) {
        cpu.isAttacking = true;
        setTimeout(() => { cpu.isAttacking = false; }, 400);
      }

      // Detección de daño
      if (player.isAttacking && distance < 70) {
        cpu.hp = Math.max(0, cpu.hp - 1.2);
        cpu.x += 3;
        if (onHpChange) onHpChange(player.hp, cpu.hp);
      }

      if (cpu.isAttacking && distance < 70) {
        player.hp = Math.max(0, player.hp - 0.9);
        player.x -= 3;
        if (onHpChange) onHpChange(player.hp, cpu.hp);
      }

      // --- DIBUJAR EN CANVAS ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fondo del Estadio Pokémon
      ctx.fillStyle = '#1e272c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#27ae60'; // Suelo verde
      ctx.fillRect(0, 260, canvas.width, 90);

      // Jugador (Pikachu)
      const playerSprite = player.isAttacking ? spritesRef.current.pAttack : spritesRef.current.pIdle;
      if (playerSprite) {
        ctx.drawImage(playerSprite, player.x, player.y, player.width, player.height);
      }

      // Ataque de Rayo / Impactrueno
      if (player.isAttacking) {
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(player.x + player.width + 10, player.y + 40, 18, 0, Math.PI * 2);
        ctx.fill();
      }

      // CPU (Charizard)
      const cpuSprite = cpu.isAttacking ? spritesRef.current.cAttack : spritesRef.current.cIdle;
      if (cpuSprite) {
        ctx.drawImage(cpuSprite, cpu.x, cpu.y, cpu.width, cpu.height);
      }

      // Ataque Lanzallamas
      if (cpu.isAttacking) {
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(cpu.x - 10, cpu.y + 50, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(updateGame);
    };

    updateGame();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [imagesLoaded, playerFighter, onHpChange, onGameOver]);

  if (!imagesLoaded) {
    return <h3 style={{ textAlign: 'center', color: '#f1c40f' }}>⚡ Entrando a la arena Pokémon...</h3>;
  }

  return (
    <div style={{ textAlign: 'center', margin: '15px 0' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={350}
        style={{ border: '4px solid #27ae60', borderRadius: '8px', backgroundColor: '#000' }}
      />
      <p style={{ color: '#aaa', fontSize: '14px' }}>
        ⚡ <strong>Controles:</strong> [A / D] Moverse | [W / Espacio] Saltar | [J / K] Impactrueno
      </p>
    </div>
  );
};