
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from '@/lib/currency';

interface UnpaidInvoicesStatsProps {
  totalFacture: number;
  totalPaye: number;
  totalImpayé: number;
}

const UnpaidInvoicesStats: React.FC<UnpaidInvoicesStatsProps> = ({
  totalFacture,
  totalPaye,
  totalImpayé,
}) => {
  return (
    <div className="flex justify-end gap-4 mb-4">
      <Card className="bg-blue-50 dark:bg-blue-950 min-w-[160px]">
        <CardContent className="pt-4 pb-2 px-4">
          <div className="text-xs font-semibold text-blue-800 dark:text-blue-100 mb-1">Total facturé</div>
          <div className="text-lg font-bold">{formatCurrency(totalFacture)}</div>
        </CardContent>
      </Card>
      <Card className="bg-green-50 dark:bg-green-950 min-w-[160px]">
        <CardContent className="pt-4 pb-2 px-4">
          <div className="text-xs font-semibold text-green-900 dark:text-green-100 mb-1">Total payé</div>
          <div className="text-lg font-bold">{formatCurrency(totalPaye)}</div>
        </CardContent>
      </Card>
      <Card className="bg-red-50 dark:bg-red-950 min-w-[160px]">
        <CardContent className="pt-4 pb-2 px-4">
          <div className="text-xs font-semibold text-red-900 dark:text-red-100 mb-1">Total impayé</div>
          <div className="text-lg font-bold">{formatCurrency(totalImpayé)}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnpaidInvoicesStats;
