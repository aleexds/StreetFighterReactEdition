import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const SelectFighter = () => {
  const [fighters, setFighters] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Consumo de la Dragon Ball API pública
    fetch('https://dragonball-api.com/api/characters?limit=10')
      .then((res) => res.json())
      .then((data) => {
        // Mapeamos los datos de la API a la estructura que necesita nuestro juego
        const formattedFighters = data.items.map((char) => ({
          id: char.id,
          name: char.name,
          avatar: char.image,
          ki: char.ki,
          race: char.race
        }));
        setFighters(formattedFighters);
      })
      .catch((err) => console.error('Error cargando personajes de Dragon Ball:', err));
  }, []);

  return (
    <div>
      <Navbar />
      <h2 style={{ textAlign: 'center', margin: '20px 0' }}>Selecciona tu Guerrero Z</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px' }}>
        {fighters.map((fighter) => (
          <div 
            key={fighter.id} 
            style={{
              border: '2px solid #f39c12',
              borderRadius: '10px',
              padding: '15px',
              width: '180px',
              textAlign: 'center',
              backgroundColor: '#1a1a1a',
              boxShadow: '0 4px 8px rgba(243, 156, 18, 0.3)'
            }}
          >
            <img 
              src={fighter.avatar} 
              alt={fighter.name} 
              style={{ height: '180px', objectFit: 'contain', marginBottom: '10px' }} 
            />
            <h3 style={{ color: '#fff', margin: '5px 0' }}>{fighter.name}</h3>
            <p style={{ color: '#aaa', fontSize: '12px' }}>Raza: {fighter.race}</p>
            <button 
              onClick={() => navigate(`/pelea/${fighter.id}`)}
              style={{
                backgroundColor: '#e67e22',
                color: '#fff',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '10px'
              }}
            >
              ¡Pelear!
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};