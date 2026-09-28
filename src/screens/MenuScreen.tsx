import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';

export const MenuScreen: React.FC = () => {
  const {
    portfolioCash,
    positions,
    resetPortfolio,
    addFunds,
    alerts,
    removeAlert,
    allAssets,
    setSelectedAsset,
    setIsAccountOpen
  } = useMarket();

  // Mini Screener state
  const [screenerMinReturn, setScreenerMinReturn] = useState<number>(0);
  const [screenerMaxPE, setScreenerMaxPE] = useState<number>(100);

  const screenedStocks = allAssets.filter((a) => {
    if (a.type !== 'stock') return false;
    const passesReturn = a.changePercent >= screenerMinReturn;
    const passesPE = !a.peRatio || a.peRatio <= screenerMaxPE;
    return passesReturn && passesPE;
  });

  return (
    <div className="flex flex-col w-full pb-16 px-4 pt-3 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#131722] tracking-tight">
          Terminal Menu & Tools
        </h1>
        <p className="text-xs text-[#787B86] mt-0.5">
          Global market hours, screener, alerts & account settings
        </p>
      </div>

      {/* World Market Hours Status Card */}
      <div className="bg-white rounded-2xl border border-[#E0E3EB] p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E0E3EB]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2962ff]">schedule</span>
            <h3 className="text-xs font-bold text-[#131722] uppercase tracking-wider">
              Global Market Sessions
            </h3>
          </div>
          <span className="text-[10px] text-[#787B86]">Real-time clock</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 bg-[#F8F9FD] rounded-xl border border-[#E0E3EB]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-[#131722]">New York</span>
              <span className="w-2 h-2 rounded-full bg-[#089981]"></span>
            </div>
            <p className="text-[10px] text-[#089981] font-semibold">Open (09:30-16:00)</p>
            <p className="text-[10px] text-[#787B86]">NYSE • NASDAQ</p>
          </div>

          <div className="p-2.5 bg-[#F8F9FD] rounded-xl border border-[#E0E3EB]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-[#131722]">London</span>
              <span className="w-2 h-2 rounded-full bg-[#089981]"></span>
            </div>
            <p className="text-[10px] text-[#089981] font-semibold">Open (08:00-16:30)</p>
            <p className="text-[10px] text-[#787B86]">LSE</p>
          </div>

          <div className="p-2.5 bg-[#F8F9FD] rounded-xl border border-[#E0E3EB]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-[#131722]">Tokyo</span>
              <span className="w-2 h-2 rounded-full bg-[#B2B5BE]"></span>
            </div>
            <p className="text-[10px] text-[#787B86] font-semibold">Closed</p>
            <p className="text-[10px] text-[#787B86]">TSE • Nikkei</p>
          </div>

          <div className="p-2.5 bg-[#F8F9FD] rounded-xl border border-[#E0E3EB]">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-[#131722]">Crypto</span>
              <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse"></span>
            </div>
            <p className="text-[10px] text-[#089981] font-semibold">24/7/365 Open</p>
            <p className="text-[10px] text-[#787B86]">Global Liquidity</p>
          </div>
        </div>
      </div>

      {/* Stock Screener Mini Tool */}
      <div className="bg-white rounded-2xl border border-[#E0E3EB] p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E0E3EB]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2962ff]">filter_alt</span>
            <h3 className="text-xs font-bold text-[#131722] uppercase tracking-wider">
              Stock Screener
            </h3>
          </div>
          <span className="text-[10px] font-bold text-[#2962ff] bg-[#f1f3ff] px-2 py-0.5 rounded-full">
            {screenedStocks.length} matching stocks
          </span>
        </div>

        {/* Screener Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#131722] mb-1">
              <span className="text-[#787B86]">Minimum 1D Gain (%):</span>
              <span className="text-[#089981] font-bold tabular-nums">+{screenerMinReturn}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={screenerMinReturn}
              onChange={(e) => setScreenerMinReturn(parseFloat(e.target.value))}
              className="w-full accent-[#2962ff]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#131722] mb-1">
              <span className="text-[#787B86]">Max P/E Multiple:</span>
              <span className="text-[#131722] font-bold tabular-nums">{screenerMaxPE}x</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={screenerMaxPE}
              onChange={(e) => setScreenerMaxPE(parseFloat(e.target.value))}
              className="w-full accent-[#2962ff]"
            />
          </div>
        </div>

        {/* Screened results */}
        <div className="divide-y divide-[#E0E3EB]/60 pt-2">
          {screenedStocks.map((stock) => (
            <div
              key={stock.id}
              onClick={() => setSelectedAsset(stock)}
              className="py-2 flex items-center justify-between cursor-pointer hover:bg-[#F8F9FD] px-2 rounded-lg transition-colors"
            >
              <div>
                <span className="font-bold text-xs text-[#131722]">{stock.symbol}</span>
                <span className="text-[11px] text-[#787B86] ml-2">{stock.name}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#131722] tabular-nums">
                  ${stock.price.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-[#089981] tabular-nums ml-2">
                  +{stock.changePercent.toFixed(2)}%
                </span>
                <span className="text-[10px] text-[#787B86] ml-2">
                  P/E: {stock.peRatio || '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Price Alerts */}
      <div className="bg-white rounded-2xl border border-[#E0E3EB] p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E0E3EB]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2962ff]">notifications_active</span>
            <h3 className="text-xs font-bold text-[#131722] uppercase tracking-wider">
              Price Alerts Center ({alerts.length})
            </h3>
          </div>
        </div>

        {alerts.length === 0 ? (
          <p className="text-xs text-[#787B86] py-3 text-center">
            No price alerts configured. Tap the bell icon on any instrument detail view to set an alert.
          </p>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-2.5 bg-[#F8F9FD] rounded-xl border border-[#E0E3EB] flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2962ff] animate-pulse"></span>
                  <div>
                    <span className="text-xs font-bold text-[#131722]">{alert.symbol}</span>
                    <span className="text-xs text-[#787B86] ml-1.5">
                      {alert.condition} ${alert.targetPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#787B86]">{alert.createdAt}</span>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="text-[#787B86] hover:text-[#F23645] p-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paper Trading Account Card */}
      <div className="bg-white rounded-2xl border border-[#E0E3EB] p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E0E3EB]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2962ff]">account_balance_wallet</span>
            <h3 className="text-xs font-bold text-[#131722] uppercase tracking-wider">
              Paper Trading Simulation
            </h3>
          </div>
          <button
            onClick={() => setIsAccountOpen(true)}
            className="text-xs font-bold text-[#2962ff] hover:underline"
          >
            View Portfolio
          </button>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="text-[#787B86] block text-[11px]">Cash Balance</span>
            <span className="text-lg font-extrabold text-[#131722] tabular-nums">
              ${portfolioCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-[#787B86] block text-[11px]">Active Positions</span>
            <span className="text-lg font-extrabold text-[#131722] tabular-nums">
              {positions.length} holdings
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => addFunds(50000)}
            className="flex-1 py-2 bg-[#E6F4F1] hover:bg-[#d4eee8] text-[#089981] font-bold text-xs rounded-xl transition-colors"
          >
            Deposit $50,000
          </button>
          <button
            onClick={resetPortfolio}
            className="px-4 py-2 bg-[#F8F9FD] hover:bg-[#ebedfa] text-[#787B86] font-semibold text-xs rounded-xl border border-[#E0E3EB] transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* About Terminal Info */}
      <div className="p-4 bg-[#F8F9FD] rounded-2xl border border-[#E0E3EB] text-xs text-[#787B86] space-y-1">
        <div className="flex justify-between">
          <span>Terminal Version</span>
          <span className="font-semibold text-[#131722]">Apex Market Terminal 2.4</span>
        </div>
        <div className="flex justify-between">
          <span>Data Feed</span>
          <span className="font-semibold text-[#089981]">Ultra-Low Latency Live</span>
        </div>
        <div className="flex justify-between">
          <span>Trading Mode</span>
          <span className="font-semibold text-[#2962ff]">Real-Time Paper Trading</span>
        </div>
      </div>
    </div>
  );
};
