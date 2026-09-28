import React from 'react';
import { useMarket } from '../context/MarketContext';
import { MarketAsset } from '../types';

export const QuickTickerRibbon: React.FC = () => {
  const { majorIndices, cryptoSpotlight, usStocks, commoditiesForex, setSelectedAsset, recentTicks } = useMarket();

  // Pick top quick tickers
  const spx = majorIndices.find((i) => i.id === 'spx');
  const ndx = majorIndices.find((i) => i.id === 'ndx');
  const dji = majorIndices.find((i) => i.id === 'dji');
  const btc = cryptoSpotlight.find((c) => c.id === 'btc');
  const eurusd = commoditiesForex.find((f) => f.id === 'eurusd');
  const nvda = usStocks.find((s) => s.id === 'nvda');
  const tsla = usStocks.find((s) => s.id === 'tsla');
  const gold = commoditiesForex.find((c) => c.id === 'gc1');

  const ribbonItems: (MarketAsset | undefined)[] = [spx, ndx, dji, btc, eurusd, nvda, tsla, gold];

  const handleAssetClick = (asset?: MarketAsset) => {
    if (asset) setSelectedAsset(asset);
  };

  return (
    <div className="overflow-x-auto no-scrollbar py-2 px-4 flex items-center gap-2 border-b border-[#E0E3EB]/50 bg-white/40">
      {ribbonItems.filter(Boolean).map((asset) => {
        if (!asset) return null;
        const isPositive = asset.changePercent >= 0;
        const tickDir = recentTicks[asset.id];

        let tickClass = '';
        if (tickDir === 'up') tickClass = 'bg-[#E6F4F1] border-[#089981]/50';
        if (tickDir === 'down') tickClass = 'bg-[#FDEBED] border-[#F23645]/50';

        return (
          <button
            key={asset.id}
            onClick={() => handleAssetClick(asset)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#E0E3EB]/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] shrink-0 transition-all duration-300 hover:border-[#2962ff] active:scale-98 ${tickClass}`}
          >
            <span className="text-[11px] font-semibold text-[#787B86] uppercase tracking-wider">
              {asset.symbol.split('/')[0]}
            </span>
            <span className="text-[13px] font-semibold text-[#131722] tabular-nums">
              {asset.price > 1000
                ? asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : asset.price.toFixed(asset.price < 5 ? 4 : 2)}
            </span>
            <span
              className={`text-[11px] font-semibold tabular-nums ${
                isPositive ? 'text-[#089981]' : 'text-[#F23645]'
              }`}
            >
              {isPositive ? '+' : ''}
              {asset.changePercent.toFixed(2)}%
            </span>
          </button>
        );
      })}
    </div>
  );
};
