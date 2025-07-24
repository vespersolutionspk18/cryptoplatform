"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

export type CryptoType = 'SOL' | 'BTC' | 'ETH' | 'BNB' | 'XRP' | 'ADA' | 'DOGE' | 'MATIC' | 'DOT' | 'AVAX';

interface CryptoConfig {
  symbol: CryptoType;
  name: string;
  binanceSymbol: string;
  coingeckoId: string;
  logo: string;
}

export const CRYPTO_CONFIGS: Record<CryptoType, CryptoConfig> = {
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    binanceSymbol: 'SOLUSDT',
    coingeckoId: 'solana',
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    binanceSymbol: 'BTCUSDT',
    coingeckoId: 'bitcoin',
    logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    binanceSymbol: 'ETHUSDT',
    coingeckoId: 'ethereum',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
  },
  BNB: {
    symbol: 'BNB',
    name: 'BNB',
    binanceSymbol: 'BNBUSDT',
    coingeckoId: 'binancecoin',
    logo: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png'
  },
  XRP: {
    symbol: 'XRP',
    name: 'XRP',
    binanceSymbol: 'XRPUSDT',
    coingeckoId: 'ripple',
    logo: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png'
  },
  ADA: {
    symbol: 'ADA',
    name: 'Cardano',
    binanceSymbol: 'ADAUSDT',
    coingeckoId: 'cardano',
    logo: 'https://assets.coingecko.com/coins/images/975/large/cardano.png'
  },
  DOGE: {
    symbol: 'DOGE',
    name: 'Dogecoin',
    binanceSymbol: 'DOGEUSDT',
    coingeckoId: 'dogecoin',
    logo: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png'
  },
  MATIC: {
    symbol: 'MATIC',
    name: 'Polygon',
    binanceSymbol: 'MATICUSDT',
    coingeckoId: 'matic-network',
    logo: 'https://assets.coingecko.com/coins/images/4713/large/polygon.png'
  },
  DOT: {
    symbol: 'DOT',
    name: 'Polkadot',
    binanceSymbol: 'DOTUSDT',
    coingeckoId: 'polkadot',
    logo: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png'
  },
  AVAX: {
    symbol: 'AVAX',
    name: 'Avalanche',
    binanceSymbol: 'AVAXUSDT',
    coingeckoId: 'avalanche-2',
    logo: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png'
  }
};

interface CryptoContextType {
  selectedCrypto: CryptoType;
  setSelectedCrypto: (crypto: CryptoType) => void;
  cryptoConfig: CryptoConfig;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

export function CryptoProvider({ children }: { children: ReactNode }) {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>('SOL');
  
  const cryptoConfig = useMemo(() => CRYPTO_CONFIGS[selectedCrypto], [selectedCrypto]);
  
  const handleSetSelectedCrypto = useCallback((crypto: CryptoType) => {
    setSelectedCrypto(crypto);
  }, []);
  
  const contextValue = useMemo(() => ({
    selectedCrypto,
    setSelectedCrypto: handleSetSelectedCrypto,
    cryptoConfig
  }), [selectedCrypto, handleSetSelectedCrypto, cryptoConfig]);

  return (
    <CryptoContext.Provider value={contextValue}>
      {children}
    </CryptoContext.Provider>
  );
}

export function useCrypto() {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
}