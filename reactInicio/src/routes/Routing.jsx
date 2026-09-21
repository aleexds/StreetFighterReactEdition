import { Routes, Route } from 'react-router-dom';
import { Home } from '../pages/Home';
import { SelectFighter } from '../pages/SelectFighter';
import { Battle } from '../pages/Battle';
import { Leaderboard } from '../pages/Leaderboard';

export const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/seleccionar" element={<SelectFighter />} />
      <Route path="/pelea/:id" element={<Battle />} /> {/* Ruta Dinámica con parámetro */}
      <Route path="/leaderboard" element={<Leaderboard />} />
    </Routes>
  );
};