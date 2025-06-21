
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { ComptageDetails } from '@/hooks/cash';
import CoupureInput from './CoupureInput';

interface ModeDetailleCardProps {
  coupures: ComptageDetails;
  onCoupureChange: (field: keyof ComptageDetails, value: number) => void;
  montantCalcule: number;
}

const ModeDetailleCard: React.FC<ModeDetailleCardProps> = ({ 
  coupures, 
  onCoupureChange, 
  montantCalcule 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center">
          <Banknote className="mr-2 h-4 w-4" />
          Détail par coupures (GNF)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <h4 className="font-medium">Billets en Francs Guinéens</h4>
          <CoupureInput label="20 000 GNF" value={20000} field="billet_20000" coupures={coupures} onCoupureChange={onCoupureChange} />
          <CoupureInput label="10 000 GNF" value={10000} field="billet_10000" coupures={coupures} onCoupureChange={onCoupureChange} />
          <CoupureInput label="5 000 GNF" value={5000} field="billet_5000" coupures={coupures} onCoupureChange={onCoupureChange} />
          <CoupureInput label="2 000 GNF" value={2000} field="billet_2000" coupures={coupures} onCoupureChange={onCoupureChange} />
          <CoupureInput label="1 000 GNF" value={1000} field="billet_1000" coupures={coupures} onCoupureChange={onCoupureChange} />
          <CoupureInput label="500 GNF" value={500} field="billet_500" coupures={coupures} onCoupureChange={onCoupureChange} />
        </div>
        <div className="border-t pt-2">
          <div className="flex justify-between font-medium">
            <span>Total calculé:</span>
            <span>{formatCurrency(montantCalcule)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModeDetailleCard;
