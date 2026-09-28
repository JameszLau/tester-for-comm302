import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { TradeIdea } from '../types';

export const IdeasScreen: React.FC = () => {
  const { ideas, likeIdea, addIdea, setSelectedAsset, allAssets } = useMarket();

  const [activeFilter, setActiveFilter] = useState<'All' | 'Bullish' | 'Bearish'>('All');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // New idea form state
  const [formSymbol, setFormSymbol] = useState('NVDA');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStance, setFormStance] = useState<'Bullish' | 'Bearish' | 'Neutral'>('Bullish');
  const [formTarget, setFormTarget] = useState('');
  const [formTimeframe, setFormTimeframe] = useState('2-4 weeks');

  const filteredIdeas = ideas.filter((idea) => {
    if (activeFilter === 'All') return true;
    return idea.stance === activeFilter;
  });

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) return;

    addIdea({
      author: 'James Lau',
      authorRole: 'Pro Member • Verified Trader',
      authorAvatar: '',
      symbol: formSymbol.toUpperCase(),
      title: formTitle,
      description: formDescription,
      stance: formStance,
      targetPrice: formTarget || 'N/A',
      timeframe: formTimeframe,
      chartTrend: formStance === 'Bullish' ? 'up' : 'down'
    });

    setIsPublishModalOpen(false);
    setFormTitle('');
    setFormDescription('');
    setFormTarget('');
  };

  return (
    <div className="flex flex-col w-full pb-12 px-4 pt-3">
      {/* Title & Action */}
      <div className="flex items-center justify-between pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#131722] tracking-tight">
            Trading Ideas & Analysis
          </h1>
          <p className="text-xs text-[#787B86] mt-0.5">
            Community setups, macro forecasts & technical breakdowns
          </p>
        </div>

        <button
          onClick={() => setIsPublishModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2962ff] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#0049db] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          Post Idea
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-3">
        {(['All', 'Bullish', 'Bearish'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              activeFilter === tab
                ? 'bg-[#131722] text-white shadow-sm'
                : 'bg-white text-[#787B86] border border-[#E0E3EB] hover:bg-[#F8F9FD]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Idea Cards List */}
      <div className="space-y-4">
        {filteredIdeas.map((idea) => {
          const isBullish = idea.stance === 'Bullish';
          return (
            <div
              key={idea.id}
              className="bg-white rounded-2xl border border-[#E0E3EB] p-4 shadow-sm space-y-3 hover:border-[#2962ff]/50 transition-colors"
            >
              {/* Author Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#ebedfa] text-[#0049db] flex items-center justify-center font-bold text-xs">
                    {idea.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#131722]">{idea.author}</h4>
                    <p className="text-[10px] text-[#787B86]">{idea.authorRole}</p>
                  </div>
                </div>

                <span className="text-[10px] text-[#787B86]">{idea.timestamp}</span>
              </div>

              {/* Ticker & Stance Pills */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    const match = allAssets.find((a) => a.symbol === idea.symbol);
                    if (match) setSelectedAsset(match);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F9FD] border border-[#E0E3EB] hover:border-[#2962ff] text-xs font-bold text-[#131722]"
                >
                  <span>{idea.symbol}</span>
                  <span className="material-symbols-outlined text-[14px] text-[#787B86]">
                    open_in_new
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isBullish
                        ? 'bg-[#E6F4F1] text-[#089981]'
                        : idea.stance === 'Bearish'
                        ? 'bg-[#FDEBED] text-[#F23645]'
                        : 'bg-[#ebedfa] text-[#5a5e6b]'
                    }`}
                  >
                    {idea.stance}
                  </span>
                  <span className="text-[11px] font-semibold text-[#131722]">
                    Target: {idea.targetPrice}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-sm font-bold text-[#131722] leading-snug">{idea.title}</h3>
                <p className="text-xs text-[#787B86] mt-1 leading-relaxed">{idea.description}</p>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E0E3EB]/70 text-xs">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => likeIdea(idea.id)}
                    className={`flex items-center gap-1 transition-colors ${
                      idea.liked
                        ? 'text-[#F23645] font-semibold'
                        : 'text-[#787B86] hover:text-[#F23645]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {idea.liked ? 'favorite' : 'favorite_border'}
                    </span>
                    <span>{idea.likes}</span>
                  </button>

                  <div className="flex items-center gap-1 text-[#787B86]">
                    <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                    <span>{idea.comments}</span>
                  </div>
                </div>

                <span className="text-[10px] text-[#787B86] font-medium">
                  Horizon: {idea.timeframe}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Publish Idea Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E0E3EB] p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0E3EB]">
              <h3 className="font-bold text-base text-[#131722]">Publish Trade Setup</h3>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="p-1 rounded-full text-[#787B86] hover:text-[#131722]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-4 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131722] mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    required
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value)}
                    placeholder="e.g. NVDA, AAPL, BTC/USD"
                    className="w-full px-3 py-2 bg-[#F8F9FD] border border-[#E0E3EB] rounded-lg text-xs font-bold text-[#131722] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131722] mb-1">
                    Bias / Stance
                  </label>
                  <select
                    value={formStance}
                    onChange={(e) => setFormStance(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F8F9FD] border border-[#E0E3EB] rounded-lg text-xs font-bold text-[#131722] outline-none"
                  >
                    <option value="Bullish">Bullish</option>
                    <option value="Bearish">Bearish</option>
                    <option value="Neutral">Neutral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131722] mb-1">
                  Idea Headline
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. NVDA: Bull Flag consolidation at key resistance"
                  className="w-full px-3 py-2 bg-[#F8F9FD] border border-[#E0E3EB] rounded-lg text-xs font-semibold text-[#131722] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131722] mb-1">
                  Analysis Details
                </label>
                <textarea
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Explain your technical levels, volume indicators, or catalyst..."
                  className="w-full px-3 py-2 bg-[#F8F9FD] border border-[#E0E3EB] rounded-lg text-xs text-[#131722] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131722] mb-1">
                    Target Price
                  </label>
                  <input
                    type="text"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    placeholder="e.g. $155.00"
                    className="w-full px-3 py-2 bg-[#F8F9FD] border border-[#E0E3EB] rounded-lg text-xs text-[#131722] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131722] mb-1">
                    Time Horizon
                  </label>
                  <input
                    type="text"
                    value={formTimeframe}
                    onChange={(e) => setFormTimeframe(e.target.value)}
                    placeholder="e.g. 2-4 weeks"
                    className="w-full px-3 py-2 bg-[#F8F9FD] border border-[#E0E3EB] rounded-lg text-xs text-[#131722] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#2962ff] hover:bg-[#0049db] text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Publish Idea
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
