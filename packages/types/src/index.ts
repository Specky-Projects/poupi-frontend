export interface User {
  id: string;
  name?: string | null;
  email: string;
  role?: "free" | "premium" | "admin" | string;
}

export interface Alert {
  id: string;
  userId?: string;
  productId?: string;
  targetPrice: number;
  active: boolean;
  createdAt?: string;
}

export interface Product {
  id: string;
  title: string;
  url?: string;
  imageUrl?: string | null;
  marketplace?: string | null;
  currentPrice?: number | null;
  currency?: string;
}

export interface PriceSnapshot {
  id?: string;
  productId?: string;
  offerId?: string;
  price: number;
  currency?: string;
  capturedAt: string;
}

export interface CryptoAsset {
  symbol: string;
  name?: string;
  price: number;
  currency?: string;
  change24hPct?: number;
  updatedAt?: string;
}

export interface RealEstateListing {
  id: string;
  title: string;
  price: number;
  currency?: string;
  city?: string;
  neighborhood?: string;
  areaM2?: number;
  bedrooms?: number;
  opportunityScore?: number;
}

export interface SportsOdd {
  id: string;
  sport: string;
  eventName: string;
  market: string;
  selection: string;
  odd: number;
  bookmaker?: string;
  startsAt?: string;
  evPct?: number;
  clvPct?: number;
}

export interface ApiErrorPayload {
  message: string;
  status?: number;
  details?: unknown;
}
