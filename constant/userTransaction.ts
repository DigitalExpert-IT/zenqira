export interface IUserTransaction {
  value: string;
  valueToken: string;
  id: string;
  txnId: string;
  txHash?: string;
  email: string;
  addressWallet?: string;
  user?: {
    email: string;
    walletAddress: string;
  };
  transactionDate: string;
  amount: number;
  status: string;
  reference: string;
  createdAt?: Date;
  action?: {
    approve?: () => void;
    reject: () => void;
  }
}