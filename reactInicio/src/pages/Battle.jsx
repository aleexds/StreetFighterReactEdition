import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HealthBar } from '../components/HealthBar';
import { ActionPanel } from '../components/ActionPanel';
import { CombatLog } from '../components/CombatLog';

export const Battle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [cpuHp, setCpuHp] = useState(100);
  const [logs, setLogs] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [turn, setTurn] = useState('PLAYER');

  const timerRef = useRef(null);

  useEffect(() => {
    fetch(`http://localhost:3001/fighters/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPlayer(data);
        setPlayerHp(data.hp);
      })
      .catch((err) => console.error('Error al cargar el peleador:', err));
  }, [id]);

  const sendToN8nWebhook = useCallback(async (finalResult, finalScore) => {
    try {
      await fetch('https://TU_WEBHOOK_URL_N8N/webhook/game-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jugador: player?.name || 'Jugador 1',
          resultado: finalResult,
          puntaje: finalScore,
          fecha: new Date().toISOString()
        })
      });
      console.log('Resultado enviado a n8n con éxito');
    } catch (err) {
      console.error('Error enviando datos a n8n:', err);
    }
  }, [player]);

  // Turno de la CPU y verificación de victoria/derrota
  useEffect(() => {
    if (turn === 'CPU' && !isGameOver) {
      timerRef.current = setTimeout(() => {
        const cpuDamage = Math.floor(Math.random() * 20) + 10;
        
        setPlayerHp((prevHp) => {
          const newHp = Math.max(0, prevHp - cpuDamage);
          if (newHp === 0) {
            setIsGameOver(true);
            setLogs((prev) => [...prev, `La CPU atacó (-${cpuDamage} HP). ¡DERROTA! Has sido vencido.`]);
            sendToN8nWebhook('Derrota', 0);
          } else {
            setLogs((prev) => [...prev, `La CPU atacó y causó ${cpuDamage} de daño.`]);
            setTurn('PLAYER');
          }
          return newHp;
        });
      }, 1500);
    }

    return () => clearTimeout(timerRef.current);
  }, [turn, isGameOver, sendToN8nWebhook]);

  // Ataque del Jugador y verificación de victoria
  const handleAttack = (attack) => {
    if (turn !== 'PLAYER' || isGameOver) return;

    setCpuHp((prevHp) => {
      const newHp = Math.max(0, prevHp - attack.damage);
      if (newHp === 0) {
        setIsGameOver(true);
        setLogs((prev) => [...prev, `Usaste ${attack.name} (-${attack.damage} HP). ¡VICTORIA! Has derrotado a la CPU.`]);
        sendToN8nWebhook('Victoria', playerHp * 10);
      } else {
        setLogs((prev) => [...prev, `Usaste ${attack.name} y causaste ${attack.damage} de daño.`]);
        setTurn('CPU');
      }
      return newHp;
    });
  };

  if (!player) return <h2>Cargando arena de combate...</h2>;

  return (
    <div>
      <Navbar />
      <h2>Arena de Peleas</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div>
          <h3>{player.name} (Tú)</h3>
          <HealthBar fighterName={player.name} currentHp={playerHp} maxHp={player.hp} />
        </div>
        <div>
          <h3>M. Bison (CPU)</h3>
          <HealthBar fighterName="CPU" currentHp={cpuHp} maxHp={100} />
        </div>
      </div>

      {!isGameOver ? (
        <ActionPanel attacks={player.attacks} onSelectAttack={handleAttack} disabled={turn === 'CPU'} />
      ) : (
        <div style={{ marginTop: '20px' }}>
          <h3>Fin de la partida</h3>
          <button onClick={() => navigate('/leaderboard')}>Ver Tabla de Posiciones</button>
        </div>
      )}

      <CombatLog logs={logs} />
    </div>
  );
};