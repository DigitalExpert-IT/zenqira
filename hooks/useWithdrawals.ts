import { Transaction } from '@prisma/client';
import { useCallback, useState } from 'react';

interface UseWithdrawalResponse {
  loading: boolean;
  error: string | null;
  success: boolean;
  updateWithdrawal: ({ ...tx }: Partial<Transaction>) => Promise<void>;
  postWithdrawal: (amount: number) => Promise<void>;
  approveWithdrawal: (txId: string, txHash: string) => Promise<void>;
  response: object
}

export const useWithdrawal = (): UseWithdrawalResponse => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState({})
  const [success, setSuccess] = useState<boolean>(false);

  const updateWithdrawal = useCallback(async (tx: Partial<Transaction>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/transaction/${tx.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tx),
      });

      if (!response.ok) {
        throw new Error('Failed to update withdrawal');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const postWithdrawal: UseWithdrawalResponse["postWithdrawal"] = async (amount) => {
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
        throw new Error('Failed to create withdrawal request');
      }

      setResponse(data)
      if (data.id) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err + 'Failed to create withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const approveWithdrawal: UseWithdrawalResponse["approveWithdrawal"] = async (txId, txHash) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/withdraw', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: txId, txHash }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve withdrawal request');
      }

      const data = await response.json();
      setResponse(data)
      if (data.id) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err + 'Failed to approve withdrawal request');
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, success, updateWithdrawal, postWithdrawal, approveWithdrawal, response };
};
