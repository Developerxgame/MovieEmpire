import React, { useState, useContext } from 'react';
import { GameContext, GamePhase } from './context/GameContext';
import SplashScreen from './screens/SplashScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import CreationScreen from './screens/CreationScreen';
import HomeScreen from './screens/HomeScreen';
import StudioScreen from './screens/StudioScreen';
import BottomNav from './components/BottomNav';

const App: React.FC = () => {
  const { gameState } = useContext(GameContext);
  const [activeScreen, setActiveScreen] = useState('Home');

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'Home':
        return <HomeScreen setActiveScreen={setActiveScreen} />;
      case 'Studio':
        return <StudioScreen />;
      default:
        return <HomeScreen setActiveScreen={setActiveScreen} />;
    }
  };

  const renderContent = () => {
    switch (gameState.phase) {
      case GamePhase.SPLASH:
        return <SplashScreen />;
      case GamePhase.MAIN_MENU:
        return <MainMenuScreen />;
      case GamePhase.CREATION:
        return <CreationScreen />;
      case GamePhase.IN_GAME:
        return (
          <div className="flex flex-col h-screen bg-zinc-900 text-white">
            <main className="flex-grow overflow-y-auto pb-24 pt-4">
              {renderActiveScreen()}
            </main>
            <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
          </div>
        );
      default:
        return <SplashScreen />;
    }
  };

  return (
    <div className="w-full h-full max-w-md mx-auto bg-black">
      {renderContent()}
    </div>
  );
};

export default App;