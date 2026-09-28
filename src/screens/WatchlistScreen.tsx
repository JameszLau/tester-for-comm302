import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { Sparkline } from '../components/Sparkline';
import { MarketAsset } from '../types';

export const WatchlistScreen: React.FC = () => {
  const {
    watchlistIds,
    removeFromWatchlist,
    allAssets,
    setSelectedAsset,
    setIsSearchOpen,
    recentTicks
  } = useMarket();

  const [sortBy, setSortBy] = useState<'default' | 'gainers' | 'losers' | 'price'>('default');

  const watchlistAssets = allAssets.filter((a) => watchlistIds.includes(a.id));

  const sortedAssets = React.useMemo(() => {
    const list = [...watchlistAssets];
    if (sortBy === 'gainers') return list.sort((a, b) => b.changePercent - a.changePercent);
    if (sortBy === 'losers') return list.sort((a, b) => a.changePercent - b.changePercent);
    if (sortBy === 'price') return list.sort((a, b) => b.price - a.price);
    return list;
  }, [watchlistAssets, sortBy]);

  return (
    <div className="flex flex-col w-full pb-10 px-4 pt-3">
      {/* Title & Action Bar */}
      <div className="flex items-center justify-between pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131722] tracking-tight">
            My Watchlist
          </h1>
          <p className="text-xs text-[#787B86] mt-0.5">
            {watchlistAssets.length} tracked {watchlistAssets.length === 1 ? 'instrument' : 'instruments'}
          </p>
        </div>

        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2962ff] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#0049db] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Symbol
        </button>
      </div>

      {/* Sort / Filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-3">
        <span className="text-[11px] font-semibold text-[#787B86] mr-1">Sort:</span>
        {(['default', 'gainers', 'losers', 'price'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors ${
              sortBy === s
                ? 'bg-[#131722] text-white'
                : 'bg-white text-[#787B86] border border-[#E0E3EB] hover:bg-[#F8F9FD]'
            }`}
          >
            {s === 'default' ? 'Custom' : s}
          </button>
        ))}
      </div>

      {/* Watchlist Cards List */}
      {sortedAssets.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-[#E0E3EB] mt-4">
          <span className="material-symbols-outlined text-4xl text-[#B2B5BE] mb-2 block">
            playlist_add
          </span>
          <h3 className="font-bold text-base text-[#131722]">Your watchlist is empty</h3>
          <p className="text-xs text-[#787B86] mt-1 max-w-xs mx-auto">
            Keep track of your favorite stocks, indices, crypto, and commodities in real-time.
          </p>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="mt-4 px-4 py-2 bg-[#2962ff] text-white text-xs font-bold rounded-xl"
          >
            Search & Add Assets
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedAssets.map((asset) => {
            const isPositive = asset.changePercent >= 0;
            const tickDir = recentTicks[asset.id];

            return (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`p-3.5 bg-white rounded-xl border border-[#E0E3EB] shadow-sm hover:border-[#2962ff] flex items-center justify-between cursor-pointer transition-all active:scale-99 ${
                  tickDir === 'up'
                    ? 'ring-2 ring-[#089981]/30'
                    : tickDir === 'down'
                    ? 'ring-2 ring-[#F23645]/30'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F8F9FD] border border-[#E0E3EB] flex items-center justify-center font-bold text-xs text-[#131722]">
                    {asset.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#131722]">{asset.symbol}</span>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-[#ebedfa] text-[#787B86]">
                        {asset.exchange}
                      </span>
                    </div>
                    <p className="text-xs text-[#787B86] truncate max-w-[140px] sm:max-w-xs">
                      {asset.name}
                    </p>
                  </div>
                </div>

                {/* Mini Sparkline in row */}
                <div className="hidden sm:block w-24 h-7">
                  <Sparkline data={asset.sparkline} isPositive={isPositive} height={28} />
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-sm text-[#131722] tabular-nums">
                      {asset.currency === 'USD' ? '$' : ''}
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

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(asset.id);
                    }}
                    className="p-1 text-[#B2B5BE] hover:text-[#F23645] transition-colors"
                    title="Remove from Watchlist"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
