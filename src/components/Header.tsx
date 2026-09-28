import React from 'react';
import { AssetCategory } from '../types';
import { useMarket } from '../context/MarketContext';

interface HeaderProps {
  selectedCategory: AssetCategory;
  onSelectCategory: (category: AssetCategory) => void;
}

const CATEGORIES: AssetCategory[] = [
  'All',
  'Indices',
  'US Stocks',
  'Crypto',
  'Futures',
  'Forex',
  'Bonds',
  'ETFs',
  'Economy'
];

export const Header: React.FC<HeaderProps> = ({ selectedCategory, onSelectCategory }) => {
  const { setIsSearchOpen, setIsAccountOpen, portfolioCash } = useMarket();

  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-white/95 backdrop-blur-xl border-b border-[#E0E3EB]/70 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="h-28 flex flex-col justify-between px-4 pt-1.5 pb-1.5 max-w-5xl mx-auto w-full">
        {/* Top search & profile row */}
        <div className="h-12 flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-1.5 shrink-0 cursor-pointer" onClick={() => onSelectCategory('All')}>
            <img
              alt="TradingView Logo"
              className="h-7 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1W6wYyFlgwJLsXGje8nX0otAbY2D8x9G0qcmRMstqHLvZF5_m39HYpYqEdd8Fe4e7E9fuWM4oY5hMgi_-l3hsQzYoZJUikEM2Q6FP-zmooeR6D9SNYPVnDL27H_ft7Ade4vmspQqTOEYslA_up1yLDj6-t0STvQ_EQT8aOjhz865BA46oq0OAw7AvFv7Z4bW-CgKw4XLadb5m2E4IB8lZGyYABzvbH6lsFdz-JszcxjZn5OgM6eW7vCiw"
              onError={(e) => {
                // Fallback to high-contrast badge if image load fails
                const target = e.currentTarget;
                target.style.display = 'none';
                if (target.nextElementSibling) {
                  (target.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
            {/* Fallback IT logo badge */}
            <div className="w-7 h-7 rounded bg-[#131722] text-white hidden items-center justify-center font-bold text-xs tracking-tighter">
              IT
            </div>
            <span className="text-sm font-bold text-[#131722] tracking-tight hidden sm:inline">
              TradingView
            </span>
          </div>

          {/* Search Trigger Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 h-10 px-3 bg-[#f1f3ff]/80 hover:bg-[#ebedfa] transition-colors rounded-lg flex items-center gap-2 text-[#787B86] text-left border border-transparent hover:border-[#E0E3EB]"
            title="Search markets, stocks, crypto (Press /)"
          >
            <span className="material-symbols-outlined text-[18px] text-[#787B86]">search</span>
            <span className="text-xs text-[#787B86] truncate select-none">
              Search markets, stocks, crypto
            </span>
            <span className="hidden md:inline-block ml-auto text-[10px] text-[#B2B5BE] border border-[#E0E3EB] bg-white px-1.5 py-0.5 rounded">
              /
            </span>
          </button>

          {/* Account profile button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsAccountOpen(true)}
              className="w-8 h-8 rounded-full bg-[#0049db] hover:bg-[#003ab3] text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm relative"
              title={`Simulated Paper Portfolio: $${portfolioCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            >
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#089981] border-2 border-white rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Horizontal Category Scroller */}
        <div className="h-11 flex items-center overflow-x-auto no-scrollbar gap-1.5 py-1 -mx-4 px-4 scroll-smooth">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`h-8 px-3.5 rounded-full font-semibold text-[12px] whitespace-nowrap transition-all duration-150 flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-[#2962ff] text-white shadow-sm'
                    : 'bg-[#f1f3ff] text-[#131722] hover:bg-[#e5e8f4]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
