import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const SelectFighter = () => {
  // 1. Corregido: era useState en lugar de meState
  const [fighters, setFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 2. Corregido: estructura limpia del fetch sin ternarios
    fetch('http://localhost:3001/fighters')
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener los peleadores');
        return res.json();
      })
      .then((data) => {
        setFighters(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2>Cargando lista de peleadores...</h2>;
  if (error) return <h2>Error: {error}</h2>;

  return (
    <div>
      <Navbar />
      <h2>Selecciona tu Peleador</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        {fighters.map((f) => (
          <div key={f.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h3>{f.name}</h3>
            <img src={f.avatar} alt={f.name} width="100" />
            <br />
            <button onClick={() => navigate(`/pelea/${f.id}`)} style={{ marginTop: '10px' }}>
              Elegir {f.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};