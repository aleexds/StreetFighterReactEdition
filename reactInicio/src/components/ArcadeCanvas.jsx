import { useEffect, useRef } from 'react';

// GIFs animados para el combate en tiempo real
const SPRITES = {
  playerIdle: 'https://media.giphy.com/media/cb9aF9tDyiRkY/giphy.gif', // Goku Idle/Pelea
  playerAttack: 'https://media.giphy.com/media/12k3CXfz15TqM/giphy.gif', // Kamehameha / Golpe
  cpuIdle: 'https://media.giphy.com/media/731L50hYTBR4Y/giphy.gif', // Vegeta Idle
  cpuAttack: 'https://media.giphy.com/media/4Vtk42BXYv3OM/giphy.gif' // Vegeta Ataque
};

export const ArcadeCanvas = ({ playerFighter, onHpChange, onGameOver }) => {
  const canvasRef = useRef(null);

  const gameStateRef = useRef({
    player: {
      x: 100,
      y: 180,
      width: 90,
      height: 120,
      hp: 100,
      isAttacking: false,
      vx: 0,
      vy: 0,
      isGrounded: true
    },
    cpu: {
      x: 600,
      y: 180,
      width: 90,
      height: 120,
      hp: 100,
      isAttacking: false,
      vx: 0,
      vy: 0
    },
    keys: {}
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Cargar sprites animados
    const imgPlayerIdle = new Image();
    imgPlayerIdle.src = SPRITES.playerIdle;

    const imgPlayerAttack = new Image();
    imgPlayerAttack.src = SPRITES.playerAttack;

    const imgCpuIdle = new Image();
    imgCpuIdle.src = SPRITES.cpuIdle;

    const imgCpuAttack = new Image();
    imgCpuAttack.src = SPRITES.cpuAttack;

    // Teclado
    const handleKeyDown = (e) => { gameStateRef.current.keys[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e) => { gameStateRef.current.keys[e.key.toLowerCase()] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Bucle principal de combate (60 FPS)
    const updateGame = () => {
      const state = gameStateRef.current;
      const { player, cpu, keys } = state;

      if (player.hp <= 0 || cpu.hp <= 0) {
        cancelAnimationFrame(animationFrameId);
        onGameOver(player.hp > 0 ? 'Victoria' : 'Derrota', player.hp);
        return;
      }

      // Movimiento Jugador
      if (keys['a'] && player.x > 0) player.x -= 6;
      if (keys['d'] && player.x < canvas.width - player.width) player.x += 6;

      // Salto estilo DBZ
      if ((keys['w'] || keys[' ']) && player.isGrounded) {
        player.vy = -14;
        player.isGrounded = false;
      }

      player.y += player.vy;
      if (player.y < 180) {
        player.vy += 0.7;
      } else {
        player.y = 180;
        player.vy = 0;
        player.isGrounded = true;
      }

      // Ataque Jugador (J = Ráfaga / K = Ki Blast)
      if ((keys['j'] || keys['k']) && !player.isAttacking) {
        player.isAttacking = true;
        setTimeout(() => { player.isAttacking = false; }, 350);
      }

      // IA de la CPU (Vegeta)
      const distance = cpu.x - (player.x + player.width);
      if (distance > 50) {
        cpu.x -= 2.5;
      } else if (distance < 20) {
        cpu.x += 2.5;
      } else {
        if (!cpu.isAttacking && Math.random() < 0.04) {
          cpu.isAttacking = true;
          setTimeout(() => { cpu.isAttacking = false; }, 400);
        }
      }

      // Daño e Impactos
      if (player.isAttacking && distance < 60) {
        cpu.hp = Math.max(0, cpu.hp - 1.2);
        cpu.x += 3;
        onHpChange(player.hp, cpu.hp);
      }

      if (cpu.isAttacking && distance < 60) {
        player.hp = Math.max(0, player.hp - 1.0);
        player.x -= 3;
        onHpChange(player.hp, cpu.hp);
      }

      // --- DIBUJAR EN CANVAS ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fondo de la Arena DBZ (Tierra / Torneo)
      ctx.fillStyle = '#1e272c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#d35400'; // Suelo del Torneo
      ctx.fillRect(0, 300, canvas.width, 50);

      // Dibujar Sprites del Jugador
      const currentImgPlayer = player.isAttacking ? imgPlayerAttack : imgPlayerIdle;
      ctx.drawImage(currentImgPlayer, player.x, player.y, player.width, player.height);

      // Dibujar Sprites de la CPU
      const currentImgCpu = cpu.isAttacking ? imgCpuAttack : imgCpuIdle;
      ctx.drawImage(currentImgCpu, cpu.x, cpu.y, cpu.width, cpu.height);

      animationFrameId = requestAnimationFrame(updateGame);
    };

    updateGame();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [playerFighter, onHpChange, onGameOver]);

  return (
    <div style={{ textAlign: 'center', margin: '15px 0' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={350}
        style={{ border: '4px solid #f39c12', borderRadius: '8px', backgroundColor: '#000' }}
      />
      <p style={{ color: '#f1c40f', fontSize: '14px' }}>
        💥 <strong>Controles:</strong> [A / D] Moverse | [W / Espacio] Volar/Saltar | [J / K] Ráfaga de Ki / Ataque
      </p>
    </div>
  );
};