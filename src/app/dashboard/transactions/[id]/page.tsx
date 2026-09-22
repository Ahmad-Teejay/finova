import { connect } from "@/dbConfig/dbConfig";
import Transaction from "@/models/transactionModel";
import { getCurrentUser } from "@/helpers/auth";
import { redirect, notFound } from "next/navigation";

interface TransactionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TransactionDetailsPage({
  params,
}: TransactionPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  await connect();

  const transaction = await Transaction.findOne({
    _id: id,
    user: user.userId,
  });

  if (!transaction) {
    notFound();
  }

  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold">
        Transaction Details
      </h1>

      <div className="mt-6 max-w-md space-y-4 rounded-lg border p-6">
        <div>
          <p className="text-sm text-muted-foreground">
            Description
          </p>
          <p className="font-medium">
            {transaction.description}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Amount
          </p>
          <p className="text-2xl font-bold">
            {transaction.type === "credit" ? "+" : "-"}
            ₦{transaction.amount.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Type
          </p>
          <p className="capitalize">
            {transaction.type}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Status
          </p>
          <p className="capitalize">
            {transaction.status}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Reference
          </p>
          <p className="break-all text-sm">
            {transaction.reference}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Date
          </p>
          <p>
            {transaction.createdAt.toLocaleString()}
          </p>
        </div>
      </div>
    </main>
  );
}