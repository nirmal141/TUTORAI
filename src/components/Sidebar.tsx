import React from 'react';
import { Menu, BookOpen, Users, Settings, Database, Wifi, WifiOff } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { icon: BookOpen, label: 'Courses', href: '/courses' },
    { icon: Users, label: 'Professors', href: '/professors' },
    { icon: Database, label: 'Local Models', href: '/models' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="h-full w-64 bg-black text-white p-6 flex flex-col shadow-xl border-r border-orange-500/20">
      <Link 
        to="/" 
        className="flex items-center gap-3 mb-8 px-2 py-1 rounded-lg transition-colors hover:bg-zinc-900/50"
      >
        <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg">
          <Menu className="h-6 w-6 text-black" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
          TutorAI
        </h1>
      </Link>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                  ${location.pathname === item.href 
                    ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-400' 
                    : 'hover:bg-zinc-900/50 text-orange-200/60 hover:text-orange-200'}`}
              >
                <div className={`p-2 rounded-lg transition-colors duration-200 
                  ${location.pathname === item.href
                    ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-black'
                    : 'bg-zinc-900 text-orange-400 group-hover:bg-gradient-to-br group-hover:from-orange-500/10 group-hover:to-amber-500/10'}`}>
                  <item.icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110`} />
                </div>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-orange-500/20 pt-4 mt-4">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
          ${isOnline 
            ? 'bg-gradient-to-r from-emerald-500/10 to-green-500/10' 
            : 'bg-gradient-to-r from-orange-500/10 to-amber-500/10'}`}>
          <div className={`p-2 rounded-lg ${
            isOnline 
              ? 'bg-gradient-to-br from-emerald-500 to-green-500' 
              : 'bg-gradient-to-br from-orange-500 to-amber-500'
          }`}>
            {isOnline ? (
              <Wifi className="h-5 w-5 text-black" />
            ) : (
              <WifiOff className="h-5 w-5 text-black" />
            )}
          </div>
          <span className={`text-sm font-medium ${
            isOnline ? 'text-emerald-400' : 'text-orange-400'
          }`}>
            {isOnline ? 'Online Mode' : 'Offline Mode'}
          </span>
        </div>
      </div>
    </div>
  );
}
