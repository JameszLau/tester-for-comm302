import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { MarketAsset, EarningsEvent, EconomicEvent, TradeIdea, PriceAlert, PortfolioPosition } from '../types';
import {
  INITIAL_MAJOR_INDICES,
  INITIAL_WORLD_INDICES,
  INITIAL_US_STOCKS,
  INITIAL_CRYPTO_SPOTLIGHT,
  INITIAL_COMMODITIES_FOREX,
  INITIAL_EARNINGS_EVENTS,
  INITIAL_ECONOMIC_EVENTS,
  INITIAL_IDEAS
} from '../data/marketData';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
}

interface MarketContextType {
  // Navigation & modals
  activeTab: 'markets' | 'watchlist' | 'charts' | 'ideas' | 'menu';
  setActiveTab: (tab: 'markets' | 'watchlist' | 'charts' | 'ideas' | 'menu') => void;
  selectedAsset: MarketAsset | null;
  setSelectedAsset: (asset: MarketAsset | null) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (open: boolean) => void;
  isAccountOpen: boolean;
  setIsAccountOpen: (open: boolean) => void;
  
  // Market Data
  majorIndices: MarketAsset[];
  worldIndices: MarketAsset[];
  usStocks: MarketAsset[];
  cryptoSpotlight: MarketAsset[];
  commoditiesForex: MarketAsset[];
  earningsEvents: EarningsEvent[];
  economicEvents: EconomicEvent[];
  ideas: TradeIdea[];
  recentTicks: Record<string, 'up' | 'down'>;
  
  // Watchlist
  watchlistIds: string[];
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
  
  // Portfolio & Paper Trading
  portfolioCash: number;
  positions: PortfolioPosition[];
  executeTrade: (symbol: string, name: string, type: 'buy' | 'sell', shares: number, price: number) => boolean;
  resetPortfolio: () => void;
  addFunds: (amount: number) => void;
  
  // Ideas
  likeIdea: (id: string) => void;
  addIdea: (idea: Omit<TradeIdea, 'id' | 'likes' | 'comments' | 'timestamp'>) => void;
  
  // Alerts
  alerts: PriceAlert[];
  addAlert: (symbol: string, condition: 'above' | 'below', targetPrice: number) => void;
  removeAlert: (id: string) => void;
  
  // Toasts
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;
  
  // Helpers
  allAssets: MarketAsset[];
  getAssetBySymbol: (symbol: string) => MarketAsset | undefined;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'markets' | 'watchlist' | 'charts' | 'ideas' | 'menu'>('markets');
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const [majorIndices, setMajorIndices] = useState<MarketAsset[]>(INITIAL_MAJOR_INDICES);
  const [worldIndices, setWorldIndices] = useState<MarketAsset[]>(INITIAL_WORLD_INDICES);
  const [usStocks, setUsStocks] = useState<MarketAsset[]>(INITIAL_US_STOCKS);
  const [cryptoSpotlight, setCryptoSpotlight] = useState<MarketAsset[]>(INITIAL_CRYPTO_SPOTLIGHT);
  const [commoditiesForex, setCommoditiesForex] = useState<MarketAsset[]>(INITIAL_COMMODITIES_FOREX);
  const [earningsEvents] = useState<EarningsEvent[]>(INITIAL_EARNINGS_EVENTS);
  const [economicEvents] = useState<EconomicEvent[]>(INITIAL_ECONOMIC_EVENTS);
  const [ideas, setIdeas] = useState<TradeIdea[]>(INITIAL_IDEAS);

  const [recentTicks, setRecentTicks] = useState<Record<string, 'up' | 'down'>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Watchlist default symbols
  const [watchlistIds, setWatchlistIds] = useState<string[]>(['nvda', 'aapl', 'tsla', 'btc', 'spx']);

