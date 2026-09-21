export const ActionPanel = ({ attacks, onSelectAttack, disabled }) => {
  return (
    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
      {attacks.map((attack) => (
        <button 
          key={attack.id} 
          onClick={() => onSelectAttack(attack)}
          disabled={disabled}
          style={{ padding: '10px 15px', cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          {attack.name} (-{attack.damage} HP)
        </button>
      ))}
    </div>
  );
};