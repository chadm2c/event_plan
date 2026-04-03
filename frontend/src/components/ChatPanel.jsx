import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import api from '../api';
import { useNotification } from '../context/NotificationContext';

export default function ChatPanel({ eventId, isOpen, onClose, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [ws, setWs] = useState(null);
  const scrollRef = useRef(null);
  const { addToast } = useNotification();

  useEffect(() => {
    if (!isOpen) return;

    const loadChat = async () => {
      try {
        const res = await api.get(`/chat/${eventId}`);
        setMessages(res.data);
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } catch (err) {
        console.error("Chat load error", err);
      }
    };
    loadChat();

    const host = window.location.hostname;
    const socket = new WebSocket(`ws://${host}:8000/chat/ws/${eventId}`);
    
    socket.onopen = () => console.log("COMMS_LINK: ESTABLISHED");
    socket.onerror = (e) => console.error("COMMS_LINK: ERROR", e);

    socket.onmessage = (msg) => {
      try {
        const payload = JSON.parse(msg.data);
        if (payload.type === 'new_message') {
          setMessages(prev => [...prev, payload.message]);
          setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      } catch (err) {
        console.error("Failed to parse chat message", err);
      }
    };
    setWs(socket);

    return () => socket.close();
  }, [eventId, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    try {
      await api.post(`/chat/${eventId}?content=${encodeURIComponent(inputMsg)}`);
      setInputMsg('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`chat-panel ${isOpen ? 'open' : ''}`}>
      <div className="chat-header">
        <div>
          <div style={{ fontSize: '0.65rem', color: 'var(--accent-nuclear)', marginBottom: '0.2rem' }}>// COMMS.MODULE.SECURE</div>
          <h3 style={{ textTransform: 'uppercase', margin: 0, letterSpacing: '-0.02em', fontSize: '1.4rem' }}>DATA_STREAM</h3>
        </div>
        <button className="btn" style={{ padding: '0.5rem' }} onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <div className="chat-messages">
        {messages.map((m, i) => {
          const isOwn = currentUser && (m.user_id === String(currentUser.id || currentUser._id));
          return (
            <div 
              key={i} 
              className={`msg-bubble ${isOwn ? 'own' : ''}`}
            >
              <div style={{ 
                fontSize: '0.7rem', 
                color: isOwn ? 'var(--accent-nuclear)' : 'var(--text-muted)', 
                marginBottom: '0.2rem', 
                fontWeight: 'bold' 
              }}>
                {isOwn ? 'AUTHENTICATED_UNIT' : m.username.toUpperCase()}
              </div>
              <div style={{ color: 'white', wordBreak: 'break-word', fontSize: '0.85rem' }}>{m.content}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                [{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}]
              </div>
            </div>
          )
        })}
        <div ref={scrollRef}></div>
      </div>

      <form className="chat-input" onSubmit={sendMessage} style={{ gap: '0.5rem' }}>
        <input 
          style={{ marginBottom: 0, flex: 1, padding: '0.8rem' }} 
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="TRANSMIT_DATA..." 
        />
        <button type="submit" className="btn primary" style={{ padding: '0.8rem' }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
