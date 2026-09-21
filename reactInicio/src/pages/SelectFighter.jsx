import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const SelectFighter = () => {
  const [fighters, setFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Petición a la PokeAPI pública para obtener los primeros 12 Pokémon
    fetch('https://pokeapi.co/api/v2/pokemon?limit=12')
      .then((res) => res.json())
      .then(async (data) => {
        // Obtenemos los detalles de cada Pokémon para traer sus imágenes
        const detailedPokemon = await Promise.all(
          data.results.map(async (poke) => {
            const res = await fetch(poke.url);
            const details = await res.json();
            return {
              id: details.id,
              name: details.name.toUpperCase(),
              avatar: details.sprites.other['official-artwork'].front_default || details.sprites.front_default,
              type: details.types[0]?.type?.name || 'normal',
              hp: details.stats[0].base_stat || 100
            };
          })
        );
        setFighters(detailedPokemon);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error cargando Pokémon:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar />
        <h2 style={{ textAlign: 'center', marginTop: '40px', color: '#f1c40f' }}>
          ⚡ Cargando Lista de Pokémon...
        </h2>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <h2 style={{ textAlign: 'center', margin: '20px 0', color: '#27ae60' }}>
        Selecciona tu Pokémon para el Combate
      </h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', padding: '10px' }}>
        {fighters.map((fighter) => (
          <div
            key={fighter.id}
            style={{
              border: '2px solid #27ae60',
              borderRadius: '12px',
              padding: '15px',
              width: '180px',
              textAlign: 'center',
              backgroundColor: '#1e272c',
              boxShadow: '0 4px 10px rgba(39, 174, 96, 0.3)'
            }}
          >
            <img
              src={fighter.avatar}
              alt={fighter.name}
              style={{ height: '140px', objectFit: 'contain', marginBottom: '10px' }}
            />
            <h3 style={{ color: '#fff', margin: '5px 0', fontSize: '18px' }}>{fighter.name}</h3>
            <p style={{ color: '#aaa', fontSize: '12px', margin: '2px 0' }}>Tipo: {fighter.type}</p>
            <p style={{ color: '#2ecc71', fontSize: '12px', fontWeight: 'bold' }}>HP Base: {fighter.hp}</p>
            
            <button
              onClick={() => navigate(`/pelea/${fighter.id}`)}
              style={{
                backgroundColor: '#27ae60',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '10px',
                width: '100%'
              }}
            >
              ¡Elegir!
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};