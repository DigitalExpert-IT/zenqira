"use client";

import { useTokenPurchase } from "@/hooks/useTokenPurchase";
import { useTransactions } from "@/hooks/useTransactions";
import { useFetchUsers } from "@/hooks/useUsers";
import { BeatLoader } from "react-spinners";
import { Skeleton } from "../ui/skeleton";
import { formatPrice } from "@/lib/format";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useMemo } from "react";

export function AdminWidget() {
  const { tokenPrice, error, prevPrice, isLoading } = useTokenPurchase();
  const { totalUser } = useFetchUsers(1, 1);
  const { omzet } = useTransactions();

  const price = useMemo(() => {
    if (!tokenPrice || !prevPrice)
      return { priceChange: null, percentage: null };

    const priceChange = tokenPrice - prevPrice;
    const percentage = (priceChange / prevPrice) * 100;
    return { priceChange, percentage };
  }, [tokenPrice, prevPrice]);

  return (
    <div className="p-0 md:p-5 space-y-4">
      <div className="flex flex-row flex-wrap justify-center gap-2 md:gap-8 md:col-span-2 bg-slate-800 text-white border-gray-700 w-full p-4 md:p-8 rounded-xl">
        {isLoading ? (
          <Skeleton className="h-9 w-full bg-gray-400" />
        ) : error ? (
          <p className="w-full text-xs sm:text-sm text-destructive">{error}</p>
        ) : (
          <div className="flex flex-col w-full">
            <h2 className="text-2xl table-cell font-bold mb-3">
              ZENQ Token Price
            </h2>
            <div className="flex flex-row gap-2">
              <p
                className={`text-2xl sm:text-3xl font-bold ${price?.priceChange && price?.priceChange >= 0
                    ? "text-green-500"
                    : "text-red-500"
                  }`}
              >
                {formatPrice(tokenPrice)}
              </p>
              {price.priceChange !== null && (
                <div
                  className={`flex items-center ${price?.priceChange && price?.priceChange >= 0
                      ? "text-green-500"
                      : "text-red-500"
                    }`}
                >
                  {price?.priceChange && price?.priceChange >= 0 ? (
                    <ArrowUpCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                  ) : (
                    <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                  )}
                  <span className="text-xs sm:text-sm font-medium">
                    {price?.percentage && price?.percentage?.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">USDT</p>
          </div>
        )}

        {/** Total Result */}
        <div className="flex-1 bg-gradient-to-r table from-blue-500 to-purple-600 text-white p-4 rounded-xl">
          <h2 className="text-md md:text-2xl table-row md:table-cell text-center md:text-left">
            Total Turnover
          </h2>
          <p className="text-md md:text-2xl font-bold table-row md:table-cell text-center md:text-right">
            {isLoading ? <BeatLoader /> : omzet !== null ? `${omzet} USD` : "0 USD"}
          </p>
        </div>
        <div className="flex-1 bg-gradient-to-r table from-blue-500 to-purple-600 text-white p-4 rounded-xl">
          <h2 className="text-md md:text-2xl table-row md:table-cell text-center md:text-left">
            Total User
          </h2>
          <p className="text-md md:text-2xl font-bold table-row md:table-cell text-center md:text-right">
            {totalUser ?? <BeatLoader />}
          </p>
        </div>
      </div>
    </div>
  );
}
