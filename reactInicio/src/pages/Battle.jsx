import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HealthBar } from '../components/HealthBar';
import { ArcadeCanvas } from '../components/ArcadeCanvas';

export const Battle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [cpuHp, setCpuHp] = useState(100);
  const [isGameOver, setIsGameOver] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

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
          puntaje: Math.round(finalScore),
          fecha: new Date().toISOString()
        })
      });
      console.log('Resultado enviado a n8n con éxito');
    } catch (err) {
      console.error('Error enviando datos a n8n:', err);
    }
  }, [player]);

  const handleHpChange = useCallback((newPlayerHp, newCpuHp) => {
    setPlayerHp(Math.round(newPlayerHp));
    setCpuHp(Math.round(newCpuHp));
  }, []);

  const handleGameOver = useCallback((result, finalHp) => {
    if (isGameOver) return;
    setIsGameOver(true);
    setMatchResult(result);
    sendToN8nWebhook(result, finalHp * 10);
  }, [isGameOver, sendToN8nWebhook]);

  if (!player) return <h2>Cargando arena de combate...</h2>;

  return (
    <div>
      <Navbar />
      <h2 style={{ textAlign: 'center' }}>Arena Arcade en Tiempo Real</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <HealthBar fighterName={player.name} currentHp={playerHp} maxHp={player.hp} />
        <HealthBar fighterName="M. Bison (CPU)" currentHp={cpuHp} maxHp={100} />
      </div>

      {!isGameOver ? (
        <ArcadeCanvas 
          playerFighter={player} 
          onHpChange={handleHpChange} 
          onGameOver={handleGameOver} 
        />
      ) : (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <h1>{matchResult === 'Victoria' ? '🏆 ¡VICTORIA K.O.!' : '💀 HAS SIDO DERROTADO'}</h1>
          <button 
            onClick={() => navigate('/leaderboard')} 
            style={{ padding: '12px 24px', fontSize: '18px', cursor: 'pointer' }}
          >
            Ver Tabla de Posiciones
          </button>
        </div>
      )}
    </div>
  );
};