"use client";

import React, { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";

import Link from "next/link";
import Table from "../ui/table";
import { Badge } from "../ui/badge";
import Pagination from "../pagination";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
import { useTransactions } from "@/hooks/useTransactions";

export interface IUserTransaction {
  txnId: string;
  transactionDate: string;
  amount: number;
  status: string;
  reference: string;
  type: string;
}

const columnHelper = createColumnHelper<IUserTransaction>();

export const TableUser = () => {
  const { transactions } = useTransactions();

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
          const txnId = info.row.original.txnId;
          return <TransactionStatusCell txnId={txnId} />;
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
    ],
    []
  );

  const DataTableTransaction = useMemo(() => {
    if (!transactions) return [];

    // Filter only deposit transactions
    return transactions
      .filter(item => item.type?.toLowerCase() === "deposit")
      .map(item => ({
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

const TransactionStatusCell = ({ txnId }: { txnId: string }) => {
  const { statusText, error, signal } = usePaymentStatus(txnId);

  if (error) {
    return <div className="text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div className="min-w-[13rem] font-bold text-md capitalize text-center">
      {statusText ? (
        <Badge
          variant={
            signal === 100
              ? "success"
              : signal === 0
              ? "warning"
              : "destructive"
          }
        >
          {statusText}
        </Badge>
      ) : (
        <div className="text-gray-500">Loading...</div>
      )}
    </div>
  );
};

export default TableUser;
