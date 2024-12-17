"use client";

import React, { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";

import Link from "next/link";
import Table from "../ui/table";
import { Badge } from "../ui/badge";
import Pagination from "../pagination";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionStatus } from "@prisma/client";

export interface IUserTransaction {
  id: string;
  txnId: string;
  transactionDate: string;
  amount: number;
  status: string;
  reference: string;
  type: string;
  action: () => void;
}

const columnHelper = createColumnHelper<IUserTransaction>();

export const TableByPass = () => {
  const { transactions, changeTxStatus, refetch } = useTransactions();

  const columns = useMemo(
    () => [
      columnHelper.accessor("transactionDate", {
        cell: info => (
          <div className="min-w-[5rem] font-bold text-sm capitalize text-center">
            {info.getValue()}
          </div>
        ),
        header: () => <div>Date</div>,
      }),
      columnHelper.accessor("txnId", {
        cell: info => (
          <div className="min-w-[13rem] font-bold text-md capitalize text-center">
            {info.getValue()}
          </div>
        ),
        header: () => <div className="text-center">Payment ID</div>,
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
        cell: info => {
          return <TransactionStatusCell statusText={info?.getValue()} />;
        },
        header: () => <div className="text-center">Status</div>,
      }),
      columnHelper.accessor("reference", {
        cell: info => (
          <Link href={info.row.original.reference}>
            <div className="min-w-[13rem] font-bold text-md text-center hover:text-blue-700">
              {info.getValue().slice(0, 20) + "..."}
            </div>
          </Link>
        ),
        header: () => <div className="text-center">Reference</div>,
      }),
      columnHelper.accessor("action", {
        cell: (info) => {
          const rowId = info.row.original.id;
          return (
            <button
              onClick={() => changeTxStatus(rowId)}
              className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
            >
              Sikat!
            </button>
          );
        },
        header: () => <div className="text-center">Action</div>,
      }),
    ], [changeTxStatus]
  );

  const DataTableTransaction = useMemo(() => {
    if (!transactions) return [];

    // Filter only deposit transactions
    return transactions
      .filter(item => item.type?.toLowerCase() === "deposit")
      .map(item => ({
        id: item.id,
        txnId: item.txnId || "",
        amount: item.valueToken || 0,
        status: item.status || "",
        reference: item.reference || "",
        type: item.type || "",
        transactionDate: new Date(item.createdAt).toLocaleDateString() || "",
      }));
  }, [transactions]);

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
    <div className="p-5 space-y-4">
      <h2 className="text-white text-2xl font-bold">Bypass Buy</h2>
      <div>
        <Table data={currentItems} columns={columns} />
      </div>

      {DataTableTransaction.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPage={totalPages}
          onPageChange={handlePageClick}
          colorScheme="green"
        />
      )}
    </div>
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

export default TableByPass;
