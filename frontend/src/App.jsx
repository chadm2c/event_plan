import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Zap, LogOut, PlusCircle, User as UserIcon, Shield, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from './api';
import AuthView from './components/AuthView';
import EventList from './components/EventList';
import EventDetail from './components/EventDetail';
import AddEvent from './components/AddEvent';
import ProfileView from './components/ProfileView';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      api.get('/auth/me').then(res => setUser(res.data)).catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      });
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          <Zap size={28} color="var(--accent-nuclear)" fill="var(--accent-nuclear)" />
          <span className="title-gradient">EVENT.PLAN</span>
          <span className="logo-tag">V.04</span>
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {user ? (
            <>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>USR//</span><strong>{user.username.toUpperCase()}</strong>
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn" title="Admin Dashboard">
                  <Shield size={18} />
                </Link>
              )}
              <Link to="/create-event" className="btn primary" style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                <PlusCircle size={18} /> CREATE
              </Link>
              <button className="btn" onClick={handleLogout} style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                <LogOut size={18} /> EXIT
              </button>
            </>
          ) : (
            <Link to="/login" className="btn primary">AUTHENTICATE</Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<AuthView />} />
        <Route path="/" element={<EventList />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/create-event" element={<AddEvent />} />
        <Route path="/profile" element={<ProfileView />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
