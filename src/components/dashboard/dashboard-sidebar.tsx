import Link from "next/link";

export default function DashboardSidebar() {
  return (
    <aside className="hidden w-60 border-r p-4 md:block">
      <nav className="space-y-2">
        <Link
          href="/dashboard"
          className="block rounded-md p-2 hover:bg-muted"
        >
          Dashboard
        </Link>

        <Link
          href="/dashboard/wallet"
          className="block rounded-md p-2 hover:bg-muted"
        >
          Wallet
        </Link>

        <Link
          href="/dashboard/transactions"
          className="block rounded-md p-2 hover:bg-muted"
        >
          Transactions
        </Link>
      </nav>
    </aside>
  );
}