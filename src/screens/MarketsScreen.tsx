import React, { useState, useRef, useEffect } from 'react';
import { useMarket } from '../context/MarketContext';
import { Sparkline } from '../components/Sparkline';
import { AssetCategory, StockFilterTab, MarketAsset } from '../types';

interface MarketsScreenProps {
  selectedCategory: AssetCategory;
  onSelectCategory: (cat: AssetCategory) => void;
}

export const MarketsScreen: React.FC<MarketsScreenProps> = ({ selectedCategory, onSelectCategory }) => {
  const {
    majorIndices,
    worldIndices,
    usStocks,
    cryptoSpotlight,
    commoditiesForex,
    earningsEvents,
    setSelectedAsset,
    setIsCalendarOpen,
    recentTicks
  } = useMarket();

  const [stockFilter, setStockFilter] = useState<StockFilterTab>('Community trends');
  const [marketRegion, setMarketRegion] = useState<'Everywhere' | 'United States' | 'Europe' | 'Asia' | 'Crypto'>('Everywhere');
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [isAllIndicesOpen, setIsAllIndicesOpen] = useState(false);
  const [isAllCoinsOpen, setIsAllCoinsOpen] = useState(false);

  // Section references for category auto-scroll
  const indicesRef = useRef<HTMLDivElement>(null);
  const usStocksRef = useRef<HTMLDivElement>(null);
  const cryptoRef = useRef<HTMLDivElement>(null);
  const commoditiesRef = useRef<HTMLDivElement>(null);
  const earningsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCategory === 'Indices') {
      indicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (selectedCategory === 'US Stocks') {
      usStocksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (selectedCategory === 'Crypto') {
      cryptoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (selectedCategory === 'Futures' || selectedCategory === 'Forex') {
      commoditiesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (selectedCategory === 'Economy') {
      earningsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedCategory]);

  // Filter US Stocks based on the selected tab
  const displayedStocks = React.useMemo(() => {
    const list = [...usStocks];
    if (stockFilter === 'Highest volume') {
      return list.sort((a, b) => {
        const volA = parseFloat(a.volume?.replace(/[^0-9.]/g, '') || '0');
        const volB = parseFloat(b.volume?.replace(/[^0-9.]/g, '') || '0');
        return volB - volA;
      });
    }
    if (stockFilter === 'Gainers') {
      return list.sort((a, b) => b.changePercent - a.changePercent);
    }
    if (stockFilter === 'Losers') {
      return list.sort((a, b) => a.changePercent - b.changePercent);
    }
    // 'Community trends' default list order
    return list;
  }, [usStocks, stockFilter]);

  const handleAssetClick = (asset: MarketAsset) => {
    setSelectedAsset(asset);
  };

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Title Header with Dropdown */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between relative">
        <div className="relative">
          <button
            onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
            className="flex items-center gap-1.5 cursor-pointer text-left group"
          >
            <h1 className="text-xl sm:text-2xl font-bold text-[#131722] tracking-tight group-hover:text-[#2962ff] transition-colors">
              {marketRegion === 'Everywhere' ? 'Markets, everywhere' : `Markets in ${marketRegion}`}
            </h1>
            <span className="material-symbols-outlined text-[20px] text-[#787B86] group-hover:text-[#2962ff] transition-transform">
              {isRegionDropdownOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </span>
          </button>

          {/* Region selector dropdown */}
          {isRegionDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 w-52 bg-white rounded-xl shadow-xl border border-[#E0E3EB] py-1 animate-in fade-in zoom-in-95">
              {(['Everywhere', 'United States', 'Europe', 'Asia', 'Crypto'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setMarketRegion(r);
                    setIsRegionDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-xs font-semibold flex items-center justify-between hover:bg-[#F8F9FD] ${
                    marketRegion === r ? 'text-[#2962ff] bg-[#f1f3ff]' : 'text-[#131722]'
                  }`}
                >
                  <span>{r === 'Everywhere' ? 'Global Everywhere' : r}</span>
                  {marketRegion === r && (
                    <span className="material-symbols-outlined text-[16px] text-[#2962ff]">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-1 bg-[#e5e8f4] px-2.5 py-1 rounded-full shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse"></span>
          <span className="text-[10px] font-bold text-[#787B86] uppercase tracking-wider">
            Live
          </span>
        </div>
      </div>

      {/* Major Indices Section with Carousel Sparklines */}
      <section ref={indicesRef} className="mt-3">
        <div className="px-4 flex items-center justify-between pb-1.5">
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => setIsAllIndicesOpen(true)}>
            <h2 className="text-base font-bold text-[#131722]">Indices</h2>
            <span className="material-symbols-outlined text-[18px] text-[#787B86]">chevron_right</span>
          </div>
          <button
            onClick={() => setIsAllIndicesOpen(true)}
            className="text-[11px] font-bold text-[#2962ff] hover:underline"
          >
            See all indices
          </button>
        </div>

        {/* Indices Carousel */}
        <div className="overflow-x-auto no-scrollbar flex gap-2.5 px-4 py-1">
          {majorIndices.map((index) => {
            const isPositive = index.changePercent >= 0;
            const tickDir = recentTicks[index.id];

            return (
              <div
                key={index.id}
                onClick={() => handleAssetClick(index)}
                className={`w-[200px] shrink-0 bg-white rounded-xl p-3 shadow-sm border border-[#E0E3EB] flex flex-col justify-between h-[132px] relative overflow-hidden cursor-pointer hover:border-[#2962ff] transition-all active:scale-98 ${
                  tickDir === 'up'
                    ? 'ring-2 ring-[#089981]/30'
                    : tickDir === 'down'
                    ? 'ring-2 ring-[#F23645]/30'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                        style={{
                          backgroundColor: index.iconBg,
                          color: index.iconColor
                        }}
                      >
                        {index.iconText}
                      </span>
                      <span className="text-[13px] font-bold text-[#131722] truncate">
                        {index.symbol}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#787B86] truncate mt-0.5">
                      {index.name}
                    </p>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums ${
                      isPositive
                        ? 'bg-[#E6F4F1] text-[#089981]'
                        : 'bg-[#FDEBED] text-[#F23645]'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {index.changePercent.toFixed(2)}%
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[16px] font-bold text-[#131722] tracking-tight tabular-nums">
                    {index.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`text-[10px] font-semibold tabular-nums ${
                      isPositive ? 'text-[#089981]' : 'text-[#F23645]'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {index.change.toFixed(2)}
                  </span>
                </div>

                {/* Sparkline */}
                <div className="w-full h-8 mt-1">
                  <Sparkline data={index.sparkline} isPositive={isPositive} height={32} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* World Indices Section */}
      <section className="mt-5 px-4">
        <div className="flex items-center justify-between pb-1.5">
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => setIsAllIndicesOpen(true)}>
            <h2 className="text-base font-bold text-[#131722]">World indices</h2>
            <span className="material-symbols-outlined text-[18px] text-[#787B86]">chevron_right</span>
          </div>
          <button
            onClick={() => setIsAllIndicesOpen(true)}
            className="text-[11px] font-medium text-[#787B86] hover:text-[#131722]"
          >
            Quotes
          </button>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#E0E3EB] flex flex-col divide-y divide-[#E0E3EB]/60">
          {worldIndices.map((idx) => {
            const isPositive = idx.changePercent >= 0;
            return (
              <div
                key={idx.id}
                onClick={() => handleAssetClick(idx)}
                className="flex items-center justify-between py-2.5 cursor-pointer hover:bg-[#F8F9FD] px-1 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0"
                    style={{
                      backgroundColor: idx.iconBg,
                      color: idx.iconColor
                    }}
                  >
                    {idx.iconText}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-[#131722] group-hover:text-[#2962ff] transition-colors">
                        {idx.symbol}
                      </span>
                      <span className="text-[11px] text-[#787B86]">{idx.name}</span>
                    </div>
                    <p className="text-[10px] text-[#787B86]">{idx.exchange}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[13px] font-bold text-[#131722] tabular-nums">
                    {idx.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div
                    className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums ${
                      isPositive
                        ? 'bg-[#E6F4F1] text-[#089981]'
                        : 'bg-[#FDEBED] text-[#F23645]'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {idx.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* US Stocks Section */}
      <section ref={usStocksRef} className="mt-5 px-4">
        <div className="flex items-center justify-between pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[16px]">🇺🇸</span>
            <h2 className="text-base font-bold text-[#131722]">US stocks</h2>
            <span className="material-symbols-outlined text-[18px] text-[#787B86]">chevron_right</span>
          </div>
          <button
            onClick={() => onSelectCategory('US Stocks')}
            className="text-[11px] font-bold text-[#2962ff] hover:underline"
          >
            Screener
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-2">
          {(['Community trends', 'Highest volume', 'Gainers', 'Losers'] as const).map((tab) => {
            const isSelected = stockFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setStockFilter(tab)}
                className={`px-3 py-1.5 rounded-full font-semibold text-[11px] shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#131722] text-white shadow-sm'
                    : 'bg-white text-[#787B86] border border-[#E0E3EB] hover:bg-[#F8F9FD]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Stock Rows Card */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#E0E3EB] flex flex-col divide-y divide-[#E0E3EB]/60">
          {displayedStocks.slice(0, 6).map((stock) => {
            const isPositive = stock.changePercent >= 0;
            const tickDir = recentTicks[stock.id];

            return (
              <div
                key={stock.id}
                onClick={() => handleAssetClick(stock)}
                className={`flex items-center justify-between py-2 cursor-pointer hover:bg-[#F8F9FD] px-1 rounded-lg transition-colors group ${
                  tickDir === 'up'
                    ? 'bg-[#E6F4F1]/50'
                    : tickDir === 'down'
                    ? 'bg-[#FDEBED]/50'
                    : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {/* Icon */}
                  {stock.iconType === 'icon' ? (
                    <div className="w-8 h-8 rounded-full bg-[#F8F9FD] border border-[#E0E3EB] flex items-center justify-center text-[#131722] shadow-sm shrink-0">
                      <span className="material-symbols-outlined text-[16px]">
                        {stock.materialIcon}
                      </span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#F8F9FD] border border-[#E0E3EB] flex items-center justify-center shadow-sm shrink-0">
                      <span
                        className="font-bold text-[12px]"
                        style={{ color: stock.iconColor || '#131722' }}
                      >
                        {stock.iconText || stock.symbol.slice(0, 2)}
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-bold text-[#131722] group-hover:text-[#2962ff] transition-colors">
                        {stock.symbol}
                      </span>
                      <span className="text-[11px] text-[#787B86] truncate max-w-[120px] sm:max-w-[180px]">
                        {stock.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#787B86]">
                      Vol {stock.volume} • {stock.exchange}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[13px] font-bold text-[#131722] tabular-nums">
                    ${stock.price.toFixed(2)}
                  </div>
                  <div
                    className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums ${
                      isPositive
                        ? 'bg-[#E6F4F1] text-[#089981]'
                        : 'bg-[#FDEBED] text-[#F23645]'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Crypto Spotlight */}
      <section ref={cryptoRef} className="mt-5 px-4">
        <div className="flex items-center justify-between pb-1.5">
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => setIsAllCoinsOpen(true)}>
            <h2 className="text-base font-bold text-[#131722]">Crypto spotlight</h2>
            <span className="material-symbols-outlined text-[18px] text-[#787B86]">chevron_right</span>
          </div>
          <button
            onClick={() => setIsAllCoinsOpen(true)}
            className="text-[11px] font-bold text-[#2962ff] hover:underline"
          >
            See all coins
          </button>
        </div>

        {/* Crypto Gainers Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {[
            { symbol: 'QNT Quant', change: '+45.54%' },
            { symbol: 'HBAR Hedera', change: '+22.98%' },
            { symbol: 'GRT The Graph', change: '+13.69%' },
            { symbol: 'SUI Sui', change: '+11.20%' }
          ].map((c) => (
            <div
              key={c.symbol}
              onClick={() => setIsAllCoinsOpen(true)}
              className="bg-[#E6F4F1] rounded-lg px-2.5 py-1.5 flex items-center gap-2 shrink-0 border border-[#089981]/20 cursor-pointer hover:bg-[#d5eee7] transition-colors"
            >
              <span className="text-[11px] font-bold text-[#131722]">{c.symbol}</span>
              <span className="text-[11px] font-bold text-[#089981] tabular-nums">{c.change}</span>
            </div>
          ))}
        </div>

        {/* Crypto Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5 mt-1">
          {cryptoSpotlight.slice(0, 4).map((coin) => {
            const isPos = coin.changePercent >= 0;
            return (
              <div
                key={coin.id}
                onClick={() => handleAssetClick(coin)}
                className="bg-white rounded-xl p-3 shadow-sm border border-[#E0E3EB] flex flex-col justify-between hover:border-[#2962ff] cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mb-1"
                      style={{
                        backgroundColor: coin.iconBg,
                        color: coin.iconColor
                      }}
                    >
                      {coin.iconText}
                    </div>
                    <span className="text-[13px] font-bold text-[#131722]">
                      {coin.symbol}
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums ${
                      isPos ? 'bg-[#E6F4F1] text-[#089981]' : 'bg-[#FDEBED] text-[#F23645]'
                    }`}
                  >
                    {isPos ? '+' : ''}
                    {coin.changePercent.toFixed(2)}%
                  </span>
                </div>

                <div className="mt-2">
                  <div className="text-[13px] font-bold text-[#131722] tabular-nums">
                    ${coin.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-[#787B86]">
                    Cap {coin.marketCap}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Commodities & Forex Section */}
      <section ref={commoditiesRef} className="mt-5 px-4">
        <div className="flex items-center justify-between pb-1.5">
          <div className="flex items-center gap-1">
            <h2 className="text-base font-bold text-[#131722]">Commodities & Forex</h2>
            <span className="material-symbols-outlined text-[18px] text-[#787B86]">chevron_right</span>
          </div>
          <button
            onClick={() => onSelectCategory('Futures')}
            className="text-[11px] font-medium text-[#787B86] hover:text-[#131722]"
          >
            Futures
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {commoditiesForex.slice(0, 4).map((item) => {
            const isPositive = item.changePercent >= 0;
            return (
              <div
                key={item.id}
                onClick={() => handleAssetClick(item)}
                className="bg-white rounded-xl p-3 shadow-sm border border-[#E0E3EB] hover:border-[#2962ff] cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#787B86]">{item.symbol}</span>
                  <span
                    className={`px-1 py-0.5 rounded text-[10px] font-semibold tabular-nums ${
                      isPositive ? 'bg-[#E6F4F1] text-[#089981]' : 'bg-[#FDEBED] text-[#F23645]'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="text-[13px] font-bold text-[#131722] mt-1">{item.name}</div>
                <div className="text-[13px] font-bold text-[#131722] tabular-nums mt-0.5">
                  {item.price > 1000
                    ? item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })
                    : item.price.toFixed(item.price < 5 ? 4 : 2)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Today's Earnings Section */}
      <section ref={earningsRef} className="mt-5 px-4">
        <div className="flex items-center justify-between pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-[#2962ff]">
              calendar_today
            </span>
            <h2 className="text-base font-bold text-[#131722]">Today's Earnings</h2>
          </div>
          <button
            onClick={() => setIsCalendarOpen(true)}
            className="text-[11px] font-bold text-[#2962ff] hover:underline"
          >
            Calendar
          </button>
        </div>

        <div className="bg-white rounded-xl p-3 shadow-sm border border-[#E0E3EB] flex flex-col divide-y divide-[#E0E3EB]/60">
          {earningsEvents.slice(0, 3).map((event) => (
            <div
              key={event.id}
              onClick={() => setIsCalendarOpen(true)}
              className="flex items-center justify-between py-2 cursor-pointer hover:bg-[#F8F9FD] px-1 rounded-lg transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-[#131722]">{event.symbol}</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#ebedfa] text-[#787B86]">
                    {event.timing}
                  </span>
                </div>
                <p className="text-[10px] text-[#787B86]">{event.companyName}</p>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-[#787B86]">
                  Est. <span className="text-[#131722] font-semibold">{event.estimate}</span>
                </div>
                <div
                  className={`text-[10px] ${
                    event.actual !== '—'
                      ? 'text-[#089981] font-semibold'
                      : 'text-[#787B86]'
                  }`}
                >
                  Act. <span className="font-semibold">{event.actual}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Indices Drawer Modal */}
      {isAllIndicesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E0E3EB] p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E3EB]">
              <h3 className="font-bold text-base text-[#131722]">Global Market Indices</h3>
              <button
                onClick={() => setIsAllIndicesOpen(false)}
                className="p-1 rounded-full text-[#787B86] hover:text-[#131722]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="divide-y divide-[#E0E3EB]/60 mt-2">
              {[...majorIndices, ...worldIndices].map((idx) => {
                const isPos = idx.changePercent >= 0;
                return (
                  <div
                    key={idx.id}
                    onClick={() => {
                      setSelectedAsset(idx);
                      setIsAllIndicesOpen(false);
                    }}
                    className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#F8F9FD] px-2 rounded-lg"
                  >
                    <div>
                      <div className="font-bold text-sm text-[#131722]">{idx.symbol}</div>
                      <div className="text-xs text-[#787B86]">{idx.name} • {idx.exchange}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-[#131722] tabular-nums">
                        {idx.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs font-semibold tabular-nums ${isPos ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                        {isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* All Coins Drawer Modal */}
      {isAllCoinsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E0E3EB] p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E3EB]">
              <h3 className="font-bold text-base text-[#131722]">Cryptocurrency Market</h3>
              <button
                onClick={() => setIsAllCoinsOpen(false)}
                className="p-1 rounded-full text-[#787B86] hover:text-[#131722]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="divide-y divide-[#E0E3EB]/60 mt-2">
              {cryptoSpotlight.map((coin) => {
                const isPos = coin.changePercent >= 0;
                return (
                  <div
                    key={coin.id}
                    onClick={() => {
                      setSelectedAsset(coin);
                      setIsAllCoinsOpen(false);
                    }}
                    className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-[#F8F9FD] px-2 rounded-lg"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: coin.iconBg, color: coin.iconColor }}
                      >
                        {coin.iconText}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#131722]">{coin.symbol}</div>
                        <div className="text-xs text-[#787B86]">{coin.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-[#131722] tabular-nums">
                        ${coin.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-xs font-semibold tabular-nums ${isPos ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                        {isPos ? '+' : ''}{coin.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