  // Portfolio state
  const [portfolioCash, setPortfolioCash] = useState<number>(125480.00);
  const [positions, setPositions] = useState<PortfolioPosition[]>([
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corp.',
      shares: 40,
      avgPrice: 122.50,
      currentPrice: 138.25,
      totalCost: 4900.00,
      marketValue: 5530.00,
      unrealizedPnL: 630.00,
      unrealizedPnLPercent: 12.86
    },
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 25,
      avgPrice: 224.00,
      currentPrice: 231.40,
      totalCost: 5600.00,
      marketValue: 5785.00,
      unrealizedPnL: 185.00,
      unrealizedPnLPercent: 3.30
    },
    {
      symbol: 'BTC/USD',
      name: 'Bitcoin',
      shares: 0.35,
      avgPrice: 62400.00,
      currentPrice: 67840.50,
      totalCost: 21840.00,
      marketValue: 23744.18,
      unrealizedPnL: 1904.18,
      unrealizedPnLPercent: 8.72
    }
  ]);

  // Alerts
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: 'alert-1',
      symbol: 'NVDA',
      condition: 'above',
      targetPrice: 140.00,
      createdAt: 'Today',
      active: true
    },
    {
      id: 'alert-2',
      symbol: 'BTC/USD',
      condition: 'above',
      targetPrice: 70000.00,
      createdAt: 'Yesterday',
      active: true
    }
  ]);

  // Toast dispatch
  const addToast = (type: 'success' | 'info' | 'warning', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // All Assets flat list
  const allAssets = useMemo(() => {
    return [
      ...majorIndices,
      ...worldIndices,
      ...usStocks,
      ...cryptoSpotlight,
      ...commoditiesForex
    ];
  }, [majorIndices, worldIndices, usStocks, cryptoSpotlight, commoditiesForex]);

  const getAssetBySymbol = (symbol: string) => {
    return allAssets.find(
      (a) => a.symbol.toLowerCase() === symbol.toLowerCase() || a.id.toLowerCase() === symbol.toLowerCase()
    );
  };

  // Watchlist helpers
  const addToWatchlist = (id: string) => {
    if (!watchlistIds.includes(id)) {
      setWatchlistIds((prev) => [...prev, id]);
      const asset = allAssets.find((a) => a.id === id);
      addToast('success', 'Added to Watchlist', `${asset?.symbol || id} is now tracked.`);
    }
  };

  const removeFromWatchlist = (id: string) => {
    setWatchlistIds((prev) => prev.filter((item) => item !== id));
    const asset = allAssets.find((a) => a.id === id);
    addToast('info', 'Removed from Watchlist', `${asset?.symbol || id} removed.`);
  };

  const isInWatchlist = (id: string) => watchlistIds.includes(id);

  // Trading engine
  const executeTrade = (
    symbol: string,
    name: string,
    type: 'buy' | 'sell',
    shares: number,
    price: number
  ): boolean => {
    const totalAmount = shares * price;

    if (type === 'buy') {
      if (portfolioCash < totalAmount) {
        addToast('warning', 'Insufficient Funds', `You need $${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} but have $${portfolioCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
        return false;
      }

      setPortfolioCash((prev) => prev - totalAmount);

      setPositions((prev) => {
        const existing = prev.find((p) => p.symbol === symbol);
        if (existing) {
          const newShares = existing.shares + shares;
          const newCost = existing.totalCost + totalAmount;
          const newAvgPrice = newCost / newShares;
          const newMarketValue = newShares * price;
          return prev.map((p) =>
            p.symbol === symbol
              ? {
                  ...p,
                  shares: newShares,
                  avgPrice: newAvgPrice,
                  totalCost: newCost,
                  currentPrice: price,
                  marketValue: newMarketValue,
                  unrealizedPnL: newMarketValue - newCost,
                  unrealizedPnLPercent: ((newMarketValue - newCost) / newCost) * 100
                }
              : p
          );
        } else {
          return [
            ...prev,
            {
              symbol,
              name,
              shares,
              avgPrice: price,
              currentPrice: price,
              totalCost: totalAmount,
              marketValue: totalAmount,
              unrealizedPnL: 0,
              unrealizedPnLPercent: 0
            }
          ];
        }
      });

      addToast('success', 'Order Filled', `Bought ${shares} shares of ${symbol} at $${price.toFixed(2)}`);
      return true;
    } else {
      // Sell
      const existing = positions.find((p) => p.symbol === symbol);
      if (!existing || existing.shares < shares) {
        addToast('warning', 'Invalid Sell Order', `You only hold ${existing?.shares || 0} shares of ${symbol}`);
        return false;
      }

      setPortfolioCash((prev) => prev + totalAmount);

      setPositions((prev) => {
        return prev
          .map((p) => {
            if (p.symbol === symbol) {
              const remainingShares = p.shares - shares;
              if (remainingShares <= 0.0001) {
                return null;
              }
              const costBasisOfSold = (p.totalCost / p.shares) * shares;
              const newCost = p.totalCost - costBasisOfSold;
              const newMarketVal = remainingShares * price;
              return {
                ...p,
                shares: remainingShares,
                totalCost: newCost,
                currentPrice: price,
                marketValue: newMarketVal,
                unrealizedPnL: newMarketVal - newCost,
                unrealizedPnLPercent: ((newMarketVal - newCost) / newCost) * 100
              };
            }
            return p;
          })
          .filter(Boolean) as PortfolioPosition[];
      });

      addToast('success', 'Order Filled', `Sold ${shares} shares of ${symbol} at $${price.toFixed(2)}`);
      return true;
    }
  };

  const resetPortfolio = () => {
    setPortfolioCash(100000);
    setPositions([]);
    addToast('info', 'Portfolio Reset', 'Paper trading account reset to $100,000.00');
  };

  const addFunds = (amount: number) => {
    setPortfolioCash((prev) => prev + amount);
    addToast('success', 'Deposit Completed', `Added $${amount.toLocaleString()} in simulated funds.`);
  };

  // Ideas
  const likeIdea = (id: string) => {
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === id) {
          const liked = !idea.liked;
          return {
            ...idea,
            liked,
            likes: liked ? idea.likes + 1 : idea.likes - 1
          };
        }
        return idea;
      })
    );
  };

  const addIdea = (newIdea: Omit<TradeIdea, 'id' | 'likes' | 'comments' | 'timestamp'>) => {
    const idea: TradeIdea = {
      ...newIdea,
      id: 'idea-' + Date.now(),
      likes: 1,
      comments: 0,
      timestamp: 'Just now',
      liked: true
    };
    setIdeas((prev) => [idea, ...prev]);
    addToast('success', 'Idea Published', 'Your analysis was shared with the market community.');
  };

  // Alerts
  const addAlert = (symbol: string, condition: 'above' | 'below', targetPrice: number) => {
    const alert: PriceAlert = {
      id: 'alert-' + Date.now(),
      symbol,
      condition,
      targetPrice,
      createdAt: 'Just now',
      active: true
    };
    setAlerts((prev) => [alert, ...prev]);
    addToast('success', 'Alert Created', `Notification set for ${symbol} ${condition} $${targetPrice}`);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Live real-time price fluctuation simulator
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick 1-2 random stocks or crypto to fluctuate slightly
      const categoryDice = Math.random();
      let updatedId = '';
      let direction: 'up' | 'down' = 'up';

      if (categoryDice < 0.4) {
        // US Stocks
        setUsStocks((prev) => {
          const randomIndex = Math.floor(Math.random() * prev.length);
          const asset = prev[randomIndex];
          const deltaPct = (Math.random() * 0.3 - 0.14) / 100;
          const newPrice = Math.max(0.1, Number((asset.price * (1 + deltaPct)).toFixed(2)));
          const priceDiff = newPrice - asset.price;
          direction = priceDiff >= 0 ? 'up' : 'down';
          updatedId = asset.id;

          return prev.map((item, idx) => {
            if (idx === randomIndex) {
              const newChange = Number((item.change + priceDiff).toFixed(2));
              const newChgPct = Number(((newChange / (item.price - item.change)) * 100).toFixed(2));
              const newSparkline = [...item.sparkline.slice(1), newPrice];
              return {
                ...item,
                price: newPrice,
                change: newChange,
                changePercent: newChgPct,
                sparkline: newSparkline
              };
            }
            return item;
          });
        });
      } else if (categoryDice < 0.7) {
        // Crypto
        setCryptoSpotlight((prev) => {
          const randomIndex = Math.floor(Math.random() * prev.length);
          const asset = prev[randomIndex];
          const deltaPct = (Math.random() * 0.4 - 0.18) / 100;
          const newPrice = Math.max(0.1, Number((asset.price * (1 + deltaPct)).toFixed(2)));
          const priceDiff = newPrice - asset.price;
          direction = priceDiff >= 0 ? 'up' : 'down';
          updatedId = asset.id;

          return prev.map((item, idx) => {
            if (idx === randomIndex) {
              const newChange = Number((item.change + priceDiff).toFixed(2));
              const newChgPct = Number(((newChange / (item.price - item.change)) * 100).toFixed(2));
              const newSparkline = [...item.sparkline.slice(1), newPrice];
              return {
                ...item,
                price: newPrice,
                change: newChange,
                changePercent: newChgPct,
                sparkline: newSparkline
              };
            }
            return item;
          });
        });
      } else {
        // Major Indices
        setMajorIndices((prev) => {
          const randomIndex = Math.floor(Math.random() * prev.length);
          const asset = prev[randomIndex];
          const deltaPct = (Math.random() * 0.15 - 0.07) / 100;
          const newPrice = Number((asset.price * (1 + deltaPct)).toFixed(2));
          const priceDiff = newPrice - asset.price;
          direction = priceDiff >= 0 ? 'up' : 'down';
          updatedId = asset.id;

          return prev.map((item, idx) => {
            if (idx === randomIndex) {
              const newChange = Number((item.change + priceDiff).toFixed(2));
              const newChgPct = Number(((newChange / (item.price - item.change)) * 100).toFixed(2));
              const newSparkline = [...item.sparkline.slice(1), newPrice];
              return {
                ...item,
                price: newPrice,
                change: newChange,
                changePercent: newChgPct,
                sparkline: newSparkline
              };
            }
            return item;
          });
        });
      }

      if (updatedId) {
        setRecentTicks((prev) => ({ ...prev, [updatedId]: direction }));
        setTimeout(() => {
          setRecentTicks((prev) => {
            const next = { ...prev };
            delete next[updatedId];
            return next;
          });
        }, 1200);
      }
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <MarketContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedAsset,
        setSelectedAsset,
        isSearchOpen,
        setIsSearchOpen,
        isCalendarOpen,
        setIsCalendarOpen,
        isAccountOpen,
        setIsAccountOpen,
        majorIndices,
        worldIndices,
        usStocks,
        cryptoSpotlight,
        commoditiesForex,
        earningsEvents,
        economicEvents,
        ideas,
        recentTicks,
        watchlistIds,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        portfolioCash,
        positions,
        executeTrade,
        resetPortfolio,
        addFunds,
        likeIdea,
        addIdea,
        alerts,
        addAlert,
        removeAlert,
        toasts,
        addToast,
        removeToast,
        allAssets,
        getAssetBySymbol
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
