import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';

export const CalendarModal: React.FC = () => {
  const { isCalendarOpen, setIsCalendarOpen, earningsEvents, economicEvents } = useMarket();
  const [activeTab, setActiveTab] = useState<'earnings' | 'economic'>('earnings');

  if (!isCalendarOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E0E3EB] overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E0E3EB] flex items-center justify-between bg-[#F8F9FD]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2962ff] text-[24px]">calendar_month</span>
            <h3 className="font-bold text-base text-[#131722]">Market Calendar</h3>
          </div>
          <button
            onClick={() => setIsCalendarOpen(false)}
            className="p-1 rounded-full text-[#787B86] hover:text-[#131722]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E0E3EB] bg-white">
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors ${
              activeTab === 'earnings'
                ? 'border-[#2962ff] text-[#2962ff]'
                : 'border-transparent text-[#787B86] hover:text-[#131722]'
            }`}
          >
            Earnings Calendar
          </button>
          <button
            onClick={() => setActiveTab('economic')}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors ${
              activeTab === 'economic'
                ? 'border-[#2962ff] text-[#2962ff]'
                : 'border-transparent text-[#787B86] hover:text-[#131722]'
            }`}
          >
            Economic Releases
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'earnings' ? (
            <div className="space-y-2.5">
              {earningsEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 bg-[#F8F9FD] rounded-xl border border-[#E0E3EB] flex items-center justify-between hover:border-[#2962ff] transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#131722]">{event.symbol}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          event.timing === 'Pre-market'
                            ? 'bg-[#E6F4F1] text-[#089981]'
                            : 'bg-[#ebedfa] text-[#434656]'
                        }`}
                      >
                        {event.timing}
                      </span>
                      <span className="text-[10px] text-[#787B86]">{event.reportDate}</span>
                    </div>
                    <p className="text-xs text-[#787B86] mt-0.5">{event.companyName}</p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-[#787B86]">
                      Est. <span className="font-semibold text-[#131722]">{event.estimate}</span>
                    </div>
                    <div className="text-xs font-bold text-[#089981]">
                      Act. <span>{event.actual}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {economicEvents.map((eco) => (
                <div
                  key={eco.id}
                  className="p-3 bg-[#F8F9FD] rounded-xl border border-[#E0E3EB] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-4 rounded bg-[#E0E3EB] flex items-center justify-center text-[10px] font-bold text-[#131722]">
                        {eco.country}
                      </span>
                      <span className="font-bold text-xs text-[#131722]">{eco.event}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#787B86] mt-1">
                      <span>{eco.time}</span>
                      <span>•</span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-semibold text-[10px] ${
                          eco.impact === 'High'
                            ? 'bg-[#FDEBED] text-[#F23645]'
                            : 'bg-[#ebedfa] text-[#787B86]'
                        }`}
                      >
                        {eco.impact} Impact
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <div>
                      <span className="text-[#787B86]">Forecast: </span>
                      <span className="font-semibold text-[#131722]">{eco.forecast}</span>
                    </div>
                    <div>
                      <span className="text-[#787B86]">Previous: </span>
                      <span className="font-medium text-[#787B86]">{eco.previous}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
