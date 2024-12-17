"use client";

import { useState } from "react";
import { SiBinance } from "react-icons/si";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTokenPurchase } from "@/hooks/useTokenPurchase";
import { DollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserBalanceCard } from "../card";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useBalances } from "@/hooks/useBalance";


export function BalanceInfo() {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("USDT.BEP20");
  const { user } = useCurrentUser();
  const { isLoading: balancesLoading, balances } = useBalances();
  const { tokenPrice, handleBuy, error, isLoading, buyError } =
    useTokenPurchase();

  const calculateTokenAmount = () => {
    if (!amount || !tokenPrice) return "0";
    return (Number(amount) / tokenPrice).toFixed(6);
  };

  return (
    <div className="mx-auto p-4 sm:p-6 md:p-5 mt-4 sm:mt-6 md:mt-10">
      <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 md:grid-cols-3">
        <UserBalanceCard balances={balances} balancesLoading={balancesLoading} />
        {user?.role === "ADMIN" ? null :
          <Card className="md:col-span-2 bg-slate-800 text-white border-gray-700 w-full">
            <CardHeader>
              <CardTitle className="text-lg sm:text-2xl font-bold">
                Purchase ZENQ Tokens
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-gray-400">
                Buy ZENQ tokens using USDT
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Enter amount in USDT"
                    value={amount}
                    onChange={e => {
                      const inputValue = e.target.value;
                      if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
                        setAmount(inputValue);
                      }
                    }}
                    className="pr-12 text-xs sm:text-sm"
                  />
                  {paymentMethod === "BNB" ? (
                    <SiBinance className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  ) : (
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
                {buyError && (
                  <p className="text-xs sm:text-sm text-destructive">
                    {buyError}
                  </p>
                )}
                {tokenPrice && amount && (
                  <p className="text-xs sm:text-sm text-muted-foreground text-white">
                    ≈ {calculateTokenAmount()} ZENQ
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-5">
              <Select onValueChange={value => setPaymentMethod(value)}>
                <SelectTrigger className="w-full sm:w-[180px] text-xs sm:text-sm">
                  <SelectValue placeholder="Select a payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="USDT.BEP20">USDT.BEP20</SelectItem>
                    <SelectItem value="USDT.TRC20">USDT.TRC20</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button
                className="w-full bg-blue-800 hover:bg-blue-900 text-xs sm:text-sm"
                onClick={() => handleBuy(Number(amount), paymentMethod)}
                disabled={!amount || isLoading || !!error}
              >
                {isLoading ? "Processing..." : "Buy ZENQ"}
              </Button>
            </CardFooter>
          </Card>
        }
      </div>
    </div>
  );
}

export default BalanceInfo;
