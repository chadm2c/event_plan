import { useState, useEffect } from 'react';
import { Activity, Search, ChevronRight } from 'lucide-react';
import EventCard from './EventCard';
import api from '../api';

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  
  const fetchEvents = async () => {
    try {
      const res = await api.get(`/events/`, {
        params: { search: search || undefined }
      });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <main>
      <header style={{ marginBottom: '6rem', borderLeft: '4px solid var(--accent-nuclear)', paddingLeft: '2rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-nuclear)', marginBottom: '1rem', letterSpacing: '0.2em' }}>
          // SYSTEM.OVERVIEW.V4
        </div>
        <h1 style={{ fontSize: '5rem', lineHeight: '0.9', marginBottom: '1.5rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '-0.05em' }}>
          INDUSTRIAL <br/>
          <span style={{ color: 'var(--text-muted)' }}>EXPERIENCES</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '500px', fontFamily: 'var(--font-heading)', fontWeight: '400' }}>
          Access the encrypted registry of high-performance gatherings, summits, and networking modules across the global infrastructure.
        </p>
      </header>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textTransform: 'uppercase', fontSize: '1.8rem', letterSpacing: '-0.02em' }}>
              <Activity color="var(--accent-nuclear)" /> ACTIVE_REGISTRY
            </h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              RECORDS_FOUND: {events.length}
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
            <Search 
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} 
              size={18} 
            />
            <input 
              placeholder="FILTER_BY_METADATA..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingRight: '3.5rem', marginBottom: 0, textTransform: 'uppercase' }}
            />
          </div>
        </div>

        <div className="data-grid">
          {events.map(event => (
            <EventCard key={event.id || event._id} event={event} />
          ))}
          {events.length === 0 && (
            <div style={{color: 'var(--accent-danger)', fontFamily: 'var(--font-mono)', gridColumn: '1/-1', textAlign: 'center', padding: '6rem', border: '1px dashed var(--accent-danger)' }}>
              [ERROR]: NO RECORDS MATCHED SEARCH PARAMETERS
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
