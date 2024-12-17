import { useState, useEffect } from 'react';

interface Transaction {
  type: string;
  value: number;
  valueToken: number;
  status: string;
  createdAt: string;
}

export interface Balances {
  totalValue: number;
  totalValueToken: number;
  transactions: Transaction[];
}

export function useBalances() {
  const [balances, setBalances] = useState<Balances | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/balances');
      if (!response.ok) {
        throw new Error('Failed to fetch balances');
      }
      const data = await response.json();
      setBalances(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setBalances(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchBalances();
  }, []);

  return { balances, isLoading, error, fetchBalances };
}

