"use client";

import React, { createContext, useState, useContext, useCallback } from 'react';
import { IUserTransaction } from '@/constant/userTransaction';

interface TransactionContextType {
  withdrawals: IUserTransaction[];
  withdraw: IUserTransaction[];
  loading: boolean;
  error: string | null;
  response: { error?: string } | null;
  success: boolean;
  fetchWithdrawals: () => Promise<void>;
  fetchById: (id: string) => Promise<void>;
  updateWithdrawal: (id: string, status: string) => Promise<void>;
  postWithdrawal: (amount: number) => Promise<void>;
  refetch: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [withdrawals, setWithdrawals] = useState<IUserTransaction[]>([]);
  const [withdraw, setWithdraw] = useState<IUserTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [response, setResponse] = useState<{ error?: string } | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/withdraw');
      if (!response.ok) {
        throw new Error('Failed to fetch withdrawals');
      }
      const data = await response.json();
      setWithdrawals(data.transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/withdraw/${id}`, { method: "GET" });
      if (!response.ok) {
        throw new Error('Failed to fetch transaction');
      }
      const data = await response.json();
      setWithdraw(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWithdrawal = useCallback(async (id: string, txHash: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/transaction/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txHash }),
      });

      if (!response.ok) {
        throw new Error('Failed to update withdrawal');
      }

      await fetchWithdrawals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchWithdrawals]);

  const postWithdrawal = async (amount: number): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        const errorMessage = data.error;
        setError(errorMessage)
      }

      setResponse(data);
      if (data.id) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const handlePostWithdrawal = async (amount: number) => {
    await postWithdrawal(amount);
    if (success) {
      await fetchWithdrawals();
    }
  };

  React.useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  return (
    <TransactionContext.Provider
      value={{
        withdrawals,
        withdraw,
        loading,
        error,
        success,
        response,
        fetchWithdrawals,
        fetchById,
        updateWithdrawal,
        postWithdrawal: handlePostWithdrawal,
        refetch: fetchWithdrawals
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
