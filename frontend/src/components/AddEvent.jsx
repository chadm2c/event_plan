import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useNotification } from '../context/NotificationContext';

export default function AddEvent() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    voting_options: ''
  });
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const optionsArray = formData.voting_options.split(',').map(s => s.trim()).filter(s => s);
      
      let parsedDate;
      try {
          parsedDate = new Date(formData.date).toISOString();
      } catch(e) {
          addToast("Error", "Invalid temporal coordinates.");
          return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        date: parsedDate,
        location: formData.location,
        voting_options: optionsArray
      };
      
      const res = await api.post('/events/', payload);
      const newId = String(res.data.id || res.data._id || '');
      addToast('Success', `Experience Initialized: ${formData.title.toUpperCase()}`);
      
      if (newId) {
          navigate(`/events/${newId}`);
      } else {
          navigate('/');
      }
    } catch (err) {
      console.error(err);
      addToast("Error", "System initialization failure.");
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '4rem auto' }}>
      <div className="tactical-card">
        <div className="card-header">
           <div style={{ fontSize: '0.65rem', color: 'var(--accent-nuclear)', marginBottom: '0.2rem', fontFamily: 'var(--font-mono)' }}>
            // PROTOCOL_INIT_S04
          </div>
          <h2 style={{ textTransform: 'uppercase', margin: 0, letterSpacing: '-0.02em', fontSize: '2rem' }}>
            INITIALIZE_NEW_EXPERIENCE
          </h2>
        </div>
        
        <div className="card-content">
          <form onSubmit={handleSubmit}>
            <label className="label">DESIGNATION (TITLE)</label>
            <input 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              required 
              placeholder="ENTER_DESIGNATION..."
            />
            
            <label className="label">DOSSIER_SUMMARY (DESCRIPTION)</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              required 
              placeholder="ENTER_OBJECTIVES..."
              style={{ minHeight: '120px' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
              <div>
                <label className="label">TEMPORAL_MARK (DATE_TIME)</label>
                <input 
                  type="datetime-local"
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  required 
                  style={{ marginBottom: 0 }}
                />
              </div>
              <div>
                <label className="label">GEOGRAPHIC_NODE (LOCATION)</label>
                <input 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                  required 
                  placeholder="ENTER_COORDINATES..."
                  style={{ marginBottom: 0 }}
                />
              </div>
            </div>

            <label className="label">POLLING_MODULE_ARRAYS (COMMA_SEPARATED)</label>
            <input 
              value={formData.voting_options} 
              onChange={e => setFormData({...formData, voting_options: e.target.value})} 
              placeholder="e.g. ALPHA_VOTER, BETA_OPTION, GAMMA_NODE"
            />
            
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <button type="submit" className="btn primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                EXECUTE_INITIALIZATION
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
