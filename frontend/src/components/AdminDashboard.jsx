import { useState, useEffect } from 'react';
import { Shield, UserMinus, UserCheck, Lock, Unlock, Trash2, Activity, Database } from 'lucide-react';
import api from '../api';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [usersRes, eventsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/events')
      ]);
      setUsers(usersRes.data);
      setEvents(eventsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleBlock = async (userId, isBlocked) => {
    try {
      const endpoint = isBlocked ? `/admin/users/${userId}/unblock` : `/admin/users/${userId}/block`;
      await api.put(endpoint);
      fetchData();
    } catch (err) {
      alert('ACTION_FAILURE');
    }
  };

  const closeEvent = async (eventId) => {
    if (!window.confirm('FORCE_CLOSE_SESSION? THIS WILL TERMINATE ALL LIVE VOTING.')) return;
    try {
      await api.put(`/admin/events/${eventId}/close`);
      fetchData();
    } catch (err) {
      alert('ACTION_FAILURE');
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm('PERMANENTLY_ERASE_EXPERIENCE_RECORD?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      fetchData();
    } catch (err) {
      alert('ACTION_FAILURE');
    }
  };

  if (loading) return <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--accent-nuclear)', fontFamily: 'var(--font-mono)' }}>// ACCESSING_SECURE_ADMIN_CORE...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      <header style={{ borderLeft: '4px solid var(--accent-nuclear)', paddingLeft: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-nuclear)', marginBottom: '1rem', letterSpacing: '0.2em' }}>
            // ADMINISTRATIVE.CONTROL.NODE
          </div>
          <h1 style={{ fontSize: '4.5rem', lineHeight: '0.9', marginBottom: '1.5rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '-0.05em' }}>
            SYSTEM: <span style={{ color: 'var(--text-muted)' }}>OVERRIDE</span>
          </h1>
        </div>
        <Shield size={60} color="var(--accent-nuclear)" style={{ opacity: 0.2 }} />
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* User Registry Management */}
        <section className="tactical-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ textTransform: 'uppercase', fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Database size={20} color="var(--accent-nuclear)" /> USER_REGISTRY
            </h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>UNITS: {users.length}</div>
          </div>
          <div className="card-content" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem' }}>UNIT_DESIGNATION</th>
                  <th style={{ padding: '1rem' }}>CLEARANCE</th>
                  <th style={{ padding: '1rem' }}>STATE</th>
                  <th style={{ padding: '1rem' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id || u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1.25rem 1rem' }}>
                        <div style={{ color: 'white', fontWeight: 700 }}>{u.username.toUpperCase()}</div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>{u.email.toUpperCase()}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{u.role.toUpperCase()}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ color: u.is_blocked ? 'var(--accent-danger)' : 'var(--accent-nuclear)', fontWeight: 700 }}>
                        {u.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button 
                        className="btn" 
                        style={{ padding: '0.5rem', borderColor: u.is_blocked ? 'var(--accent-nuclear)' : 'var(--accent-danger)' }}
                        onClick={() => toggleBlock(u.id || u._id, u.is_blocked)}
                      >
                        {u.is_blocked ? <UserCheck size={18} color="var(--accent-nuclear)" /> : <UserMinus size={18} color="var(--accent-danger)" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Global Experiences Management */}
        <section className="tactical-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ textTransform: 'uppercase', fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Activity size={20} color="var(--accent-nuclear)" /> EXPERIENCE_CORE
            </h2>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>RECORDS: {events.length}</div>
          </div>
          <div className="card-content" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem' }}>RECORD_ID</th>
                  <th style={{ padding: '1rem' }}>STATUS</th>
                  <th style={{ padding: '1rem' }}>COMMANDS</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id || e._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '1.25rem 1rem' }}>
                        <div style={{ color: 'white', fontWeight: 700 }}>{e.title.toUpperCase()}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ color: e.is_closed ? 'var(--accent-danger)' : 'var(--accent-info)', fontWeight: 700 }}>
                        {e.is_closed ? 'TERMINATED' : 'LIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                      {!e.is_closed && (
                        <button className="btn" style={{ padding: '0.5rem' }} onClick={() => closeEvent(e.id || e._id)}>
                          <Lock size={18} />
                        </button>
                      )}
                      <button className="btn danger" style={{ padding: '0.5rem' }} onClick={() => deleteEvent(e.id || e._id)}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
