import React from "react";
import { useForm } from "react-hook-form";
import { IUserTransaction } from "@/constant/userTransaction";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "../ui/dialog";
import { useWithdrawal } from "@/hooks/useWithdrawals";
import { Badge } from "../ui/badge";
import { TransactionStatus } from "@prisma/client";

type ModalProps = {
  onClose: () => void;
  transaction: IUserTransaction;
};

export const ModalWithdraw = ({ onClose, transaction }: ModalProps) => {
  const { approveWithdrawal } = useWithdrawal();
  const { register, handleSubmit, formState: { errors } } = useForm<IUserTransaction>({
    defaultValues: {
      txHash: transaction.txHash
    }
  });

  const onSubmit = async (data: Partial<IUserTransaction>) => {
    try {
      await approveWithdrawal(transaction?.id as string, data.txHash as string);
      onClose();
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogTrigger asChild>
        <button className="hidden" />
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg dark:bg-gray-700">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Withdrawal Request
            </DialogTitle>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-5 space-y-4">
            <div>
              <label
                htmlFor="id"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Transaction ID
              </label>
              <span>{transaction?.id}</span>
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Address Wallet
              </label>
              <span>{transaction?.user?.walletAddress}</span>
            </div>
            <div>
              <label
                htmlFor="value"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Amount
              </label>
              <span>{transaction?.valueToken}</span>
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Status
              </label>
              <div className="min-w-[13rem] font-bold text-md capitalize">
                <Badge
                  variant={
                    transaction?.status === TransactionStatus.REJECTED ? "destructive" : transaction?.status === TransactionStatus.PENDING ? "warning" : "success"
                  }
                >
                  {transaction?.status}
                </Badge>
              </div>
            </div>
            <div>
              <label
                htmlFor="createdAt"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Created At
              </label>
              <span>{
                transaction?.createdAt
                  ? new Date(transaction.createdAt).toLocaleDateString()
                  : ""
              }</span>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200 rounded-b dark:border-gray-600">
              <label
                htmlFor="txhash"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Transaction Hash
              </label>
              <input
                type="text"
                id="txhash"
                placeholder="Input TxHash here to update withdraw status"
                {...register("txHash", { required: "Please fill the txHash", minLength: { value: 66, message: "Please input the valid txHash" } })}
                className="form-input min-h-10 min-w-full px-3 h-8 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded-md outline-none border border-gray-100 dark:border-gray-800 focus:ring-0 bg-white text-black shadow-md"
              />
              <p className="text-xs text-red-600 mt-2">{errors.txHash?.message}</p>
            </div>
            <div className="flex justify-end p-4 md:p-5">
              <button
                type="submit"
                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-40"
                disabled={!!errors.txHash}
              >
                Approve
              </button>
              <button
                onClick={onClose}
                type="button"
                className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </DialogContent >
    </Dialog >
  );
};
