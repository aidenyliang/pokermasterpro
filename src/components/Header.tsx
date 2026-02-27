import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  UserIcon, 
  ChipIcon, 
  SettingsIcon, 
  LogoutIcon,
  MenuIcon,
  CloseIcon,
  CrownIcon,
  StatsIcon
} from '@/components/ui/custom/PokerIcons';
import { useGameStore } from '@/stores/gameStore';
import { signOut } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface HeaderProps {
  currentView: 'lobby' | 'game' | 'dashboard' | 'settings';
  onNavigate: (view: 'lobby' | 'game' | 'dashboard' | 'settings') => void;
}

export const Header = ({ currentView, onNavigate }: HeaderProps) => {
  const { username, avatarUrl, playerStats, isAuthenticated, clearAuth } = useGameStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await signOut();
    clearAuth();
  };
  
  const navItems = [
    { id: 'lobby' as const, label: 'Lobby', icon: <ChipIcon className="w-4 h-4" /> },
    { id: 'dashboard' as const, label: 'Stats', icon: <StatsIcon className="w-4 h-4" /> },
    { id: 'settings' as const, label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];
  
  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('lobby')}
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <CrownIcon className="w-6 h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-white">PokerMaster</h1>
              <p className="text-xs text-gray-400 -mt-1">Pro</p>
            </div>
          </motion.div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  currentView === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                )}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
          
          {/* User Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Chips Display */}
                {playerStats && (
                  <div className="hidden sm:flex items-center gap-2 bg-gray-800 px-3 py-1.5 rounded-lg">
                    <ChipIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-mono font-semibold">
                      ${playerStats.netProfit.toLocaleString()}
                    </span>
                  </div>
                )}
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 hover:bg-gray-800 rounded-lg p-2 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            alt={username || ''}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          username?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="hidden sm:block text-white font-medium">
                        {username}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-700">
                    <DropdownMenuItem 
                      onClick={() => onNavigate('dashboard')}
                      className="text-gray-300 focus:text-white focus:bg-gray-800"
                    >
                      <UserIcon className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onNavigate('settings')}
                      className="text-gray-300 focus:text-white focus:bg-gray-800"
                    >
                      <SettingsIcon className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-red-400 focus:text-red-400 focus:bg-gray-800"
                    >
                      <LogoutIcon className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                onClick={() => onNavigate('lobby')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sign In
              </Button>
            )}
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <CloseIcon className="w-6 h-6" />
              ) : (
                <MenuIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gray-800 overflow-hidden"
          >
            <nav className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors',
                    currentView === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  )}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
