"use client";

import React, { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";

import Table from "../ui/table";
import { Badge } from "../ui/badge";
import Pagination from "../pagination";
import {
  TransactionProvider,
  useTransactions,
} from "@/context/TransactionContext";
import { TransactionStatus } from "@prisma/client";

export interface IUserTransaction {
  txhash: string;
  txnId: string;
  amount: number;
  status: string;
  reference: string;
  transactionDate: string;
}

const columnHelper = createColumnHelper<IUserTransaction>();

export const TableUserWithdraw = () => {
  const { withdrawals } = useTransactions();

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
      columnHelper.accessor("amount", {
        cell: info => (
          <div className="min-w-[13rem] font-bold text-md capitalize text-center">
            {info.getValue()}
          </div>
        ),
        header: () => <div className="text-center">ZENQ Asset</div>,
      }),
      columnHelper.accessor("txhash", {
        cell: info => (
          <div className="min-w-[13rem] font-bold text-md capitalize text-center">
            {info.getValue()}
          </div>
        ),
        header: () => <div className="text-center">txhash</div>,
      }),
      columnHelper.accessor("status", {
        cell: info => {
          return <TransactionStatusCell statusText={info?.getValue()} />;
        },
        header: () => <div className="text-center">Status</div>,
      }),
    ],
    []
  );

  const DataTableTransaction = useMemo(() => {
    if (!withdrawals) return [];

    return withdrawals.map(item => ({
      txhash: item.txHash || "",
      amount: Number(item.valueToken) || 0,
      status: item.status || "",
      reference: item.reference || "",
      transactionDate: item.createdAt
        ? new Date(item.createdAt).toLocaleDateString()
        : "",
    }));
  }, [withdrawals]);

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
        {/* eslint-disable-next-line */}
        {/* @ts-expect-error */}
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

export default function AdminWithdrawPage() {
  return (
    <TransactionProvider>
      <TableUserWithdraw />
    </TransactionProvider>
  );
}
