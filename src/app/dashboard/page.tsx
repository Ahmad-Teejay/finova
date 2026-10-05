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
import {
  Landmark,
  Send,
  BanknoteArrowDown,
} from "lucide-react";
import User from "@/models/userModel";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await connect();

  // Get logged-in user's profile
  const userProfile = await User.findById(user.userId).select(
    "username email phone accountNumber"
  );

  if (!userProfile) {
    throw new Error("User profile not found");
  }

  // Get user's wallet
  const wallet = await Wallet.findOne({
    user: user.userId,
  });

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  // Only fetch the latest transactions for the dashboard.
  // The complete history will be available on the transactions page.
  const transactions = await Transaction.find({
    user: user.userId,
  })
    .sort({ createdAt: -1 })
    .limit(10);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <DashboardHeader username={user.email} />

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Welcome */}
          <div>
            <h2 className="text-2xl font-bold">
              Welcome back!
            </h2>

            <p className="mt-2 text-muted-foreground">
              {user.email}
            </p>
          </div>

          <div className="mt-6 max-w-md">
            {/* Balance Card */}
            <BalanceCard
              balance={wallet.balance}
              accountNumber={userProfile.accountNumber}
            />

            {/* Quick Actions */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {/* Add Money */}
              <Link href="/dashboard/add-money">
                <div className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-4 text-center transition hover:bg-slate-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Landmark size={20} />
                  </div>

                  <span className="text-sm font-medium text-slate-800">
                    Add Money
                  </span>
                </div>
              </Link>

              {/* Send Money */}
              <Link href="/dashboard/send-money">
                <div className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-4 text-center transition hover:bg-slate-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Send size={20} />
                  </div>

                  <span className="text-sm font-medium text-slate-800">
                    Send Money
                  </span>
                </div>
              </Link>

              {/* Withdraw */}
              <Link href="/dashboard/withdraw">
                <div className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 p-4 text-center transition hover:bg-slate-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <BanknoteArrowDown size={20} />
                  </div>

                  <span className="text-sm font-medium text-slate-800">
                    Withdraw
                  </span>
                </div>
              </Link>
            </div>

            {/* Recent Transactions */}
            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Recent Transactions
                </h3>

                <Link
                  href="/dashboard/transactions"
                  className="text-sm font-medium text-blue-600 transition hover:text-blue-700"
                >
                  See All
                </Link>
              </div>

              <RecentTransactions
                transactions={transactions.map(
                  (transaction) => ({
                    _id: transaction._id.toString(),
                    type: transaction.type,
                    category: transaction.category,
                    amount: transaction.amount,
                    description: transaction.description,
                    status: transaction.status,
                    reference: transaction.reference,
                    createdAt:
                      transaction.createdAt.toISOString(),
                  })
                )}
              />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
