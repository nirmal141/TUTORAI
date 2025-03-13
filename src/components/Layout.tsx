import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import { User, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header with user menu */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">TutorAI</h1>
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg px-3 py-2 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                <User className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                  {user?.role || 'Guest'}
                </p>
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${
                  isMenuOpen ? 'transform rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown menu */}
            {isMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-zinc-800 ring-1 ring-black ring-opacity-5 py-1 z-50"
                role="menu"
              >
                <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-700">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Signed in as {user?.role || 'Guest'}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-zinc-50 dark:bg-zinc-900">
          {children}
        </main>
      </div>
    </div>
  );
} 