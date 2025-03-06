import React from 'react';
import { Menu, BookOpen, Users, Settings, Database, Wifi, WifiOff, FolderOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function Sidebar() {
  const location = useLocation();
  
  const menuItems = [
    { icon: BookOpen, label: 'Courses', href: '/courses' },
    { icon: Users, label: 'Professors', href: '/professors' },
    { icon: FolderOpen, label: 'Teaching Resources', href: '/resources' },
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

  // Animation variants
  const sidebarVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="h-full w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col"
    >
      {/* Logo and title */}
      <motion.div variants={itemVariants} className="px-5 py-6">
        <Link 
          to="/" 
          className="flex items-center gap-3 group"
        >
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors duration-200">
            <Menu className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
          </div>
          <h1 className="text-xl font-medium text-zinc-900 dark:text-white">
            TutorAI
          </h1>
        </Link>
      </motion.div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <motion.div variants={itemVariants} className="mb-2 px-2">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Main
          </p>
        </motion.div>
        <motion.ul className="space-y-1" variants={itemVariants}>
          {menuItems.map((item, index) => (
            <motion.li 
              key={item.label}
              variants={itemVariants}
            >
              <Link
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                  location.pathname === item.href 
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <item.icon className={`h-4.5 w-4.5 ${
                  location.pathname === item.href 
                    ? 'text-zinc-900 dark:text-white' 
                    : 'text-zinc-500 dark:text-zinc-400'
                }`} />
                <span>{item.label}</span>
                {location.pathname === item.href && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute left-0 w-1 h-5 bg-zinc-900 dark:bg-white rounded-full"
                  />
                )}
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </nav>

      {/* Online/Offline status */}
      <motion.div 
        variants={itemVariants}
        className="p-4 border-t border-zinc-200 dark:border-zinc-800"
      >
        <div className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
          isOnline 
            ? 'bg-emerald-50 dark:bg-emerald-900/10' 
            : 'bg-amber-50 dark:bg-amber-900/10'
        }`}>
          <div className={`p-1.5 rounded-md ${
            isOnline 
              ? 'bg-emerald-100 dark:bg-emerald-900/20' 
              : 'bg-amber-100 dark:bg-amber-900/20'
          }`}>
            {isOnline ? (
              <Wifi className={`h-4 w-4 ${
                isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`} />
            ) : (
              <WifiOff className={`h-4 w-4 ${
                isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`} />
            )}
          </div>
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${
              isOnline ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
            }`}>
              {isOnline ? 'Online Mode' : 'Offline Mode'}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {isOnline ? 'Connected to cloud' : 'Using local models'}
            </span>
          </div>
        </div>
        
        {/* Theme Toggle */}
        <div className="mt-4 flex items-center justify-between px-3">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">Appearance</span>
          <ThemeToggle />

        </div>
      </motion.div>
    </motion.div>
  );
}
