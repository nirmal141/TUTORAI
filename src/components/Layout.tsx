import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import { User, ChevronDown } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  // Mock user information
  const mockProfile = {
    full_name: 'Demo User',
    role: 'student' as const
  };
  
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
                  {mockProfile.full_name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                  {mockProfile.role}
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
                    {mockProfile.full_name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Signed in as {mockProfile.role}
                  </p>
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