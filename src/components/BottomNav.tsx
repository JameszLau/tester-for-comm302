import React from 'react';
import { useMarket } from '../context/MarketContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, watchlistIds } = useMarket();

  const navItems = [
    {
      id: 'markets' as const,
      label: 'Markets',
      icon: 'trending_up',
    },
    {
      id: 'watchlist' as const,
      label: 'Watchlist',
      icon: 'format_list_bulleted',
      badge: watchlistIds.length > 0 ? watchlistIds.length : undefined
    },
    {
      id: 'charts' as const,
      label: 'Charts',
      icon: 'candlestick_chart'
    },
    {
      id: 'ideas' as const,
      label: 'Ideas',
      icon: 'lightbulb'
    },
    {
      id: 'menu' as const,
      label: 'Menu',
      icon: 'menu'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-white/95 backdrop-blur-xl border-t border-[#E0E3EB] shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors relative py-1 ${
                isActive
                  ? 'text-[#2962ff] font-semibold'
                  : 'text-[#787B86] hover:text-[#131722]'
              }`}
            >
              <div className="relative">
                <span
                  className={`material-symbols-outlined text-[22px] transition-transform ${
                    isActive ? 'scale-110' : ''
                  }`}
                >
                  {item.icon}
                </span>
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-[#2962ff] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-semibold text-[#2962ff]' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
