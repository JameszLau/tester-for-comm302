export type AssetCategory = 
  | 'All' 
  | 'Indices' 
  | 'US Stocks' 
  | 'Crypto' 
  | 'Futures' 
  | 'Forex' 
  | 'Bonds' 
  | 'ETFs' 
  | 'Economy';

export type StockFilterTab = 'Community trends' | 'Highest volume' | 'Gainers' | 'Losers';

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  type: 'index' | 'stock' | 'crypto' | 'commodity' | 'forex' | 'etf' | 'bond';
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  volume?: string;
  marketCap?: string;
  dayHigh?: number;
  dayLow?: number;
  yearHigh?: number;
  yearLow?: number;
  peRatio?: number;
  sparkline: number[];
  iconType?: 'text' | 'icon' | 'badge';
  iconText?: string;
  iconBg?: string;
  iconColor?: string;
  materialIcon?: string;
  description?: string;
  sentiment?: {
    buy: number;
    hold: number;
    sell: number;
  };
}

export interface EarningsEvent {
  id: string;
  symbol: string;
  companyName: string;
  timing: 'Pre-market' | 'After hours';
  estimate: string;
  actual: string;
  reportDate: string;
  marketCap?: string;
}

export interface EconomicEvent {
  id: string;
  time: string;
  country: string;
  event: string;
  actual: string;
  forecast: string;
  previous: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface PortfolioPosition {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalCost: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface TradeIdea {
  id: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  symbol: string;
  title: string;
  description: string;
  stance: 'Bullish' | 'Bearish' | 'Neutral';
  targetPrice: string;
  timeframe: string;
  likes: number;
  comments: number;
  timestamp: string;
  chartTrend: 'up' | 'down';
  liked?: boolean;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below';
  targetPrice: number;
  createdAt: string;
  active: boolean;
}
