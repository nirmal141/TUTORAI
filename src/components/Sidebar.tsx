import { useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { User, GraduationCap, Book, Users, Settings, FileText, Cpu, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';

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
      href: '/', 
      icon: User, 
      current: location.pathname === '/' 
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
    <div
      className={cn(
        "h-screen border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className={cn("flex items-center", collapsed && "justify-center w-full")}>
            <span className={cn("text-xl font-semibold text-zinc-900 dark:text-white", collapsed && "hidden")}>
              TutorAI
            </span>
            <span className={cn("text-xl font-semibold text-zinc-900 dark:text-white hidden", collapsed && "block")}>
              T
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCollapsed(!collapsed)}
            className={cn("text-zinc-500 dark:text-zinc-400", collapsed && "hidden")}
          >
            <svg 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7" 
              />
            </svg>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setCollapsed(!collapsed)}
            className={cn("text-zinc-500 dark:text-zinc-400 hidden", collapsed && "block")}
          >
            <svg 
              className="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 5l7 7-7 7M5 5l7 7-7 7" 
              />
            </svg>
          </Button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.filter(item => item.show !== false).map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => cn(
                isActive
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150',
                collapsed && 'justify-center'
              )}
            >
              <item.icon
                className={cn(
                  'flex-shrink-0 h-5 w-5 mr-3',
                  collapsed && 'mr-0'
                )}
                aria-hidden="true"
              />
              <span className={cn('truncate', collapsed && 'hidden')}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer with theme toggle */}
      <div className={cn(
        "p-3 border-t border-zinc-200 dark:border-zinc-800",
        collapsed ? "flex justify-center" : "flex items-center justify-between"
      )}>
        {!collapsed && <span className="text-xs text-zinc-500 dark:text-zinc-400">Theme</span>}
        <ThemeToggle />
      </div>
    </div>
  );
}
