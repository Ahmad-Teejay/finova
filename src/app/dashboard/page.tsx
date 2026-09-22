import { connect } from "@/dbConfig/dbConfig";
import Wallet from "@/models/walletModel";
import { getCurrentUser } from "@/helpers/auth";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import BalanceCard from "@/components/dashboard/balance-card";
import Transaction from "@/models/transactionModel";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await connect();

  const wallet = await Wallet.findOne({
    user: user.userId,
  });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const transactions = await Transaction.find({
    user: user.userId,
  }).sort({createdAt: -1 });

  if(!transactions){
    throw new Error("Transaction not found");
    
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader />

      <div className="flex">
        <DashboardSidebar />

        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold">
            Welcome back!
          </h2>

          <p className="mt-2 text-muted-foreground">
            {user.email}
          </p>

          <div className="mt-6 max-w-md">
            <BalanceCard
              balance={wallet.balance}
              currency={wallet.currency}
            />

          <div className="mt-6 flex gap-5">
            <Link href="/dashboard/add-money">
              <Button> 
                Add Money
              </Button>
            </Link>

            <Link href="/dashboard/send-money">
            <Button>
              Send Money
            </Button>
            </Link>

            <Link href="/dashboard/withdraw">
            <Button>
              Withdrawal
            </Button>
            </Link>
          </div>

            <RecentTransactions
            transactions={transactions.map((transaction) => ({
              _id: transaction._id.toString(),
              type: transaction.type,
              amount: transaction.amount,
              description: transaction.description,
              status: transaction.status,
              reference: transaction.status,
              createdAt: transaction.createdAt.toISOString(),
            }))}
            />
          </div>
        </main>
      </div>
    </div>
  );
}