export const HealthBar = ({ fighterName, currentHp, maxHp = 100 }) => {
  const percentage = Math.max(0, (currentHp / maxHp) * 100);
  
  return (
    <div style={{ width: '200px', margin: '10px' }}>
      <h4>{fighterName}: {currentHp} / {maxHp} HP</h4>
      <div style={{ width: '100%', height: '20px', backgroundColor: '#555', borderRadius: '5px' }}>
        <div 
          style={{ 
            width: `${percentage}%`, 
            height: '100%', 
            backgroundColor: percentage > 30 ? '#4caf50' : '#f44336',
            transition: 'width 0.3s ease'
          }} 
        />
      </div>
    </div>
  );
};