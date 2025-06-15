
import React from 'react';
import { formatCurrency } from '@/lib/currency';

interface PaymentSummaryProps {
  totalAmount: number;
  montantPaye: number;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  totalAmount,
  montantPaye
}) => {
  const restePayer = Math.max(0, totalAmount - montantPaye);

  return (
    <div className="bg-slate-800 text-white p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg">Montant total:</span>
        <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
      </div>
      
      <div className="flex justify-between items-center text-yellow-400">
        <span>Reste à payer:</span>
        <span className="font-bold">{formatCurrency(restePayer)}</span>
      </div>
    </div>
  );
};

export default PaymentSummary;
