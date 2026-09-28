import React from 'react';
import { useMarket } from '../context/MarketContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useMarket();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-[#2962ff] bg-white';
        let icon = 'info';
        let iconColor = 'text-[#2962ff]';

        if (toast.type === 'success') {
          borderClass = 'border-[#089981] bg-white';
          icon = 'check_circle';
          iconColor = 'text-[#089981]';
        } else if (toast.type === 'warning') {
          borderClass = 'border-[#ba1a1a] bg-white';
          icon = 'warning';
          iconColor = 'text-[#ba1a1a]';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3 rounded-xl border shadow-xl ${borderClass} animate-in fade-in slide-in-from-bottom-3 duration-200`}
          >
            <div className="flex items-center gap-2.5">
              <span className={`material-symbols-outlined text-[20px] ${iconColor}`}>
                {icon}
              </span>
              <div>
                <p className="text-xs font-bold text-[#131722]">{toast.title}</p>
                <p className="text-[11px] text-[#787B86]">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#787B86] hover:text-[#131722] p-1 ml-2"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
