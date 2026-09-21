import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav style={{ display: 'flex', gap: '20px', padding: '10px', background: '#222', color: '#fff' }}>
      <h2>Street Fighter React</h2>
      <Link to="/" style={{ color: '#fff' }}>Inicio</Link>
      <Link to="/seleccionar" style={{ color: '#fff' }}>Seleccionar Peleador</Link>
      <Link to="/leaderboard" style={{ color: '#fff' }}>Tabla de Posiciones</Link>
    </nav>
  );
};