import { useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { User, GraduationCap, Book, Users, Settings, FileText, Cpu, Building, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  
  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'institution_admin';
  const isInstitutionAdmin = user?.role === 'institution_admin';
  
  const navigation = [
    { 
      name: t('nav.dashboard'), 
      href: '/dashboard', 
      icon: User, 
      current: location.pathname === '/dashboard' 
    },
    { 
      name: t('nav.professor_dashboard'), 
      href: '/professor-dashboard', 
      icon: GraduationCap, 
      current: location.pathname === '/professor-dashboard',
      show: isTeacherOrAdmin
    },
    { 
      name: t('nav.courses'), 
      href: '/courses', 
      icon: Book, 
      current: location.pathname === '/courses' 
    },
    { 
      name: t('nav.professors'), 
      href: '/professors', 
      icon: Users, 
      current: location.pathname === '/professors' 
    },
    { 
      name: t('nav.resources'), 
      href: '/resources', 
      icon: FileText, 
      current: location.pathname === '/resources' 
    },
    { 
      name: t('nav.models'), 
      href: '/models', 
      icon: Cpu, 
      current: location.pathname === '/models' 
    },
    { 
      name: t('nav.institutions'), 
      href: '/institutions', 
      icon: Building, 
      current: location.pathname === '/institutions',
      show: isInstitutionAdmin
    },
    { 
      name: t('nav.settings'), 
      href: '/settings', 
      icon: Settings, 
      current: location.pathname === '/settings' 
    },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className={cn(
        "relative h-screen bg-white/80 dark:bg-zinc-900/80 border-r border-zinc-200/50 dark:border-zinc-700/50 backdrop-blur-sm",
        "flex flex-col py-4 transition-all duration-300 ease-in-out"
      )}
    >
      {/* Collapse Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-4 top-8 p-1.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg z-50"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </motion.button>

      {/* Logo */}
      <div className={cn(
        "flex items-center px-6 mb-8",
        collapsed ? "justify-center" : "justify-start"
      )}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center"
        >
          <GraduationCap className="h-8 w-8 text-zinc-900 dark:text-white" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3"
              >
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                  TutorAI
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          if (item.show === false) return null;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => cn(
                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                "hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 backdrop-blur-sm",
                isActive
                  ? "bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-white"
                  : "text-zinc-500 dark:text-zinc-400"
              )}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "p-2 rounded-md",
                  item.current
                    ? "bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-600 dark:to-zinc-500"
                    : "bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-700 dark:to-zinc-600"
                )}
              >
                <Icon className="h-5 w-5" />
              </motion.div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        "mt-auto px-3",
        collapsed ? "flex justify-center" : ""
      )}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <ThemeToggle />
        </motion.div>
      </div>
    </motion.div>
  );
}
