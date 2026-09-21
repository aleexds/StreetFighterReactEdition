import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';

export const Leaderboard = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/scores')
      .then((res) => res.json())
      .then((data) => setScores(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <Navbar />
      <h2>Tabla de Posiciones</h2>
      <ul>
        {scores.map((s) => (
          <li key={s.id}>{s.player} - {s.score} pts ({s.result})</li>
        ))}
      </ul>
    </div>
  );
};