import React, { useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { Sparkline } from './Sparkline';

export const AssetDetailModal: React.FC = () => {
  const {
    selectedAsset,
    setSelectedAsset,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    portfolioCash,
    positions,
    executeTrade,
    addAlert
  } = useMarket();

  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '6M' | '1Y' | 'ALL'>('1D');
  const [chartType, setChartType] = useState<'area' | 'candle'>('area');
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');
  const [sharesInput, setSharesInput] = useState<string>('5');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertPrice, setAlertPrice] = useState<string>('');

  if (!selectedAsset) return null;

  const inWatchlist = isInWatchlist(selectedAsset.id);
  const isPositive = selectedAsset.changePercent >= 0;

  // Generate extended chart data points based on selected timeframe
  const chartPoints = useMemo(() => {
    const base = selectedAsset.price;
    const count = timeframe === '1D' ? 24 : timeframe === '5D' ? 35 : timeframe === '1M' ? 30 : 50;
    const volatility = base * (timeframe === '1D' ? 0.008 : 0.025);
    
    // Seeded random walk leading to current price
    const points: { time: string; price: number; high: number; low: number; open: number; close: number }[] = [];
    let current = base * (1 - (selectedAsset.changePercent / 100));

    for (let i = 0; i < count; i++) {
      const step = (Math.sin(i * 0.4) + (Math.random() - 0.48)) * volatility;
      const open = current;
      current = Math.max(0.1, current + step);
      const close = i === count - 1 ? base : current;
      const high = Math.max(open, close) + Math.random() * (volatility * 0.5);
      const low = Math.min(open, close) - Math.random() * (volatility * 0.5);

      const hour = Math.floor(9 + (i * 7) / count);
      const min = Math.floor(((i * 7) / count - Math.floor((i * 7) / count)) * 60);
      const timeStr = `${hour}:${min < 10 ? '0' : ''}${min}`;

      points.push({
        time: timeStr,
        price: close,
        high,
        low,
        open,
        close
      });
    }

    return points;
  }, [selectedAsset, timeframe]);

  const activeHoverPoint = hoverIndex !== null ? chartPoints[hoverIndex] : null;
  const displayPrice = activeHoverPoint ? activeHoverPoint.price : selectedAsset.price;

  // User position in this asset
  const userPosition = positions.find((p) => p.symbol === selectedAsset.symbol);
  const currentSharesHeld = userPosition ? userPosition.shares : 0;

  const sharesNum = Math.max(0.01, parseFloat(sharesInput) || 0);
  const totalCost = sharesNum * selectedAsset.price;
  const canAfford = tradeAction === 'buy' ? portfolioCash >= totalCost : currentSharesHeld >= sharesNum;

  const handleTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAfford) return;
    executeTrade(
      selectedAsset.symbol,
      selectedAsset.name,
      tradeAction,
      sharesNum,
      selectedAsset.price
    );
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(alertPrice);
    if (price && price > 0) {
      addAlert(
        selectedAsset.symbol,
        price >= selectedAsset.price ? 'above' : 'below',
        price
      );
      setIsAlertOpen(false);
      setAlertPrice('');
    }
  };

  // Day range calculation
  const dayLow = selectedAsset.dayLow || selectedAsset.price * 0.985;
  const dayHigh = selectedAsset.dayHigh || selectedAsset.price * 1.015;
  const dayRangePercent = Math.min(100, Math.max(0, ((displayPrice - dayLow) / (dayHigh - dayLow)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#E0E3EB] max-h-[92vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-[#E0E3EB] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F8F9FD] border border-[#E0E3EB] flex items-center justify-center font-bold text-sm text-[#131722] shadow-sm">
              {selectedAsset.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#131722] tracking-tight">
                  {selectedAsset.symbol}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#ebedfa] text-[#434656]">
                  {selectedAsset.exchange}
                </span>
              </div>
              <p className="text-xs text-[#787B86] truncate max-w-[220px] sm:max-w-xs">
                {selectedAsset.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Watchlist toggle */}
            <button
              onClick={() => {
                if (inWatchlist) removeFromWatchlist(selectedAsset.id);
                else addToWatchlist(selectedAsset.id);
              }}
              className={`p-2 rounded-full border transition-colors ${
                inWatchlist
                  ? 'border-[#2962ff] text-[#2962ff] bg-[#f1f3ff]'
                  : 'border-[#E0E3EB] text-[#787B86] hover:text-[#131722]'
              }`}
              title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {inWatchlist ? 'star' : 'star_border'}
              </span>
            </button>

            {/* Alert Bell */}
            <button
              onClick={() => setIsAlertOpen(!isAlertOpen)}
              className="p-2 rounded-full border border-[#E0E3EB] text-[#787B86] hover:text-[#131722] transition-colors"
              title="Set Price Alert"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>

            {/* Close */}
            <button
              onClick={() => setSelectedAsset(null)}
              className="p-2 rounded-full bg-[#F8F9FD] hover:bg-[#ebedfa] text-[#787B86] hover:text-[#131722] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Set Alert Mini Panel */}
        {isAlertOpen && (
          <form
            onSubmit={handleCreateAlert}
            className="bg-[#F8F9FD] p-3 border-b border-[#E0E3EB] flex items-center gap-3 animate-in slide-in-from-top-2"
          >
            <span className="material-symbols-outlined text-[#2962ff] text-[20px]">add_alert</span>
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs font-semibold text-[#131722]">Alert when price hits:</span>
              <input
                type="number"
                step="any"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                placeholder={`e.g. ${(selectedAsset.price * 1.05).toFixed(2)}`}
                className="w-28 px-2 py-1 bg-white border border-[#E0E3EB] rounded text-xs font-semibold text-[#131722] outline-none"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1 bg-[#2962ff] text-white text-xs font-semibold rounded hover:bg-[#0049db]"
            >
              Save Alert
            </button>
            <button
              type="button"
              onClick={() => setIsAlertOpen(false)}
              className="text-[#787B86] hover:text-[#131722] text-xs font-medium"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="p-5 space-y-6">
          {/* Main Price Headline */}
          <div className="flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#131722] tracking-tight tabular-nums">
                  {selectedAsset.currency === 'USD' ? '$' : ''}
                  {displayPrice > 1000
                    ? displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : displayPrice.toFixed(displayPrice < 5 ? 4 : 2)}
                </span>
                <span className="text-xs font-medium text-[#787B86]">
                  {selectedAsset.currency}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded tabular-nums ${
                    isPositive
                      ? 'bg-[#E6F4F1] text-[#089981]'
                      : 'bg-[#FDEBED] text-[#F23645]'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {selectedAsset.change.toFixed(2)} ({isPositive ? '+' : ''}
                  {selectedAsset.changePercent.toFixed(2)}%)
                </span>
                <span className="text-[11px] text-[#787B86]">
                  {activeHoverPoint ? `At ${activeHoverPoint.time}` : 'Today (Live)'}
                </span>
              </div>
            </div>

            {/* Chart Style Switcher */}
            <div className="flex items-center bg-[#F8F9FD] p-1 rounded-lg border border-[#E0E3EB]">
              <button
                onClick={() => setChartType('area')}
                className={`p-1.5 rounded text-xs font-semibold transition-colors ${
                  chartType === 'area'
                    ? 'bg-white text-[#2962ff] shadow-sm'
                    : 'text-[#787B86] hover:text-[#131722]'
                }`}
                title="Area / Line View"
              >
                <span className="material-symbols-outlined text-[18px]">show_chart</span>
              </button>
              <button
                onClick={() => setChartType('candle')}
                className={`p-1.5 rounded text-xs font-semibold transition-colors ${
                  chartType === 'candle'
                    ? 'bg-white text-[#2962ff] shadow-sm'
                    : 'text-[#787B86] hover:text-[#131722]'
                }`}
                title="Candlestick View"
              >
                <span className="material-symbols-outlined text-[18px]">candlestick_chart</span>
              </button>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="bg-[#F8F9FD] border border-[#E0E3EB] rounded-2xl p-4 relative">
            <div className="h-56 w-full relative">
              {chartType === 'area' ? (
                <svg
                  className="w-full h-full cursor-crosshair"
                  viewBox="0 0 600 200"
                  preserveAspectRatio="none"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    const idx = Math.floor(ratio * (chartPoints.length - 1));
                    setHoverIndex(idx);
                  }}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  <defs>
                    <linearGradient id="detailGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={isPositive ? '#089981' : '#F23645'}
                        stopOpacity="0.3"
                      />
                      <stop
                        offset="100%"
                        stopColor={isPositive ? '#089981' : '#F23645'}
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  <line x1="0" y1="50" x2="600" y2="50" stroke="#E0E3EB" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="#E0E3EB" strokeDasharray="3 3" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="#E0E3EB" strokeDasharray="3 3" />

                  {/* Area fill */}
                  {(() => {
                    const min = Math.min(...chartPoints.map((p) => p.price));
                    const max = Math.max(...chartPoints.map((p) => p.price));
                    const range = max - min || 1;
                    const pathD = chartPoints
                      .map((p, i) => {
                        const x = (i / (chartPoints.length - 1)) * 600;
                        const y = 180 - ((p.price - min) / range) * 160;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      })
                      .join(' ');

                    return (
                      <>
                        <path
                          d={`${pathD} L 600 200 L 0 200 Z`}
                          fill="url(#detailGradient)"
                        />
                        <path
                          d={pathD}
                          fill="none"
                          stroke={isPositive ? '#089981' : '#F23645'}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    );
                  })()}

                  {/* Crosshair indicator */}
                  {hoverIndex !== null && (
                    <>
                      <line
                        x1={(hoverIndex / (chartPoints.length - 1)) * 600}
                        y1="0"
                        x2={(hoverIndex / (chartPoints.length - 1)) * 600}
                        y2="200"
                        stroke="#2962ff"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                      <circle
                        cx={(hoverIndex / (chartPoints.length - 1)) * 600}
                        cy={
                          180 -
                          ((chartPoints[hoverIndex].price -
                            Math.min(...chartPoints.map((p) => p.price))) /
                            (Math.max(...chartPoints.map((p) => p.price)) -
                              Math.min(...chartPoints.map((p) => p.price)) ||
                              1)) *
                            160
                        }
                        r="5"
                        fill="#2962ff"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </>
                  )}
                </svg>
              ) : (
                /* Candlestick chart view */
                <svg
                  className="w-full h-full cursor-crosshair"
                  viewBox="0 0 600 200"
                  preserveAspectRatio="none"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    const idx = Math.floor(ratio * (chartPoints.length - 1));
                    setHoverIndex(idx);
                  }}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  {/* Grid */}
                  <line x1="0" y1="50" x2="600" y2="50" stroke="#E0E3EB" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="#E0E3EB" strokeDasharray="3 3" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="#E0E3EB" strokeDasharray="3 3" />

                  {(() => {
                    const allLows = chartPoints.map((p) => p.low);
                    const allHighs = chartPoints.map((p) => p.high);
                    const min = Math.min(...allLows);
                    const max = Math.max(...allHighs);
                    const range = max - min || 1;

                    return chartPoints.map((p, i) => {
                      const x = (i / (chartPoints.length - 1)) * 560 + 20;
                      const yHigh = 180 - ((p.high - min) / range) * 160;
                      const yLow = 180 - ((p.low - min) / range) * 160;
                      const yOpen = 180 - ((p.open - min) / range) * 160;
                      const yClose = 180 - ((p.close - min) / range) * 160;
                      const candleColor = p.close >= p.open ? '#089981' : '#F23645';

                      return (
                        <g key={i}>
                          <line
                            x1={x}
                            y1={yHigh}
                            x2={x}
                            y2={yLow}
                            stroke={candleColor}
                            strokeWidth="1"
                          />
                          <rect
                            x={x - 3}
                            y={Math.min(yOpen, yClose)}
                            width={6}
                            height={Math.max(2, Math.abs(yClose - yOpen))}
                            fill={candleColor}
                            rx={1}
                          />
                        </g>
                      );
                    });
                  })()}
                </svg>
              )}
            </div>

            {/* Timeframe Selector Pills */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E0E3EB] mt-2">
              {(['1D', '5D', '1M', '6M', '1Y', 'ALL'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    timeframe === tf
                      ? 'bg-[#131722] text-white shadow-sm'
                      : 'text-[#787B86] hover:bg-white hover:text-[#131722]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Day & 52-Week Range Sliders */}
          <div className="bg-white rounded-xl border border-[#E0E3EB] p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#131722] mb-1.5">
                <span className="text-[#787B86]">Day's Range</span>
                <span>
                  Low: ${dayLow.toFixed(2)} — High: ${dayHigh.toFixed(2)}
                </span>
              </div>
              <div className="h-2 w-full bg-[#ebedfa] rounded-full relative overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 bg-[#2962ff] rounded-full"
                  style={{ width: `${dayRangePercent}%` }}
                />
              </div>
            </div>

            {/* Key Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#E0E3EB]">
              <div>
                <p className="text-[11px] text-[#787B86] font-medium">Volume</p>
                <p className="text-sm font-semibold text-[#131722] tabular-nums mt-0.5">
                  {selectedAsset.volume || '14.8M'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#787B86] font-medium">Market Cap</p>
                <p className="text-sm font-semibold text-[#131722] tabular-nums mt-0.5">
                  {selectedAsset.marketCap || '$280B'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#787B86] font-medium">P/E Ratio</p>
                <p className="text-sm font-semibold text-[#131722] tabular-nums mt-0.5">
                  {selectedAsset.peRatio || '32.4'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#787B86] font-medium">52W High</p>
                <p className="text-sm font-semibold text-[#131722] tabular-nums mt-0.5">
                  ${(selectedAsset.yearHigh || selectedAsset.price * 1.25).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Analyst Consensus / Sentiment */}
          <div className="bg-[#F8F9FD] rounded-xl border border-[#E0E3EB] p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#131722] uppercase tracking-wider">
                Analyst Consensus
              </h4>
              <span className="text-xs font-bold text-[#089981]">
                Strong Buy ({selectedAsset.sentiment?.buy || 82}%)
              </span>
            </div>
            {/* Visual consensus bar */}
            <div className="h-2.5 w-full bg-[#ebedfa] rounded-full flex overflow-hidden">
              <div
                className="bg-[#089981]"
                style={{ width: `${selectedAsset.sentiment?.buy || 82}%` }}
                title="Buy"
              />
              <div
                className="bg-[#5a5e6b]"
                style={{ width: `${selectedAsset.sentiment?.hold || 14}%` }}
                title="Hold"
              />
              <div
                className="bg-[#F23645]"
                style={{ width: `${selectedAsset.sentiment?.sell || 4}%` }}
                title="Sell"
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#787B86] mt-1.5 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#089981]"></span> Buy {selectedAsset.sentiment?.buy || 82}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#5a5e6b]"></span> Hold {selectedAsset.sentiment?.hold || 14}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#F23645]"></span> Sell {selectedAsset.sentiment?.sell || 4}%
              </span>
            </div>
          </div>

          {/* Interactive Paper Trading Action Card */}
          <div className="bg-white rounded-2xl border-2 border-[#2962ff]/30 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#131722]">Instant Paper Trade</h4>
                <p className="text-xs text-[#787B86]">
                  Simulated execution • Zero risk
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#787B86] uppercase font-bold">Buying Power</p>
                <p className="text-xs font-bold text-[#089981] tabular-nums">
                  ${portfolioCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Buy / Sell switch */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F8F9FD] rounded-xl border border-[#E0E3EB]">
              <button
                type="button"
                onClick={() => setTradeAction('buy')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  tradeAction === 'buy'
                    ? 'bg-[#089981] text-white shadow-sm'
                    : 'text-[#787B86] hover:text-[#131722]'
                }`}
              >
                BUY {selectedAsset.symbol}
              </button>
              <button
                type="button"
                onClick={() => setTradeAction('sell')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  tradeAction === 'sell'
                    ? 'bg-[#F23645] text-white shadow-sm'
                    : 'text-[#787B86] hover:text-[#131722]'
                }`}
              >
                SELL {selectedAsset.symbol} (Held: {currentSharesHeld})
              </button>
            </div>

            {/* Shares input & quick stepper buttons */}
            <form onSubmit={handleTrade} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#131722] mb-1">
                  Quantity (Units / Shares)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={sharesInput}
                    onChange={(e) => setSharesInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#F8F9FD] border border-[#E0E3EB] rounded-lg text-sm font-semibold text-[#131722] outline-none focus:border-[#2962ff]"
                  />
                  {(['1', '5', '10', '50'] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setSharesInput(n)}
                      className="px-2.5 py-2 bg-[#F8F9FD] hover:bg-[#ebedfa] border border-[#E0E3EB] rounded-lg text-xs font-semibold text-[#131722]"
                    >
                      +{n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order total estimate */}
              <div className="p-3 bg-[#F8F9FD] rounded-xl flex items-center justify-between text-xs">
                <span className="text-[#787B86] font-medium">Estimated Total:</span>
                <span className="font-extrabold text-[#131722] text-sm tabular-nums">
                  ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <button
                type="submit"
                disabled={!canAfford || sharesNum <= 0}
                className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all shadow-md active:scale-98 ${
                  !canAfford || sharesNum <= 0
                    ? 'bg-[#B2B5BE] cursor-not-allowed'
                    : tradeAction === 'buy'
                    ? 'bg-[#089981] hover:bg-[#078570]'
                    : 'bg-[#F23645] hover:bg-[#d62837]'
                }`}
              >
                {!canAfford
                  ? tradeAction === 'buy'
                    ? 'Insufficient Buying Power'
                    : 'Insufficient Shares'
                  : `Confirm ${tradeAction.toUpperCase()} Order`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
