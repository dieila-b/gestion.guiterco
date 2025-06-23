
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PrecommandesTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>N° Précommande</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Client</TableHead>
        <TableHead>Produit</TableHead>
        <TableHead>Qté demandée</TableHead>
        <TableHead>Total</TableHead>
        <TableHead>Acompte</TableHead>
        <TableHead>Reste à payer</TableHead>
        <TableHead>Disponibilité estimée</TableHead>
        <TableHead>Statut</TableHead>
        <TableHead className="w-40">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default PrecommandesTableHeader;
