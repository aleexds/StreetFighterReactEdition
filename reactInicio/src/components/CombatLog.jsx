export const CombatLog = ({ logs }) => {
  return (
    <div style={{ border: '1px solid #ccc', height: '150px', overflowY: 'auto', padding: '10px', marginTop: '15px' }}>
      <h3>Historial de Combate</h3>
      <ul>
        {logs.map((log, index) => (
          <li key={`log-${index}`}>{log}</li>
        ))}
      </ul>
    </div>
  );
};