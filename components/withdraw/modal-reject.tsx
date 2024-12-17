import React from "react";
import { IUserTransaction } from "@/constant/userTransaction";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from "../ui/dialog";
import { Description } from "@radix-ui/react-dialog";
import { Button } from "../ui";
import { useWithdrawal } from "@/hooks/useWithdrawals";
import { TransactionStatus } from "@prisma/client";
import { Loader } from "lucide-react";
import { toast } from "sonner";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  transaction: IUserTransaction;
};

export const ModalReject = ({ open, onClose, transaction }: ModalProps) => {
  const { updateWithdrawal, loading } = useWithdrawal();

  const onReject = async () => {
    try {
      await updateWithdrawal({ id: transaction?.id, status: TransactionStatus.REJECTED });
      onClose();
    } catch (error) {
      toast("Reject Failed");
      console.error("Reject Failed", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogTrigger asChild>
        <button className="hidden" />
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl max-h-full">
        <DialogTitle>Reject Transaction</DialogTitle>
        <Description>Are you sure to <b className="text-red-600">Reject</b> this transaction? <b>{transaction?.valueToken} ZENQ<br /> <small>{`from ${transaction?.user?.email}`}</small></b></Description>
        <DialogFooter className="!justify-center">
          <Button className="bg-red-500" onClick={onReject}>{loading ? <Loader /> : "Reject"}</Button>
          <Button className="bg-purple-700" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent >
    </Dialog >
  );
};
