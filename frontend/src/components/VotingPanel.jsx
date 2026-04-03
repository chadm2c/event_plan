import { useState } from 'react';
import { Activity } from 'lucide-react';

export default function VotingPanel({ question, options, onVote, isClosed }) {
  const [selected, setSelected] = useState(null);

  const handleVote = (id) => {
    if (isClosed) return;
    setSelected(id);
    if (onVote) onVote(id);
  };

  return (
    <div className="tactical-card" style={{ marginTop: '2rem' }}>
      <div className="card-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
          <Activity size={20} color="var(--accent-nuclear)" /> {question.toUpperCase()}
        </h3>
      </div>
      <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {options.map((option) => {
          const totalVotes = options.reduce((sum, opt) => sum + (opt.votes ? opt.votes.length : 0), 0);
          const currentVotes = option.votes ? option.votes.length : 0;
          const percent = totalVotes === 0 ? 0 : Math.round((currentVotes / totalVotes) * 100);
          const isSelected = selected === option.id;

          return (
            <div 
              key={option.id} 
              onClick={() => handleVote(option.id)}
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: `1px solid ${isSelected ? 'var(--accent-nuclear)' : 'rgba(255,255,255,0.05)'}`,
                padding: '1rem 1.5rem',
                cursor: isClosed ? 'default' : 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
            >
              <div 
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${percent}%`,
                  background: isSelected ? 'rgba(223, 255, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  borderRight: percent > 0 ? `2px solid ${isSelected ? 'var(--accent-nuclear)' : 'rgba(255,255,255,0.2)'}` : 'none',
                  zIndex: 0,
                  transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                }} 
              />
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 700, color: isSelected ? 'var(--accent-nuclear)' : 'white' }}>
                  {isSelected && '> '}{option.text.toUpperCase()}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>{percent}% [{currentVotes} UNITS]</span>
              </div>
            </div>
          );
        })}
        {options.length === 0 && <span style={{color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem'}}>[ERROR]: NO POLLING OPTIONS DEFINED</span>}
      </div>
    </div>
  );
}
