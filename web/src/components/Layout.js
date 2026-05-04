import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  FileText, 
  ClipboardList, 
  User, 
  LogOut, 
  Menu,
  X,
  Settings,
  BarChart3,
  Plus,
  MessageCircle
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isFaculty = user?.role === 'faculty' || user?.role === 'teacher' || user?.role === 'admin';

  const navigation = [
    {
      name: 'Dashboard',
      href: isFaculty ? '/faculty/dashboard' : '/dashboard',
      icon: Home,
      current: location.pathname === (isFaculty ? '/faculty/dashboard' : '/dashboard'),
    },
    ...(isFaculty ? [
      {
        name: 'Feed',
        href: '/faculty/feed',
        icon: MessageCircle,
        current: location.pathname === '/faculty/feed',
      },
      {
        name: 'Survey Management',
        href: '/faculty/surveys',
        icon: ClipboardList,
        current: location.pathname.startsWith('/faculty/surveys'),
      },
    ] : [
      {
        name: 'My Responses',
        href: '/my-responses',
        icon: FileText,
        current: location.pathname.startsWith('/my-responses'),
      },
    ]),
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      current: location.pathname === '/profile',
    },
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-slate-800 border-r border-slate-700">
      <div className="flex items-center h-16 px-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">Voxa</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                item.current
                  ? 'bg-blue-500/20 text-blue-400 border-r-2 border-blue-500'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-slate-400 truncate capitalize">
              {user?.role?.toLowerCase()}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-slate-400 rounded-md hover:bg-slate-700 hover:text-slate-200 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-slate-800 shadow-sm border-b border-slate-700 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-slate-300 focus:outline-none focus:text-slate-300"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-white">Voxa</h1>
            <div className="w-6" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-slate-900">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
