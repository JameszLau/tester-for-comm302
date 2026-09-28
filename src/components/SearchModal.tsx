import React, { useState, useEffect, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { MarketAsset } from '../types';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, allAssets, setSelectedAsset, isInWatchlist, addToWatchlist, removeFromWatchlist } = useMarket();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'stock' | 'crypto' | 'index' | 'commodity' | 'forex'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Global keydown listener for '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchOpen && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const filtered = allAssets.filter((asset) => {
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesQuery =
      asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
      asset.name.toLowerCase().includes(query.toLowerCase()) ||
      asset.exchange.toLowerCase().includes(query.toLowerCase());
    return matchesType && matchesQuery;
  });

  const handleSelect = (asset: MarketAsset) => {
    setSelectedAsset(asset);
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E0E3EB] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input bar */}
        <div className="p-4 border-b border-[#E0E3EB] flex items-center gap-3 bg-[#F8F9FD]">
          <span className="material-symbols-outlined text-[22px] text-[#787B86]">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol, company, crypto, index..."
            className="flex-1 bg-transparent text-[15px] font-medium text-[#131722] outline-none placeholder:text-[#787B86]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#787B86] hover:text-[#131722] p-1"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-xs font-semibold text-[#787B86] hover:text-[#131722] px-2 py-1 rounded bg-[#E0E3EB]/60 hover:bg-[#E0E3EB]"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#E0E3EB] overflow-x-auto no-scrollbar bg-white">
          {(['all', 'stock', 'crypto', 'index', 'commodity', 'forex'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                filterType === t
                  ? 'bg-[#131722] text-white'
                  : 'bg-[#F8F9FD] text-[#787B86] hover:bg-[#ebedfa]'
              }`}
            >
              {t === 'all' ? 'All Assets' : t + 's'}
            </button>
          ))}
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-[#E0E3EB]/60">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#787B86]">
              <span className="material-symbols-outlined text-[36px] text-[#B2B5BE] mb-2 block">
                search_off
              </span>
              <p className="text-sm font-medium">No results found for "{query}"</p>
              <p className="text-xs text-[#B2B5BE] mt-1">Try searching for AAPL, NVDA, BTC, or S&P 500</p>
            </div>
          ) : (
            filtered.map((asset) => {
              const inWatchlist = isInWatchlist(asset.id);
              const isPositive = asset.changePercent >= 0;

              return (
                <div
                  key={asset.id}
                  onClick={() => handleSelect(asset)}
                  className="flex items-center justify-between p-3 hover:bg-[#F8F9FD] rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg bg-[#ebedfa] flex items-center justify-center font-bold text-xs text-[#131722]">
                      {asset.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[14px] text-[#131722]">
                          {asset.symbol}
                        </span>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#ebedfa] text-[#787B86] font-semibold">
                          {asset.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#787B86] truncate max-w-[200px] sm:max-w-xs">
                        {asset.name} • {asset.exchange}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold text-sm text-[#131722] tabular-nums">
                        {asset.price > 1000
                          ? asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })
                          : asset.price.toFixed(asset.price < 5 ? 4 : 2)}
                      </div>
                      <div
                        className={`text-[11px] font-semibold tabular-nums ${
                          isPositive ? 'text-[#089981]' : 'text-[#F23645]'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </div>
                    </div>

                    {/* Quick Watchlist Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (inWatchlist) removeFromWatchlist(asset.id);
                        else addToWatchlist(asset.id);
                      }}
                      className="p-1.5 text-[#B2B5BE] hover:text-[#2962ff] transition-colors"
                      title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {inWatchlist ? 'star' : 'star_border'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal footer shortcut note */}
        <div className="px-4 py-2 bg-[#F8F9FD] border-t border-[#E0E3EB] flex items-center justify-between text-[11px] text-[#787B86]">
          <span>Use <strong>Enter</strong> to select</span>
          <span>Apex Market Terminal • Real-Time Engine</span>
        </div>
      </div>
    </div>
  );
};
