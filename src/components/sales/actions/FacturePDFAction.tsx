
import React from 'react';
import FacturePDFGenerator from '../pdf/FacturePDFGenerator';
import type { FactureVente } from '@/types/sales';

interface FacturePDFActionProps {
  facture: FactureVente;
}

const FacturePDFAction: React.FC<FacturePDFActionProps> = ({ facture }) => {
  const handlePDFGenerated = () => {
    console.log(`PDF généré pour la facture ${facture.numero_facture}`);
  };

  return (
    <FacturePDFGenerator 
      facture={facture} 
      onGenerate={handlePDFGenerated}
    />
  );
};

export default FacturePDFAction;
