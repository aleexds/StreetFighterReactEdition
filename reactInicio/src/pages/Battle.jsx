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
    fetch(`https://dragonball-api.com/api/characters/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPlayer({
          name: data.name,
          hp: 100
        });
      })
      .catch((err) => console.error('Error al obtener personaje:', err));
  }, [id]);

  const sendToN8nWebhook = useCallback(async (finalResult, finalScore) => {
    try {
      await fetch('https://TU_WEBHOOK_URL_N8N/webhook/game-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jugador: player?.name || 'Guerrero Z',
          resultado: finalResult,
          puntaje: Math.round(finalScore),
          fecha: new Date().toISOString()
        })
      });
      console.log('Resultado enviado a n8n');
    } catch (err) {
      console.error('Error enviando a n8n:', err);
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

  if (!player) return <h2 style={{ textAlign: 'center' }}>Elevando el Ki...</h2>;

  return (
    <div>
      <Navbar />
      <h2 style={{ textAlign: 'center', color: '#f39c12' }}>Torneo del Poder en Tiempo Real</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <HealthBar fighterName={player.name} currentHp={playerHp} maxHp={100} />
        <HealthBar fighterName="Vegeta (CPU)" currentHp={cpuHp} maxHp={100} />
      </div>

      {!isGameOver ? (
        <ArcadeCanvas 
          playerFighter={player} 
          onHpChange={handleHpChange} 
          onGameOver={handleGameOver} 
        />
      ) : (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <h1>{matchResult === 'Victoria' ? '🏆 ¡VICTORIA K.O.!' : '💀 HAS SIDO ELIMINADO'}</h1>
          <button 
            onClick={() => navigate('/leaderboard')} 
            style={{ padding: '12px 24px', fontSize: '18px', cursor: 'pointer', backgroundColor: '#e67e22', color: '#fff', border: 'none', borderRadius: '5px' }}
          >
            Ver Tabla de Posiciones
          </button>
        </div>
      )}
    </div>
  );
};