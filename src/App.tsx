import React, { useState } from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { QuickTickerRibbon } from './components/QuickTickerRibbon';
import { SearchModal } from './components/SearchModal';
import { AssetDetailModal } from './components/AssetDetailModal';
import { CalendarModal } from './components/CalendarModal';
import { AccountModal } from './components/AccountModal';
import { ToastContainer } from './components/ToastContainer';
import { MarketsScreen } from './screens/MarketsScreen';
import { WatchlistScreen } from './screens/WatchlistScreen';
import { ChartsScreen } from './screens/ChartsScreen';
import { IdeasScreen } from './screens/IdeasScreen';
import { MenuScreen } from './screens/MenuScreen';
import { AssetCategory } from './types';

const MainLayout: React.FC = () => {
  const { activeTab } = useMarket();
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('All');

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-[#181b24] flex flex-col font-['Inter',sans-serif]">
      {/* Fixed Header */}
      <Header
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto pt-28 pb-20">
        {activeTab === 'markets' && (
          <>
            <QuickTickerRibbon />
            <MarketsScreen
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </>
        )}

        {activeTab === 'watchlist' && <WatchlistScreen />}

        {activeTab === 'charts' && <ChartsScreen />}

        {activeTab === 'ideas' && <IdeasScreen />}

        {activeTab === 'menu' && <MenuScreen />}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav />

      {/* Global Interactive Overlays */}
      <SearchModal />
      <AssetDetailModal />
      <CalendarModal />
      <AccountModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <MarketProvider>
      <MainLayout />
    </MarketProvider>
  );
}
