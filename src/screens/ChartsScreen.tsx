import React, { useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { MarketAsset } from '../types';

export const ChartsScreen: React.FC = () => {
  const { allAssets, setSelectedAsset, executeTrade, portfolioCash } = useMarket();

  const [activeSymbol, setActiveSymbol] = useState<string>('NVDA');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1H' | '4H' | '1D' | '1W'>('1D');
  const [chartMode, setChartMode] = useState<'candle' | 'line'>('candle');
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showMA, setShowMA] = useState<boolean>(true);
  const [hoverBarIndex, setHoverBarIndex] = useState<number | null>(null);

  // Active asset
  const currentAsset = useMemo(() => {
    return allAssets.find((a) => a.symbol === activeSymbol) || allAssets[0];
  }, [allAssets, activeSymbol]);

  // Generate multi-period candlestick bars
  const bars = useMemo(() => {
    if (!currentAsset) return [];
    const count = 38;
    const base = currentAsset.price;
    const volatility = base * 0.012;
    const result = [];
    let prevClose = base * 0.96;

    for (let i = 0; i < count; i++) {
      const trend = (i / count) * (base * 0.05);
      const randomNoise = (Math.random() - 0.47) * volatility;
      const open = prevClose;
      const close = i === count - 1 ? base : Math.max(0.1, open + randomNoise + (Math.sin(i * 0.5) * volatility * 0.4));
      const high = Math.max(open, close) + Math.random() * (volatility * 0.6);
      const low = Math.min(open, close) - Math.random() * (volatility * 0.6);
      const volume = Math.floor(Math.random() * 850000 + 150000);

      prevClose = close;
      result.push({
        index: i,
        time: `${9 + Math.floor(i / 6)}:${((i % 6) * 10) || '00'}`,
        open,
        high,
        low,
        close,
        volume,
        isBullish: close >= open
      });
    }

    return result;
  }, [currentAsset, timeframe]);

  // Moving average calculation (MA 9)
  const maPoints = useMemo(() => {
    const period = 9;
    return bars.map((bar, idx) => {
      if (idx < period - 1) return null;
      const slice = bars.slice(idx - period + 1, idx + 1);
      const avg = slice.reduce((sum, b) => sum + b.close, 0) / period;
      return avg;
    });
  }, [bars]);

  const activeBar = hoverBarIndex !== null ? bars[hoverBarIndex] : bars[bars.length - 1];

  // Min and max for chart scaling
  const minPrice = Math.min(...bars.map((b) => b.low));
  const maxPrice = Math.max(...bars.map((b) => b.high));
  const priceRange = maxPrice - minPrice || 1;
  const maxVol = Math.max(...bars.map((b) => b.volume)) || 1;

  const chartWidth = 720;
  const chartHeight = 280;
  const priceHeight = showVolume ? 200 : 260;

  return (
    <div className="flex flex-col w-full pb-12 px-4 pt-3">
      {/* Top Chart Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E0E3EB]">
        {/* Symbol Selector */}
        <div className="flex items-center gap-2">
          <select
            value={activeSymbol}
            onChange={(e) => setActiveSymbol(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#E0E3EB] rounded-xl font-bold text-sm text-[#131722] outline-none shadow-sm cursor-pointer"
          >
            <option value="NVDA">NVDA • NVIDIA Corp.</option>
            <option value="AAPL">AAPL • Apple Inc.</option>
            <option value="TSLA">TSLA • Tesla, Inc.</option>
            <option value="BTC/USD">BTC/USD • Bitcoin</option>
            <option value="ETH/USD">ETH/USD • Ethereum</option>
            <option value="S&P 500">SPX • S&P 500 Index</option>
            <option value="Nasdaq 100">NDX • Nasdaq 100</option>
            <option value="GC1!">GC1! • Gold Futures</option>
          </select>

          {currentAsset && (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded tabular-nums ${
                currentAsset.changePercent >= 0
                  ? 'bg-[#E6F4F1] text-[#089981]'
                  : 'bg-[#FDEBED] text-[#F23645]'
              }`}
            >
              {currentAsset.changePercent >= 0 ? '+' : ''}
              {currentAsset.changePercent.toFixed(2)}%
            </span>
          )}
        </div>

        {/* Chart View & Indicators controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setChartMode(chartMode === 'candle' ? 'line' : 'candle')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 ${
              chartMode === 'candle'
                ? 'bg-[#131722] text-white border-transparent'
                : 'bg-white text-[#787B86] border-[#E0E3EB]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {chartMode === 'candle' ? 'candlestick_chart' : 'show_chart'}
            </span>
            {chartMode === 'candle' ? 'Candles' : 'Line'}
          </button>

          <button
            onClick={() => setShowMA(!showMA)}
            className={`px-2 py-1 text-xs font-semibold rounded-lg border transition-colors ${
              showMA
                ? 'bg-[#2962ff]/10 text-[#2962ff] border-[#2962ff]/30'
                : 'bg-white text-[#787B86] border-[#E0E3EB]'
            }`}
          >
            MA 9
          </button>

          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-1 text-xs font-semibold rounded-lg border transition-colors ${
              showVolume
                ? 'bg-[#2962ff]/10 text-[#2962ff] border-[#2962ff]/30'
                : 'bg-white text-[#787B86] border-[#E0E3EB]'
            }`}
          >
            Vol
          </button>
        </div>
      </div>

      {/* Timeframe Bar */}
      <div className="flex items-center justify-between py-2 border-b border-[#E0E3EB] overflow-x-auto no-scrollbar">
        {(['1m', '5m', '15m', '1H', '4H', '1D', '1W'] as const).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 rounded-md text-xs font-semibold uppercase transition-colors ${
              timeframe === tf
                ? 'bg-[#2962ff] text-white shadow-sm'
                : 'text-[#787B86] hover:text-[#131722] hover:bg-white'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* OHLC Bar Metrics Data Stream */}
      {activeBar && (
        <div className="py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs tabular-nums text-[#787B86] font-medium border-b border-[#E0E3EB]/60">
          <span>Time: <strong className="text-[#131722]">{activeBar.time}</strong></span>
          <span>O: <strong className="text-[#131722]">${activeBar.open.toFixed(2)}</strong></span>
          <span>H: <strong className="text-[#089981]">${activeBar.high.toFixed(2)}</strong></span>
          <span>L: <strong className="text-[#F23645]">${activeBar.low.toFixed(2)}</strong></span>
          <span>C: <strong className="text-[#131722]">${activeBar.close.toFixed(2)}</strong></span>
          <span>Vol: <strong className="text-[#131722]">{(activeBar.volume / 1000).toFixed(0)}k</strong></span>
        </div>
      )}

      {/* Main Chart Canvas Container */}
      <div className="bg-white rounded-2xl border border-[#E0E3EB] p-3 shadow-sm mt-3 relative overflow-hidden">
        <div className="w-full relative">
          <svg
            className="w-full h-72 cursor-crosshair select-none"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const idx = Math.floor(ratio * (bars.length - 1));
              setHoverBarIndex(idx);
            }}
            onMouseLeave={() => setHoverBarIndex(null)}
          >
            <defs>
              <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2962ff" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2962ff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1="0" y1="40" x2={chartWidth} y2="40" stroke="#f1f3ff" strokeWidth="1" />
            <line x1="0" y1="90" x2={chartWidth} y2="90" stroke="#f1f3ff" strokeWidth="1" />
            <line x1="0" y1="140" x2={chartWidth} y2="140" stroke="#f1f3ff" strokeWidth="1" />
            <line x1="0" y1="190" x2={chartWidth} y2="190" stroke="#f1f3ff" strokeWidth="1" />

            {/* Volume bars (bottom) */}
            {showVolume &&
              bars.map((bar, i) => {
                const step = chartWidth / bars.length;
                const x = i * step + step * 0.15;
                const width = step * 0.7;
                const volHeight = (bar.volume / maxVol) * 55;
                const y = chartHeight - volHeight;
                return (
                  <rect
                    key={`vol-${i}`}
                    x={x}
                    y={y}
                    width={width}
                    height={volHeight}
                    fill={bar.isBullish ? '#089981' : '#F23645'}
                    opacity={0.3}
                    rx={1}
                  />
                );
              })}

            {/* Chart rendering: Candlestick or Line */}
            {chartMode === 'candle' ? (
              bars.map((bar, i) => {
                const step = chartWidth / bars.length;
                const x = i * step + step / 2;
                const yHigh = priceHeight - 20 - ((bar.high - minPrice) / priceRange) * (priceHeight - 40);
                const yLow = priceHeight - 20 - ((bar.low - minPrice) / priceRange) * (priceHeight - 40);
                const yOpen = priceHeight - 20 - ((bar.open - minPrice) / priceRange) * (priceHeight - 40);
                const yClose = priceHeight - 20 - ((bar.close - minPrice) / priceRange) * (priceHeight - 40);
                const candleColor = bar.isBullish ? '#089981' : '#F23645';
                const bodyWidth = Math.max(3, step * 0.65);

                return (
                  <g key={`candle-${i}`}>
                    {/* Wick */}
                    <line
                      x1={x}
                      y1={yHigh}
                      x2={x}
                      y2={yLow}
                      stroke={candleColor}
                      strokeWidth="1.2"
                    />
                    {/* Body */}
                    <rect
                      x={x - bodyWidth / 2}
                      y={Math.min(yOpen, yClose)}
                      width={bodyWidth}
                      height={Math.max(2, Math.abs(yClose - yOpen))}
                      fill={candleColor}
                      rx={1}
                    />
                  </g>
                );
              })
            ) : (
              /* Line chart */
              <>
                {(() => {
                  const step = chartWidth / bars.length;
                  const pathD = bars
                    .map((b, i) => {
                      const x = i * step + step / 2;
                      const y = priceHeight - 20 - ((b.close - minPrice) / priceRange) * (priceHeight - 40);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    })
                    .join(' ');

                  return (
                    <>
                      <path
                        d={`${pathD} L ${chartWidth} ${priceHeight} L 0 ${priceHeight} Z`}
                        fill="url(#chartAreaGrad)"
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#2962ff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  );
                })()}
              </>
            )}

            {/* Moving Average Line overlay */}
            {showMA && (
              <path
                d={bars
                  .map((_, i) => {
                    const ma = maPoints[i];
                    if (ma === null) return null;
                    const step = chartWidth / bars.length;
                    const x = i * step + step / 2;
                    const y = priceHeight - 20 - ((ma - minPrice) / priceRange) * (priceHeight - 40);
                    return `${i === 8 ? 'M' : 'L'} ${x} ${y}`;
                  })
                  .filter(Boolean)
                  .join(' ')}
                fill="none"
                stroke="#9e3500"
                strokeWidth="1.8"
                strokeDasharray="4 2"
              />
            )}

            {/* Crosshair lines */}
            {hoverBarIndex !== null && (
              <>
                <line
                  x1={(hoverBarIndex / (bars.length - 1)) * chartWidth}
                  y1="0"
                  x2={(hoverBarIndex / (bars.length - 1)) * chartWidth}
                  y2={chartHeight}
                  stroke="#787B86"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              </>
            )}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-[#787B86] pt-2 border-t border-[#E0E3EB]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-[#089981] rounded-sm"></span> Bullish
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-[#F23645] rounded-sm"></span> Bearish
            </span>
            {showMA && (
              <span className="flex items-center gap-1 text-[#9e3500] font-semibold">
                — MA (9)
              </span>
            )}
          </div>
          <span>Interactive Crosshair Active</span>
        </div>
      </div>

      {/* Quick Trade Drawer at bottom of chart */}
      <div className="bg-white rounded-2xl border border-[#E0E3EB] p-4 mt-4 shadow-sm flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-[#787B86] font-medium block">
            Paper Trading Balance
          </span>
          <span className="text-base font-extrabold text-[#131722] tabular-nums">
            ${portfolioCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentAsset) setSelectedAsset(currentAsset);
            }}
            className="px-4 py-2 bg-[#089981] hover:bg-[#078570] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Trade {currentAsset?.symbol}
          </button>
        </div>
      </div>
    </div>
  );
};
