import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Users, LogIn, LogOut, Edit, Trash2, Shield, Activity, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import api from '../api';
import ChatPanel from './ChatPanel';
import VotingPanel from './VotingPanel';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useNotification();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const loadData = async () => {
    try {
      const [eventRes, participantsRes, userRes] = await Promise.allSettled([
        api.get(`/events/${id}`),
        api.get(`/events/${id}/participants`),
        api.get('/auth/me')
      ]);

      if (eventRes.status === 'fulfilled') {
        setEvent(eventRes.value.data);
      } else {
          console.error("Event load failed", eventRes.reason);
          addToast("Error", "Failed to load event data.");
      }

      if (participantsRes.status === 'fulfilled') {
        setParticipants(Array.isArray(participantsRes.value.data) ? participantsRes.value.data : []);
      } else {
          console.error("Participants load failed", participantsRes.reason);
          setParticipants([]);
      }

      if (userRes.status === 'fulfilled') {
        setCurrentUser(userRes.value.data);
      }
    } catch (err) {
      console.error("Critical component error", err);
    }
  };

  useEffect(() => {
    if (id && id !== "[object Object]" && id !== "undefined") {
        loadData();
    } else {
        addToast("Error", "Invalid event coordinates. Returning home...");
        setTimeout(() => navigate('/'), 2000);
    }

    const wsUrl = `ws://127.0.0.1:8000/votes/ws/${id}`;
    let socket;
    try {
        socket = new WebSocket(wsUrl);
        socket.onmessage = (msg) => {
            const payload = JSON.parse(msg.data);
            if (payload.type === 'vote_update') {
              addToast('Live Update', 'New coordinates received (Vote registered!)');
              setEvent(prev => prev ? { ...prev, voting_options: payload.voting_options } : prev);
            }
        };
    } catch(e) {
        console.error("WS error", e);
    }

    return () => socket?.close();
  }, [id, addToast, navigate]);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', location: '', date: '', voting_options: '' });

  const startEditing = () => {
    try {
        let dateVal = '';
        if (event?.date) {
            try {
                dateVal = new Date(event.date).toISOString().slice(0, 16);
            } catch (e) {
                console.error("Date parse error", e);
            }
        }

        setEditForm({ 
            title: event?.title || '', 
            description: event?.description || '', 
            location: event?.location || '',
            date: dateVal,
            voting_options: event?.voting_options ? event.voting_options.map(o => o.text).join(', ') : ''
        });
        setIsEditing(true);
    } catch (err) {
        console.error("Failed to enter edit mode", err);
        addToast("Error", "Interface subsystem failure. Resetting...");
    }
  };

  const saveEdit = async () => {
    try {
        const payload = {
            ...editForm,
            voting_options: editForm.voting_options.split(',').map(s => s.trim()).filter(s => s)
        };
        await api.put(`/events/${id}`, payload);
        setIsEditing(false);
        addToast("Success", "Experience parameters updated.");
        loadData();
    } catch (err) {
        addToast("Error", "Update failed across the network.");
    }
  };

  const toggleStatus = async () => {
      try {
          await api.put(`/events/${id}`, { is_closed: !event.is_closed });
          addToast("Status Updated", `Experience is now ${!event.is_closed ? 'CLOSED' : 'OPEN'}`);
          loadData();
      } catch (err) {
          addToast("Error", "Failed to shift status.");
      }
  }

  const toggleJoin = async () => {
    const userIdStr = String(currentUser?.id || currentUser?._id || '');
    const isParticipant = event?.participants?.map(String).includes(userIdStr);
    const endpoint = isParticipant ? `/events/${id}/leave` : `/events/${id}/join`;
    await api.post(endpoint);
    loadData();
  };

  const deleteEvent = async () => {
    if (!window.confirm('Erase this event from existence?')) return;
    await api.delete(`/events/${id}`);
    navigate('/');
  };

  if (!event) return <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--accent-nuclear)', fontFamily: 'var(--font-mono)' }}>// AUTHENTICATING_WITH_DATA_CORE...</div>;

  const currentUserIdStr = String(currentUser?.id || currentUser?._id || '');
  const isOrganizer = currentUser && (String(event.organizer_id) === currentUserIdStr);
  const isParticipant = currentUser && event.participants?.map(String).includes(currentUserIdStr);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <header style={{ borderLeft: '4px solid var(--accent-nuclear)', paddingLeft: '2rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: isOrganizer ? 'var(--accent-nuclear)' : 'var(--text-muted)', marginBottom: '0.5rem' }}>
          {isOrganizer ? '// AUTH_LEVEL: ORGANIZER' : '// AUTH_LEVEL: VISITOR'}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ flex: 1 }}>
              {isEditing ? (
                  <input 
                      value={editForm.title} 
                      onChange={e => setEditForm({...editForm, title: e.target.value})}
                      style={{ fontSize: '3rem', fontWeight: 'bold', width: '100%', marginBottom: '1rem', textTransform: 'uppercase' }}
                  />
              ) : (
                  <h1 style={{ fontSize: '4.5rem', lineHeight: 0.9, textTransform: 'uppercase', letterSpacing: '-0.05em', margin: 0 }}>{event.title}</h1>
              )}
              {event.is_closed && (
                <div style={{ marginTop: '1rem', display: 'inline-block', background: 'var(--accent-danger)', color: 'white', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  TERMINATED_BY_ADMIN
                </div>
              )}
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isOrganizer && (
              <>
                {isEditing ? (
                    <button className="btn primary" onClick={saveEdit}>CONFIRM_CHANGES</button>
                ) : (
                    <button className="btn" onClick={startEditing} title="Edit Parameters">
                      <Edit size={18} />
                    </button>
                )}
                <button className="btn danger" onClick={deleteEvent} title="Decommission Event">
                  <Trash2 size={18} />
                </button>
                <button 
                  className="btn" 
                  onClick={toggleStatus} 
                  title={event.is_closed ? "Reactivate Session" : "Terminate Session"}
                  style={{ borderColor: event.is_closed ? 'var(--accent-nuclear)' : 'var(--accent-danger)' }}
                >
                  {event.is_closed ? <Activity size={18} color="var(--accent-nuclear)" /> : <X size={18} color="var(--accent-danger)" />}
                </button>
              </>
            )}
            <button className={`btn ${!isParticipant ? 'primary' : ''}`} onClick={toggleJoin}>
              {isParticipant ? <><LogOut size={18} style={{marginRight: '0.5rem'}} /> DISCONNECT</> : <><LogIn size={18} style={{marginRight: '0.5rem'}} /> INITIALIZE</>}
            </button>
            <button className="btn" onClick={() => setChatOpen(true)}>
              <MessageSquare size={18} style={{marginRight: '0.5rem'}} /> COMMS
            </button>
          </div>
        </div>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div className="tactical-card">
              <div className="card-header" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                // EXPERIENCE_DOSSIER_RECORDS
              </div>
              <div className="card-content">
                  {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <label className="label">DESCRIPTION</label>
                          <textarea 
                              value={editForm.description} 
                              onChange={e => setEditForm({...editForm, description: e.target.value})}
                          />
                          <label className="label">GEOGRAPHIC_COORDINATES</label>
                          <input 
                              value={editForm.location} 
                              onChange={e => setEditForm({...editForm, location: e.target.value})}
                          />
                          <label className="label">TIMESTAMP_ISOTC</label>
                          <input 
                              type="datetime-local"
                              value={editForm.date} 
                              onChange={e => setEditForm({...editForm, date: e.target.value})}
                          />
                          <label className="label">POLLING_OPTIONS_ARRAY (CSV)</label>
                          <input 
                              value={editForm.voting_options} 
                              onChange={e => setEditForm({...editForm, voting_options: e.target.value})}
                          />
                      </div>
                  ) : (
                      <>
                          <p style={{ fontSize: '1.1rem', marginBottom: '3rem', color: 'rgba(255,255,255,0.9)', maxWidth: '800px' }}>{event.description}</p>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                              <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>COORDINATES</div>
                              <div>{event.location.toUpperCase()}</div>
                            </div>
                            <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                              <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>TIMESTAMP</div>
                              <div>{new Date(event.date).toLocaleString().toUpperCase()}</div>
                            </div>
                          </div>
                      </>
                  )}
              </div>
            </div>

            <VotingPanel 
                question={event.is_closed ? "Final Data Results" : "Live Preference Stream"} 
                options={event.voting_options || []} 
                onVote={async (optId) => await api.post(`/votes/${id}/vote/${optId}`)} 
                isClosed={event.is_closed}
            />
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="tactical-card">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', margin: 0, fontFamily: 'var(--font-heading)' }}>
                   CONNECTED_UNITS
                </h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-nuclear)' }}>[{participants.length}]</span>
              </div>
              <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {participants.map(p => (
                      <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                          <div style={{ width: '6px', height: '6px', background: p.id === event.organizer_id ? 'var(--accent-nuclear)' : 'rgba(255,255,255,0.2)' }}></div>
                          <span style={{ color: p.id === event.organizer_id ? 'var(--accent-nuclear)' : 'white' }}>{p.username.toUpperCase()}</span>
                          {p.id === event.organizer_id && <span style={{fontSize: '0.6rem', background: 'rgba(223, 255, 0, 0.1)', color: 'var(--accent-nuclear)', padding: '2px 4px', marginLeft: 'auto'}}>ORG</span>}
                      </div>
                  ))}
                  {participants.length === 0 && <div style={{ color: 'var(--text-dim)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', padding: '1rem' }}>// NO_UNITS_DETECTED</div>}
              </div>
            </div>
        </aside>
      </div>

      <ChatPanel eventId={id} isOpen={chatOpen} onClose={() => setChatOpen(false)} currentUser={currentUser} />
    </div>
  );
}

