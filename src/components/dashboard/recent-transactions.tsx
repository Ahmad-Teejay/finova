"use client";

import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

interface Transaction {
  _id: string;
  type: "credit" | "debit";
  category:
    | "deposit"
    | "transfer"
    | "withdrawal"
    | "airtime"
    | "data"
    | "bill";
  amount: number;
  description: string;
  status: "pending" | "success" | "failed" | "reversed";
  reference: string;
  createdAt: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const categoryLabels: Record<Transaction["category"], string> = {
  deposit: "Deposit",
  transfer: "Transfer",
  withdrawal: "Withdrawal",
  airtime: "Airtime",
  data: "Data",
  bill: "Bill",
};

const statusLabels: Record<Transaction["status"], string> = {
  pending: "Pending",
  success: "Successful",
  failed: "Failed",
  reversed: "Reversed",
};

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDateGroup(date: string) {
  const transactionDate = new Date(date);
  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (
    transactionDate.toDateString() === today.toDateString()
  ) {
    return "Today";
  }

  if (
    transactionDate.toDateString() === yesterday.toDateString()
  ) {
    return "Yesterday";
  }

  return transactionDate.toLocaleDateString([], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function RecentTransactions({
  transactions,
}: RecentTransactionsProps) {
  const [filter, setFilter] = useState<
    "all" | Transaction["category"]
  >("all");

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter(
          (transaction) => transaction.category === filter
        );

  const groupedTransactions = filteredTransactions.reduce(
    (groups, transaction) => {
      const group = getDateGroup(transaction.createdAt);

      if (!groups[group]) {
        groups[group] = [];
      }

      groups[group].push(transaction);

      return groups;
    },
    {} as Record<string, Transaction[]>
  );

  return (
    <div className="mt-6">
      {/* Filter */}
      <div className="mb-5 flex items-center justify-between">
        <div className="relative">
          <select
            value={filter}
            onChange={(e) =>
              setFilter(
                e.target.value as
                  | "all"
                  | Transaction["category"]
              )
            }
            className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="deposit">Deposit</option>
            <option value="transfer">Transfer</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="airtime">Airtime</option>
            <option value="data">Data</option>
            <option value="bill">Bill</option>
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
        </div>
      </div>

      {/* Transactions */}
      {Object.keys(groupedTransactions).length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No transactions found.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(
            ([dateGroup, groupTransactions]) => (
              <div key={dateGroup}>
                {/* Date */}
                <h4 className="mb-3 text-sm font-semibold text-slate-500">
                  {dateGroup}
                </h4>

                {/* Transactions */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {groupTransactions.map((transaction) => {
                    const isCredit =
                      transaction.type === "credit";

                    return (
                      <Link
                        key={transaction._id}
                        href={`/dashboard/transactions/${transaction._id}`}
                        className="flex items-center justify-between gap-4 border-b border-slate-100 p-4 last:border-b-0 transition hover:bg-slate-50"
                      >
                        {/* Left */}
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                              isCredit
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowDownLeft size={20} />
                            ) : (
                              <ArrowUpRight size={20} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {transaction.description}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {
                                categoryLabels[
                                  transaction.category
                                ]
                              }{" "}
                              ·{" "}
                              {formatTime(
                                transaction.createdAt
                              )}{" "}
                              ·{" "}
                              <span
                                className={
                                  transaction.status ===
                                  "success"
                                    ? "text-green-600"
                                    : transaction.status ===
                                      "failed"
                                    ? "text-red-600"
                                    : transaction.status ===
                                      "reversed"
                                    ? "text-purple-600"
                                    : "text-yellow-600"
                                }
                              >
                                {
                                  statusLabels[
                                    transaction.status
                                  ]
                                }
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Amount */}
                        <p
                          className={`shrink-0 text-sm font-bold ${
                            isCredit
                              ? "text-green-600"
                              : "text-slate-900"
                          }`}
                        >
                          {isCredit ? "+" : "-"}₦
                          {transaction.amount.toLocaleString()}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
