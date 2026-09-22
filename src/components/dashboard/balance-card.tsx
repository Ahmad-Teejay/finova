import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BalanceCardProps {
  balance: number;
  currency: string;
}

export default function BalanceCard({
  balance,
  currency,
}: BalanceCardProps) {
  return (
    <Card className="bg-black text-white">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Available Balance
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-4xl font-semibold tracking-tight tabular-nums">
           {currency} {balance.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}