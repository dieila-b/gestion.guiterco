
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';

interface SoldeTheoriqueCardProps {
  soldeTheorique: number;
}

const SoldeTheoriqueCard: React.FC<SoldeTheoriqueCardProps> = ({ soldeTheorique }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Solde théorique</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-blue-600">
          {formatCurrency(soldeTheorique)}
        </div>
      </CardContent>
    </Card>
  );
};

export default SoldeTheoriqueCard;
