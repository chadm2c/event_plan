import { Calendar, Users, MapPin, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  const eventId = String(event._id || event.id || ''); 
  let dateStr = "TBD";
  try {
      if (event.date) dateStr = new Date(event.date).toLocaleDateString();
  } catch(e) {}

  return (
    <div className="tactical-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: event.is_closed ? 'var(--accent-danger)' : 'var(--accent-nuclear)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            {event.is_closed ? '// STATUS: TERMINATED' : '// STATUS: ACTIVE_SESSION'}
          </div>
          <h3 style={{ fontSize: '1.4rem', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{event.title}</h3>
        </div>
        <Activity size={20} color={event.is_closed ? 'var(--accent-danger)' : 'var(--accent-nuclear)'} />
      </div>

      <div className="card-content">
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.85rem', minHeight: '40px', fontFamily: 'var(--font-heading)' }}>
          {event.description}
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Calendar size={14} color="var(--text-dim)" /> {dateStr.toUpperCase()}
          </div>
          {event.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <MapPin size={14} color="var(--text-dim)" /> {event.location.toUpperCase()}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <Users size={14} color="var(--text-dim)" /> {(event.participants || []).length} UNITS
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to={`/events/${eventId}`} className={`btn ${event.is_closed ? 'danger' : 'primary'}`} style={{ flex: 1, textAlign: 'center', padding: '0.6rem' }}>
              {event.is_closed ? 'AUDIT RESULTS' : 'ACCESS LOBBY'}
          </Link>
        </div>
      </div>
    </div>
  );
}
