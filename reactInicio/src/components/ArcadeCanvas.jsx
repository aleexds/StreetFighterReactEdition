import { useEffect, useRef } from 'react';

export const ArcadeCanvas = ({ playerFighter, onHpChange, onGameOver }) => {
  const canvasRef = useRef(null);

  // Estados mutables para el bucle del juego (60 FPS) usando useRef para evitar re-renders lentos
  const gameStateRef = useRef({
    player: {
      x: 100,
      y: 200,
      width: 50,
      height: 100,
      hp: playerFighter?.hp || 100,
      isAttacking: false,
      attackType: null, // 'punch' | 'kick'
      vx: 0,
      vy: 0,
      isGrounded: true
    },
    cpu: {
      x: 600,
      y: 200,
      width: 50,
      height: 100,
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

    // Listeners de Teclado
    const handleKeyDown = (e) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Loop de juego principal
    const updateGame = () => {
      const state = gameStateRef.current;
      const { player, cpu, keys } = state;

      if (player.hp <= 0 || cpu.hp <= 0) {
        cancelAnimationFrame(animationFrameId);
        onGameOver(player.hp > 0 ? 'Victoria' : 'Derrota', player.hp);
        return;
      }

      // --- MOVIMIENTO DEL JUGADOR ---
      if (keys['a'] && player.x > 0) player.x -= 5;
      if (keys['d'] && player.x < canvas.width - player.width) player.x += 5;

      // Salto
      if ((keys['w'] || keys[' ']) && player.isGrounded) {
        player.vy = -12;
        player.isGrounded = false;
      }

      // Gravedad Jugador
      player.y += player.vy;
      if (player.y < 200) {
        player.vy += 0.6;
      } else {
        player.y = 200;
        player.vy = 0;
        player.isGrounded = true;
      }

      // Ataques Jugador (J = Puño, K = Patada)
      if (keys['j'] && !player.isAttacking) {
        player.isAttacking = true;
        player.attackType = 'punch';
        setTimeout(() => { player.isAttacking = false; }, 250);
      }
      if (keys['k'] && !player.isAttacking) {
        player.isAttacking = true;
        player.attackType = 'kick';
        setTimeout(() => { player.isAttacking = false; }, 350);
      }

      // --- IA DE LA CPU ---
      const distance = cpu.x - (player.x + player.width);
      if (distance > 40) {
        cpu.x -= 2; // Acercarse al jugador
      } else if (distance < 20) {
        cpu.x += 2; // Alejarse si está muy pegado
      } else {
        // Atacar de forma aleatoria si está en rango
        if (!cpu.isAttacking && Math.random() < 0.03) {
          cpu.isAttacking = true;
          setTimeout(() => { cpu.isAttacking = false; }, 300);
        }
      }

      // --- DETECCIÓN DE COLISIONES DE GOLPE ---
      // Impacto del Jugador a la CPU
      if (player.isAttacking && distance < 45) {
        const damage = player.attackType === 'kick' ? 1.5 : 1.0;
        cpu.hp = Math.max(0, cpu.hp - damage);
        cpu.x += 4; // Empuje por impacto
        onHpChange(player.hp, cpu.hp);
      }

      // Impacto de la CPU al Jugador
      if (cpu.isAttacking && distance < 45) {
        player.hp = Math.max(0, player.hp - 0.8);
        player.x -= 4; // Empuje por impacto
        onHpChange(player.hp, cpu.hp);
      }

      // --- RENDERIZADO EN EL CANVAS ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fondo (Piso de la Arena)
      ctx.fillStyle = '#333';
      ctx.fillRect(0, 300, canvas.width, 100);

      // Dibujar Jugador
      ctx.fillStyle = player.isAttacking ? '#f39c12' : '#3498db';
      ctx.fillRect(player.x, player.y, player.width, player.height);

      // Hitbox del Ataque Jugador
      if (player.isAttacking) {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(player.x + player.width, player.y + 20, 30, 20);
      }

      // Dibujar CPU
      ctx.fillStyle = cpu.isAttacking ? '#9b59b6' : '#e74c3c';
      ctx.fillRect(cpu.x, cpu.y, cpu.width, cpu.height);

      // Hitbox del Ataque CPU
      if (cpu.isAttacking) {
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(cpu.x - 30, cpu.y + 20, 30, 20);
      }

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
        style={{ border: '4px solid #fff', borderRadius: '8px', backgroundColor: '#1a1a1a' }}
      />
      <p style={{ color: '#aaa', fontSize: '14px' }}>
        🎮 <strong>Controles:</strong> [A / D] Moverse | [W o Espacio] Saltar | [J] Puñetazo | [K] Patada
      </p>
    </div>
  );
};