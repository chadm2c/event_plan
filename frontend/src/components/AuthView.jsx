import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useNotification } from '../context/NotificationContext';

export default function AuthView() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const params = new URLSearchParams();
        params.append('username', formData.username);
        params.append('password', formData.password);
        const res = await api.post('/auth/login', params);
        localStorage.setItem('token', res.data.access_token);
        addToast('Success', `Identity Verified: ${formData.username.toUpperCase()}`);
        navigate('/');
      } else {
        await api.post('/auth/register', formData);
        setIsLogin(true);
        addToast('Success', 'Registry Entry Created. Proceed to login.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'AUTHENTICATION_FAILURE');
      addToast('Error', 'Security Breach or Invalid Credentials', true);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '6rem auto' }}>
      <div className="tactical-card">
        <div className="card-header">
          <div style={{ fontSize: '0.65rem', color: 'var(--accent-nuclear)', marginBottom: '0.2rem', fontFamily: 'var(--font-mono)' }}>
            // SECURITY.MODULE.V4
          </div>
          <h2 style={{ textTransform: 'uppercase', margin: 0, letterSpacing: '-0.02em', fontSize: '1.8rem' }}>
            {isLogin ? 'IDENTITY_VERIFICATION' : 'NEW_UNIT_REGISTRY'}
          </h2>
        </div>
        
        <div className="card-content">
          {error && <div style={{ color: 'var(--accent-danger)', marginBottom: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>[ERROR]: {error}</div>}
          
          <form onSubmit={handleSubmit}>
            <label className="label">UNIT_ID</label>
            <input 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})} 
              required 
              placeholder="ENTER_USERNAME..."
            />
            
            {!isLogin && (
              <>
                <label className="label">COMM_CHANNEL (EMAIL)</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  required={!isLogin} 
                  placeholder="ENTER_EMAIL..."
                />
              </>
            )}
            
            <label className="label">ACCESS_KEY</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              required 
              placeholder="ENTER_PASSWORD..."
            />
            
            <button type="submit" className="btn primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
              {isLogin ? 'INITIALIZE_SESSION' : 'EXECUTE_REGISTRY'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '2.5rem', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              {isLogin ? "UNAUTHORIZED_ACCESS? " : "ALREADY_REGISTERED? "}
            </span>
            <span 
              style={{ color: 'var(--accent-nuclear)', cursor: 'pointer', fontWeight: 'bold' }} 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
            >
              {isLogin ? 'REGISTER_NEW_UNIT' : 'RETURN_TO_LOGIN'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
