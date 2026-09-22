import Link from "next/link";

interface Transaction {
  _id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  status: "pending" | "success" | "failed";
  reference: string;
  createdAt: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({
  transactions,
}: RecentTransactionsProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold">
        Recent Transactions
      </h2>

      <div className="mt-4 space-y-3">
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No transactions yet.
          </p>
        ) : (
          transactions.map((transaction) => (
            <Link
              key={transaction._id}
              href={`/dashboard/transactions/${transaction._id}`}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted"
            >
              <div>
                <p className="font-medium">
                  {transaction.description}
                </p>

                <p className="text-sm text-muted-foreground">
                  {transaction.status}
                </p>
              </div>

              <p className="font-semibold">
                {transaction.type === "credit" ? "+" : "-"}
                {transaction.amount.toLocaleString()}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}