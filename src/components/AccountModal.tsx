import React from 'react';
import { useMarket } from '../context/MarketContext';

export const AccountModal: React.FC = () => {
  const {
    isAccountOpen,
    setIsAccountOpen,
    portfolioCash,
    positions,
    resetPortfolio,
    addFunds,
    setSelectedAsset,
    allAssets
  } = useMarket();

  if (!isAccountOpen) return null;

  const totalPositionsValue = positions.reduce((acc, p) => acc + p.marketValue, 0);
  const totalAccountValue = portfolioCash + totalPositionsValue;
  const totalCostBasis = positions.reduce((acc, p) => acc + p.totalCost, 0);
  const totalUnrealizedPnL = totalPositionsValue - totalCostBasis;
  const totalPnLPct = totalCostBasis > 0 ? (totalUnrealizedPnL / totalCostBasis) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E0E3EB] overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E0E3EB] flex items-center justify-between bg-[#F8F9FD]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0049db] text-white flex items-center justify-center font-bold text-sm">
              JL
            </div>
            <div>
              <h3 className="font-bold text-base text-[#131722]">Paper Trading Account</h3>
              <p className="text-xs text-[#787B86]">jameszlau.JLWF@gmail.com • Simulated</p>
            </div>
          </div>
          <button
            onClick={() => setIsAccountOpen(false)}
            className="p-1 rounded-full text-[#787B86] hover:text-[#131722]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Net Worth Card */}
          <div className="p-4 bg-gradient-to-br from-[#131722] to-[#2d303a] rounded-2xl text-white shadow-lg space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B2B5BE]">
              Total Portfolio Net Worth
            </span>
            <div className="text-3xl font-extrabold tracking-tight tabular-nums">
              ${totalAccountValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <div>
                <span className="text-[#B2B5BE] block text-[10px]">Unrealized P&L</span>
                <span
                  className={`font-bold tabular-nums ${
                    totalUnrealizedPnL >= 0 ? 'text-[#089981]' : 'text-[#F23645]'
                  }`}
                >
                  {totalUnrealizedPnL >= 0 ? '+' : ''}${totalUnrealizedPnL.toFixed(2)} (
                  {totalUnrealizedPnL >= 0 ? '+' : ''}
                  {totalPnLPct.toFixed(2)}%)
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#B2B5BE] block text-[10px]">Available Cash</span>
                <span className="font-bold text-white tabular-nums">
                  ${portfolioCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Add Cash / Reset) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => addFunds(25000)}
              className="flex-1 py-2 px-3 bg-[#E6F4F1] hover:bg-[#d0eee8] text-[#089981] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              Add $25,000 Cash
            </button>
            <button
              onClick={resetPortfolio}
              className="py-2 px-3 bg-[#F8F9FD] hover:bg-[#ebedfa] text-[#787B86] hover:text-[#131722] font-semibold text-xs rounded-xl flex items-center justify-center gap-1 border border-[#E0E3EB] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Reset
            </button>
          </div>

          {/* Open Positions List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#131722] uppercase tracking-wider">
                Open Positions ({positions.length})
              </h4>
            </div>

            {positions.length === 0 ? (
              <div className="p-8 text-center bg-[#F8F9FD] rounded-xl border border-[#E0E3EB] text-[#787B86] text-xs">
                No active positions. Select any stock or crypto from the terminal to trade!
              </div>
            ) : (
              <div className="space-y-2">
                {positions.map((pos) => {
                  const isPos = pos.unrealizedPnL >= 0;
                  return (
                    <div
                      key={pos.symbol}
                      onClick={() => {
                        const asset = allAssets.find((a) => a.symbol === pos.symbol);
                        if (asset) {
                          setSelectedAsset(asset);
                          setIsAccountOpen(false);
                        }
                      }}
                      className="p-3 bg-[#F8F9FD] hover:bg-[#ebedfa] rounded-xl border border-[#E0E3EB] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[#131722]">{pos.symbol}</span>
                          <span className="text-xs text-[#787B86]">({pos.shares} sh)</span>
                        </div>
                        <p className="text-[11px] text-[#787B86]">
                          Avg: ${pos.avgPrice.toFixed(2)} • Last: ${pos.currentPrice.toFixed(2)}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-semibold text-[#131722] tabular-nums">
                          ${pos.marketValue.toFixed(2)}
                        </div>
                        <div
                          className={`text-xs font-semibold tabular-nums ${
                            isPos ? 'text-[#089981]' : 'text-[#F23645]'
                          }`}
                        >
                          {isPos ? '+' : ''}${pos.unrealizedPnL.toFixed(2)} ({isPos ? '+' : ''}
                          {pos.unrealizedPnLPercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
