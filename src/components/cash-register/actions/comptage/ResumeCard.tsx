
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currency';

interface ResumeCardProps {
  montantCalcule: number;
  ecart: number;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ montantCalcule, ecart }) => {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Montant réel</div>
            <div className="text-lg font-semibold">{formatCurrency(montantCalcule)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Écart</div>
            <div className={`text-lg font-semibold ${ecart >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {ecart >= 0 ? '+' : ''}{formatCurrency(ecart)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeCard;
