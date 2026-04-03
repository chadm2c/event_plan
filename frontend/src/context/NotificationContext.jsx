import { useState, useEffect, createContext, useContext, useRef } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const socketRef = useRef(null);

  const addToast = (title, message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    let checkInterval;
    
    const connectWS = () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        if (socketRef.current && socketRef.current.readyState <= 1) return; // Already connecting or open

        const host = window.location.hostname;
        const wsUrl = `ws://${host}:8000/notifications/ws?token=${token}`;
        
        try {
            const socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'global_notification') {
                        addToast(data.title, data.message, 'info');
                    }
                } catch (err) {
                    console.error("Notification parsing error", err);
                }
            };

            socket.onclose = () => {
                socketRef.current = null;
            };

            socket.onerror = (err) => {
                console.error("Notification socket error", err);
                socket.close();
            };
        } catch (e) {
            console.error("WS connection failed", e);
        }
    };

    // Initial attempt
    connectWS();

    // Periodic check to catch log-ins/log-outs without refresh
    checkInterval = setInterval(() => {
        const token = localStorage.getItem('token');
        if (token && !socketRef.current) {
            connectWS();
        } else if (!token && socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
    }, 2000);

    return () => {
        clearInterval(checkInterval);
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type === 'error' ? 'error' : ''}`}>
            <div style={{ fontWeight: 'bold', color: t.type === 'error' ? 'var(--accent-danger)' : 'var(--accent-nuclear)', marginBottom: '0.25rem', fontSize: '0.7rem' }}>
              {t.type === 'error' ? '[ERROR_LOG]' : '[SYSTEM_NOTIFICATION]'}
            </div>
            <div style={{ fontWeight: 'bold', marginBottom: '0.2rem', fontSize: '0.9rem', textTransform: 'uppercase' }}>{t.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>{t.message}</div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
