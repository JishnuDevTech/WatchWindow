import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Settings, Home, Calendar, Users } from 'lucide-react';
import authService from '../services/authService';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(authService.getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((currentUser) => {
      setUser(currentUser);
      if (!currentUser && !['/login', '/signup'].includes(location.pathname)) {
        navigate('/login');
      }
    });

    return unsubscribe;
  }, [navigate, location]);

  if (!user) {
    return <>{children}</>;
  }

  const handleSignOut = () => {
    authService.signOut();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/schedule', icon: Calendar, label: 'Schedule' },
    { path: '/family', icon: Users, label: 'Family' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <span className="font-semibold text-slate-900">WatchWindow</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed md:sticky top-0 left-0 w-64 h-screen bg-white border-r border-slate-200 z-30 transform transition-transform duration-300 md:translate-x-0 flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo */}
          <div className="hidden md:flex items-center gap-3 px-6 py-8 border-b border-slate-200">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <div>
              <div className="font-bold text-slate-900">WatchWindow</div>
              <div className="text-xs text-slate-500">Know your window</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map(({ path, icon: Icon, label }) => (
              <button
                key={path}
                onClick={() => {
                  navigate(path);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-slate-200 p-4 space-y-3">
            <button
              onClick={() => {
                navigate('/settings');
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
            >
              <Settings size={20} />
              Settings
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 w-full">
          <div className="md:hidden mb-4" />
          {children}
        </main>
      </div>
    </div>
  );
}