import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Street Fighter: React Edition</h1>
        <p>Demuestra tu habilidad en combates tácticos por turnos.</p>
        <button onClick={() => navigate('/seleccionar')} style={{ padding: '12px 24px', fontSize: '18px' }}>
          ¡Iniciar Pelea!
        </button>
      </div>
    </div>
  );
};