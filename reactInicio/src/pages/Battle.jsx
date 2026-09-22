import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HealthBar } from '../components/HealthBar';
import { ArcadeCanvas } from '../components/ArcadeCanvas';
import { playSound, startBGM, stopBGM } from '../utils/sound'; // 🎵 Importamos el módulo de sonido

export const Battle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [cpuHp, setCpuHp] = useState(100);
  const [isGameOver, setIsGameOver] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  // Iniciar Música de Fondo (BGM) al montar la arena de combate
  useEffect(() => {
    startBGM();
    return () => {
      stopBGM(); // Detener música si el jugador cambia de página
    };
  }, []);

  useEffect(() => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPlayer({
          id: data.id,
          name: data.name.toUpperCase(),
          hp: 100,
          spriteIdle: data.sprites.other['showdown']?.front_default || data.sprites.front_default,
          spriteAttack: data.sprites.other['showdown']?.back_default || data.sprites.back_default || data.sprites.front_default
        });
      })
      .catch((err) => console.error('Error al obtener Pokémon:', err));
  }, [id]);

  const sendToN8nWebhook = useCallback(async (finalResult, finalScore) => {
    try {
      await fetch('https://TU_WEBHOOK_URL_N8N/webhook/game-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jugador: player?.name || 'Entrenador Pokémon',
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
    stopBGM(); // Detener música al terminar
    playSound('ko'); // 🔊 Efecto de K.O. / Final de partida
    sendToN8nWebhook(result, finalHp * 10);
  }, [isGameOver, sendToN8nWebhook]);

  if (!player) return <h2 style={{ textAlign: 'center', color: '#f1c40f', marginTop: '40px' }}>Entrando a la Arena Pokémon...</h2>;

  return (
    <div>
      <Navbar />
      <h2 style={{ textAlign: 'center', color: '#27ae60' }}>Combate Pokémon en Tiempo Real</h2>
      
      <div style={{ display: 'flex', justifyContent: 'space-around', margin: '10px 0' }}>
        <HealthBar fighterName={player.name} currentHp={playerHp} maxHp={100} />
        <HealthBar fighterName="CHARIZARD (CPU)" currentHp={cpuHp} maxHp={100} />
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
            onClick={() => {
              playSound('buttonClick'); // 🔊 Sonido al hacer clic
              navigate('/leaderboard');
            }} 
            style={{ 
              padding: '12px 24px', 
              fontSize: '18px', 
              cursor: 'pointer', 
              backgroundColor: '#27ae60', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '6px',
              fontWeight: 'bold' 
            }}
          >
            Ver Tabla de Posiciones
          </button>
        </div>
      )}
    </div>
  );
};