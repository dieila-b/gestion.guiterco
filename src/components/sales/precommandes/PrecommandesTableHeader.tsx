
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PrecommandesTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="font-semibold">N° Précommande</TableHead>
        <TableHead className="font-semibold">Date</TableHead>
        <TableHead className="font-semibold">Client</TableHead>
        <TableHead className="font-semibold">Disponibilité Stock</TableHead>
        <TableHead className="font-semibold">Statut de livraison</TableHead>
        <TableHead className="font-semibold">Statut de paiement</TableHead>
        <TableHead className="font-semibold text-right">Montant TTC</TableHead>
        <TableHead className="font-semibold text-right">Montant payé</TableHead>
        <TableHead className="font-semibold text-right">Reste à payer</TableHead>
        <TableHead className="font-semibold text-center">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default PrecommandesTableHeader;
