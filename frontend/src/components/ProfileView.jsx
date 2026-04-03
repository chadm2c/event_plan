import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Shield, User, Database, Activity } from 'lucide-react';
import api from '../api';

export default function ProfileView() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [user, setUser] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const loadProfile = async () => {
        try {
            const userRes = await api.get('/auth/me');
            setUser(userRes.data);
            setFormData(prev => ({ ...prev, email: userRes.data.email }));
            
            const eventsRes = await api.get('/events/');
            const filtered = eventsRes.data.filter(e => String(e.organizer_id) === String(userRes.data.id || userRes.data._id));
            setMyEvents(filtered);
        } catch (err) {
            console.error(err);
        }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    try {
      const payload = {};
      if (formData.email) payload.email = formData.email;
      if (formData.password) payload.password = formData.password;
      
      await api.put('/auth/me', payload);
      setStatus({ type: 'success', message: 'PARAMETERS_SYNCHRONIZED_SUCCESSFULLY' });
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.detail || 'SYSTEM_SYNC_FAILURE' });
    }
  };

  if (!user) return <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--accent-nuclear)', fontFamily: 'var(--font-mono)' }}>// RETRIEVING_IDENTITY_DATA...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      <header style={{ borderLeft: '4px solid var(--accent-nuclear)', paddingLeft: '2rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-nuclear)', marginBottom: '1rem', letterSpacing: '0.2em' }}>
          // PERSONNEL.DOSSIER
        </div>
        <h1 style={{ fontSize: '4.5rem', lineHeight: '0.9', marginBottom: '1.5rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '-0.05em' }}>
          USER: <span style={{ color: 'var(--text-muted)' }}>{user.username.toUpperCase()}</span>
        </h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem' }}>
        
        {/* Management Module */}
        <div className="tactical-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ textTransform: 'uppercase', fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Database size={20} color="var(--accent-nuclear)" /> PARAMETER_MANAGEMENT
            </h2>
          </div>
          
          <div className="card-content">
            {status.message && (
              <div style={{ 
                padding: '1rem', 
                marginBottom: '2rem',
                backgroundColor: 'black',
                color: status.type === 'success' ? 'var(--accent-nuclear)' : 'var(--accent-danger)',
                borderLeft: `3px solid ${status.type === 'success' ? 'var(--accent-nuclear)' : 'var(--accent-danger)'}`,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem'
              }}>
                [{status.type.toUpperCase()}]: {status.message}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div className="label">IDENTITY_STR</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>{user.username.toUpperCase()}</div>
                </div>
                <div>
                  <div className="label">AUTH_CLEARANCE</div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-nuclear)', fontSize: '0.9rem', fontWeight: 700 }}>LEVEL_{user.role.toUpperCase()}</div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
              <label className="label">GEOGRAPHIC_NODE (EMAIL)</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                required 
              />
              
              <label className="label">MOD_ACCESS_KEY (NEW_PASSWORD)</label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                placeholder="RETAIN_EXISTING_KEY"
              />
              
              <button type="submit" className="btn primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                SYNC_CHANGES
              </button>
            </form>

            {user.role !== 'admin' && (
              <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '1rem', fontFamily: 'var(--font-mono)' }}>// EMERGENCY_ELEVATION_OVERRIDE</div>
                <button 
                    className="btn" 
                    style={{ width: '100%', borderColor: 'var(--accent-danger)', color: 'var(--accent-danger)' }}
                    onClick={async () => {
                        try {
                            await api.post('/admin/make-me-admin');
                            window.location.reload(); 
                        } catch(e) {
                            alert("ELEVATION_FAILURE");
                        }
                    }}
                >
                    ACQUIRE_ADMIN_PRIVILEGES
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action History Module */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="tactical-card">
            <div className="card-header">
              <h2 style={{ textTransform: 'uppercase', fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Activity size={18} color="var(--accent-nuclear)" /> EXPERIENCE_HISTORY
              </h2>
            </div>
            <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myEvents.map(e => (
                <div key={e.id || e._id} style={{ 
                  padding: '1.25rem', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                      <div style={{ fontWeight: '700', textTransform: 'uppercase', fontSize: '0.9rem' }}>{e.title}</div>
                      <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: e.is_closed ? 'var(--accent-danger)' : 'var(--accent-nuclear)', marginTop: '0.25rem' }}>
                          {e.is_closed ? '// STATUS: TERMINATED' : '// STATUS: ACTIVE'}
                      </div>
                  </div>
                  <Link to={`/events/${e.id || e._id}`} className="btn" style={{ padding: '0.5rem', borderColor: 'rgba(255,255,255,0.1)' }}>
                      <Edit size={16} />
                  </Link>
                </div>
              ))}
              {myEvents.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', border: '1px dashed rgba(255,255,255,0.05)' }}>
                  NO_INITIALIZED_EXPERIENCES_FOUND
                </div>
              )}
            </div>
          </div>
          
          <div className="tactical-card" style={{ background: 'var(--bg-tertiary)', borderLeft: '4px solid var(--accent-nuclear)' }}>
              <div className="card-content">
                  <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-nuclear)', marginBottom: '0.5rem' }}>// NETWORK_STATUS</div>
                  <div style={{ fontSize: '0.8rem', color: 'white' }}>Node: GLOBAL_S04</div>
                  <div style={{ fontSize: '0.8rem', color: 'white' }}>Encryption: ACTIVE_SECURE</div>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}
