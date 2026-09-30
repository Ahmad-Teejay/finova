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
import { Landmark, Send, BanknoteArrowDown } from "lucide-react";
import User from "@/models/userModel";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await connect();

  const userProfile = await User.findById(user.userId).select(
    "username email phone accountNumber"
  );

  if(!userProfile){
    throw new Error("User profile not found")
  }

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DashboardHeader username={user.email} />

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
              accountNumber={userProfile.accountNumber}
            />

            <div className="mt-6 grid grid-cols-3 gap-3">
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