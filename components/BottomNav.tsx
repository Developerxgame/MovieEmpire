import React, { useContext } from 'react';
import { Home, Building2, Medal, ShoppingCart, Info, Settings } from 'lucide-react';
import { GameContext } from '../context/GameContext';

interface BottomNavProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; isDisabled?: boolean }> = ({ icon, label, isActive, onClick, isDisabled }) => {
  const activeClasses = 'text-amber-400';
  const inactiveClasses = 'text-zinc-400 hover:text-white';
  const disabledClasses = 'text-zinc-600 cursor-not-allowed';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transform transition-all duration-200 ease-in-out hover:scale-110 active:scale-100 ${isDisabled ? disabledClasses : (isActive ? activeClasses : inactiveClasses)}`}
    >
      {icon}
      <span className="text-xs mt-1 font-medium">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  const { gameState } = useContext(GameContext);
  const isMovieInProduction = !!gameState.currentMovieInProduction;

  const navItems = [
    { id: 'Home', icon: <Home size={24} />, label: 'Home' },
    { id: 'Studio', icon: <Building2 size={24} />, label: 'Studio' },
    { id: 'Events', icon: <Info size={24} />, label: 'Events', disabled: true },
    { id: 'Awards', icon: <Medal size={24} />, label: 'Awards', disabled: true },
    { id: 'Settings', icon: <Settings size={24} />, label: 'Settings', disabled: true },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-black/50 backdrop-blur-lg border-t border-white/10">
      <div className="flex justify-around h-20">
        {navItems.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeScreen === item.id}
            onClick={() => setActiveScreen(item.id)}
            isDisabled={item.disabled || (isMovieInProduction && !['Home', 'Studio'].includes(item.id))}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;