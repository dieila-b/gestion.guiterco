
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface UnpaidInvoicesSummaryProps {
  totalUnpaid: number;
  filteredFacturesCount: number;
  totalOverdue: number;
  overdueFacturesCount: number;
  recoveryRate: number;
}

const UnpaidInvoicesSummary: React.FC<UnpaidInvoicesSummaryProps> = ({
  totalUnpaid,
  filteredFacturesCount,
  totalOverdue,
  overdueFacturesCount,
  recoveryRate,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
            Total impayé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalUnpaid)}</p>
          <p className="text-sm text-muted-foreground">{filteredFacturesCount} factures</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
            En retard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
          <p className="text-sm text-muted-foreground">{overdueFacturesCount} factures</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Taux de recouvrement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{recoveryRate.toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground">Factures payées</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnpaidInvoicesSummary;
