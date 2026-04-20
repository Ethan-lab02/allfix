import { useState, useEffect, useRef } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import CustomersView from './components/CustomersView';
import OrdersView from './components/OrdersView';
import AboutView from './components/AboutView';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [themeButtonPosition, setThemeButtonPosition] = useState(() => {
    const savedPosition = localStorage.getItem('themeButtonPosition');
    if (savedPosition) return JSON.parse(savedPosition);

    return { x: 20, y: 10 };
  });
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('themeButtonPosition', JSON.stringify(themeButtonPosition));
  }, [themeButtonPosition]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const clampPosition = (x, y) => {
    const buttonSize = 40;
    const padding = 10;
    const maxX = Math.max(padding, window.innerWidth - buttonSize - padding);
    const maxY = Math.max(padding, window.innerHeight - buttonSize - padding);

    return {
      x: Math.min(Math.max(x, padding), maxX),
      y: Math.min(Math.max(y, padding), maxY)
    };
  };

  const handleThemeButtonPointerDown = (event) => {
    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: themeButtonPosition.x,
      originY: themeButtonPosition.y,
      moved: false
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleThemeButtonPointerMove = (event) => {
    if (!dragStateRef.current.isDragging) return;

    const deltaX = event.clientX - dragStateRef.current.startX;
    const deltaY = event.clientY - dragStateRef.current.startY;
    const hasMovedEnough = Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4;

    if (hasMovedEnough) {
      dragStateRef.current.moved = true;
    }

    const nextPosition = clampPosition(
      dragStateRef.current.originX + deltaX,
      dragStateRef.current.originY + deltaY
    );

    setThemeButtonPosition(nextPosition);
  };

  const handleThemeButtonPointerUp = () => {
    dragStateRef.current.isDragging = false;
  };

  const handleThemeButtonClick = () => {
    if (dragStateRef.current.moved) {
      dragStateRef.current.moved = false;
      return;
    }

    toggleTheme();
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed',
        top: `${themeButtonPosition.y}px`,
        left: `${themeButtonPosition.x}px`,
        zIndex: 1000
      }}>
        <button 
          onClick={handleThemeButtonClick}
          onPointerDown={handleThemeButtonPointerDown}
          onPointerMove={handleThemeButtonPointerMove}
          onPointerUp={handleThemeButtonPointerUp}
          className="glass-card"
          title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          style={{
            width: '40px',
            height: '40px',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            fontSize: '18px',
            color: 'var(--text-primary)',
            cursor: dragStateRef.current.isDragging ? 'grabbing' : 'grab',
            userSelect: 'none',
            touchAction: 'none'
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      {!user ? (
        <Login onLogin={setUser} />
      ) : (
        <div style={{ display: 'flex' }}>
          <Sidebar 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            onLogout={handleLogout} 
            user={user}
          />
          
          <main style={{ 
            marginLeft: '300px', 
            padding: '40px', 
            width: 'calc(100% - 300px)',
            minHeight: '100vh'
          }}>
            {activeTab === 'dashboard' && <DashboardView token={user?.token} />}
            {activeTab === 'customers' && <CustomersView token={user?.token} />}
            {activeTab === 'orders' && <OrdersView token={user?.token} />}
            {activeTab === 'about' && <AboutView />}
           
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
