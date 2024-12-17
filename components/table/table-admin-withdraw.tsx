"use client"

import React, { useCallback, useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
// import Link from "next/link";
import Table from "../ui/table";
import Pagination from "../pagination";
import { TransactionProvider, useTransactions } from "@/context/TransactionContext";
import { ModalWithdraw } from "../withdraw/modal-transaction";
// import { Input } from "../ui";
// import { Search } from "lucide-react";
import { IUserTransaction } from "@/constant/userTransaction";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Badge } from "../ui/badge";
import { TransactionStatus } from "@prisma/client";
import { ModalReject } from "../withdraw/modal-reject";


const columnHelper = createColumnHelper<IUserTransaction>();

export const TableAdminWithdraw = () => {
  const { withdrawals, withdraw, fetchById, fetchWithdrawals } = useTransactions();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalRejectOpen, setModalRejectOpen] = useState<boolean>(false);

  // Transaction detail state
  const [transaction, setTransaction] = useState<IUserTransaction | null>(null);

  // Approve Withdrawal
  const handleOpenTransaction = useCallback(async (id: string) => {
    await fetchById(id);
    setModalOpen(true);
  }, [fetchById]);
  const onCloseModalTransaction = async () => {
    setModalOpen(false);
    await fetchWithdrawals();
  }

  // Reject Withdrawal
  const handleRejectTransaction = (tx: IUserTransaction) => {
    setModalRejectOpen(true);
    setTransaction(tx);
  };
  const onCloseRejectModal = async () => {
    setModalRejectOpen(false);
    setTransaction(null);
    await fetchWithdrawals();
  }

  const handleCopy = (item: string) => {
    navigator.clipboard.writeText(item)
      .then(() =>
        toast.success("address wallet copied"))
  }

  const shortenValue = (value: string) => {
    if (value.length > 12) {
      return `${value.slice(0, 6)}...${value.slice(-4)}`;
    }
    return value;
  }

  const columns = useMemo(() => [
    columnHelper.accessor("transactionDate", {
      cell: info => (
        <div className="min-w-[5rem] font-bold text-sm capitalize text-center">
          {info.getValue()}
        </div>
      ),
      header: () => <div>Date</div>,
    }),
    columnHelper.accessor("email", {
      cell: info => {
        const emailVal = info.getValue()
        return (
          <div className="min-w-[5rem] font-bold text-sm capitalize text-center">
            {shortenValue(emailVal)}
          </div>
        )
      },
      header: () => <div>user</div>,
    }),
    columnHelper.accessor("addressWallet", {
      cell: info => {
        const addressWallet = info.getValue();
        return (
          <div className="min-w-[5rem] font-bold text-sm capitalize text-center relative">
            <button
              onClick={() => handleCopy(addressWallet as string)}
              className="focus:outline-none text-purple-700 hover:text-purple-800 dark:text-purple-500 dark:hover:text-purple-400 flex items-center justify-center"
            >
              {shortenValue(addressWallet as string)}
              <sup className="ml-1">
                <Copy
                  size={16}
                  className="cursor-pointer hover:text-purple-800 dark:hover:text-purple-400"
                  aria-label="Copy wallet address"
                />
              </sup>
            </button>
          </div>
        );
      },
      header: () => <div>Address Wallet</div>,
    }),
    columnHelper.accessor("txHash", {
      cell: info => {
        const txVal = info.getValue();
        return (
          <div className="min-w-[13rem] font-bold text-md capitalize text-center">
            {shortenValue(txVal as string)}
          </div>
        )
      },
      header: () => <div className="text-center">txHash</div>,
    }),
    columnHelper.accessor("amount", {
      cell: info => (
        <div className="min-w-[13rem] font-bold text-md capitalize text-center">
          {info.getValue()}
        </div>
      ),
      header: () => <div className="text-center">ZENQ Asset</div>,
    }),
    columnHelper.accessor("status", {
      cell: info => (
        <div className="min-w-[13rem] font-bold text-md capitalize text-center">
          <TransactionStatusCell statusText={info?.getValue()} />
        </div>
      ),
      header: () => <div className="text-center">Status</div>,
    }),
    columnHelper.accessor("action", {
      cell: (info) => {
        const status = info.row?.original?.status;
        if (status === TransactionStatus?.REJECTED || status === TransactionStatus?.SUCCESS) return null;

        const approve = info.row.original?.action?.approve;
        const reject = info.row.original?.action?.reject;
        return (
          <div className="flex gap-2">
            <button
              onClick={approve}
              className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
            >
              Approve
            </button>
            <button
              onClick={reject}
              className="focus:outline-none text-white bg-red-500 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
            >
              Reject
            </button>
          </div>
        );
      },
      header: () => <div className="text-center">Action</div>,
    }),
  ], []);

  const DataTableTransaction = useMemo(() => {
    if (!withdrawals) return [];

    return withdrawals.map((item) => ({
      id: item.id || "",
      addressWallet: item.user?.walletAddress,
      txHash: item.txHash || "",
      email: item.user?.email || "N/A",
      value: item.valueToken || "",
      amount: typeof item.valueToken === "number" ? item.valueToken : 0,
      status: item.status || "",
      reference: item.reference || "",
      transactionDate: item.createdAt
        ? new Date(item.createdAt).toLocaleDateString()
        : "N/A",
      user: item.user ? { email: item.user.email } : undefined,
      action: {
        approve: () => handleOpenTransaction(item.id || ""),
        reject: () => handleRejectTransaction(item)
      },
    }));
  }, [withdrawals, handleOpenTransaction]);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = DataTableTransaction.slice(startIndex, endIndex);
  const totalPages = Math.ceil(DataTableTransaction.length / itemsPerPage);

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-0 md:p-5 space-y-4">
      <div className="flex flex-row gap-5 justify-between ps-1.5 my-4">
        <h2 className="text-white text-2xl font-bold">Withdrawals Request</h2>
        {/* <div className="relative sm:block">
          <Search className="absolute top-5 -translate-y-1/2 start-3 text-black dark:text-white" />
          <Input
            type="text"
            id="searchItem"
            name="search"
            placeholder="Search..."
            className="min-h-10 w-56 ps-9 px-3 h-8 bg-transparent dark:bg-slate-900 dark:text-slate-200 rounded-md outline-none border border-gray-100 dark:border-gray-800 focus:ring-0 bg-white text-black shadow-md"
          />
        </div> */}
      </div>
      <div>

        <Table
          // eslint-disable-next-line
          // @ts-expect-error
          data={currentItems}
          columns={columns}
        />
      </div>

      {DataTableTransaction.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPage={totalPages}
          onPageChange={handlePageClick}
          colorScheme="green"
        />
      )}

      {modalOpen && withdraw && (
        // eslint-disable-next-line
        // @ts-expect-error
        <ModalWithdraw onClose={onCloseModalTransaction} transaction={withdraw} />
      )}
      {/** Dialog Reject Confirmation */}
      <ModalReject open={modalRejectOpen} onClose={onCloseRejectModal} transaction={transaction ?? {} as IUserTransaction} />
    </div >
  );
};

const TransactionStatusCell = ({ statusText }: { statusText: string }) => {

  return (
    <div className="min-w-[13rem] font-bold text-md capitalize text-center">
      <Badge
        variant={
          statusText === TransactionStatus.REJECTED ? "destructive" : statusText === TransactionStatus.PENDING ? "warning" : "success"
        }
      >
        {statusText}
      </Badge>
    </div>
  );
};

export default function AdminWithdrawPage() {
  return (
    <TransactionProvider>
      <TableAdminWithdraw />
    </TransactionProvider>
  );
}

