"use client";

import { Wallet } from "lucide-react";
import { UserBalanceCard } from "../card";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTokenPurchase } from "@/hooks/useTokenPurchase";
import { useTransactions } from "@/context/TransactionContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { FormError } from "../form-error";
import { toast } from "sonner";
import { useBalances } from "@/hooks/useBalance";

export function DepositInfo() {
  const { user } = useCurrentUser();
  const [amount, setAmount] = useState("");
  const { isLoading: balancesLoading, balances, fetchBalances } = useBalances();
  const { error, isLoading, buyError } = useTokenPurchase();
  const {
    postWithdrawal,
    error: withdrawError,
    success,
    loading,
    refetch,
  } = useTransactions();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  useEffect(() => {
    if (success === true) {
      refetch();
      setAmount("");
      toast.success("Withdraw Requested!");
      fetchBalances();
    }
    if (withdrawError !== null) {
      setAmount("");
      toast.error(withdrawError || "Error occurred");
    }
  }, [withdrawError, success]);

  return (
    <div className="mx-auto p-4 sm:p-6 md:p-5 mt-4 sm:mt-6 md:mt-10">
      <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 md:grid-cols-3">
        <UserBalanceCard balances={balances} balancesLoading={balancesLoading} />
        {user?.role === "ADMIN" ? null : (
          <Card className="md:col-span-2 bg-slate-800 text-white border-gray-700 w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-2xl font-bold">
                Withdraw Funds
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-400">
                Withdraw ZENQ tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  {isLoading ? (
                    <Skeleton className="h-9 w-[200px]" />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      {user?.walletAddress ? (
                        <span className="text-lg font-medium">
                          {user?.walletAddress &&
                            formatAddress(user?.walletAddress)}
                        </span>
                      ) : (
                        <FormError message="Add wallet address on settings" />
                      )}
                    </div>
                  )}
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Wallet Address BEP20
                  </div>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Enter amount in ZENQ"
                    value={amount}
                    onChange={e => {
                      const inputValue = e.target.value;
                      if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
                        setAmount(inputValue);
                      }
                    }}
                    className="pr-16 text-xs sm:text-sm"
                  />

                  <span className="absolute right-8 top-0 bottom-1 my-auto text-muted-foreground w-4 h-4 sm:w-5 sm:h-5">
                    ZENQ
                  </span>
                </div>
                {buyError && (
                  <p className="text-xs sm:text-sm text-destructive">
                    {buyError}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-5">
              <Button
                className="w-full bg-blue-800 hover:bg-blue-900 text-xs sm:text-sm"
                onClick={() => postWithdrawal(Number(amount))}
                disabled={
                  !amount ||
                  loading ||
                  isLoading ||
                  !!error ||
                  !user?.walletAddress
                }
              >
                {isLoading ? "Processing..." : "Withdraw ZENQ"}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

export default DepositInfo;
