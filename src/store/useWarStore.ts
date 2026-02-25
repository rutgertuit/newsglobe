import { create } from 'zustand';

export interface ThreatEvent {
    id: string;
    lat: number;
    lng: number;
    intensity: number;
    headline: string;
    timestamp: string;
    theme: string;
    url?: string;
    origin?: string;
    destination?: string;
}

interface MarketData {
    symbol: string;
    price: number;
    change: number;
    trend: 'up' | 'down';
}

interface WarStoreState {
    threats: ThreatEvent[];
    marketData: MarketData[];
    selectedCountry: string | null;
    activeTheme: string;
    addThreat: (threat: ThreatEvent) => void;
    setThreats: (threats: ThreatEvent[]) => void;
    removeThreat: (id: string) => void;
    setMarketData: (data: MarketData[]) => void;
    setSelectedCountry: (country: string | null) => void;
    setActiveTheme: (theme: string) => void;
}

export const useWarStore = create<WarStoreState>((set) => ({
    threats: [],
    marketData: [
        { symbol: 'LMT', price: 450.25, change: 2.5, trend: 'up' },
        { symbol: 'RTX', price: 92.10, change: 1.2, trend: 'up' },
        { symbol: 'GD', price: 235.60, change: 0.8, trend: 'up' },
        { symbol: 'NOC', price: 470.15, change: 3.1, trend: 'up' },
    ],
    selectedCountry: null,
    activeTheme: 'ALLES',
    addThreat: (threat) =>
        set((state) => ({
            threats: [...state.threats, threat],
        })),
    setThreats: (threats) => set({ threats }),
    removeThreat: (id) =>
        set((state) => ({
            threats: state.threats.filter((t) => t.id !== id),
        })),
    setMarketData: (data) => set({ marketData: data }),
    setSelectedCountry: (country) => set({ selectedCountry: country }),
    setActiveTheme: (theme) => set({ activeTheme: theme }),
}));
