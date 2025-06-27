
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const PrecommandesTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="font-semibold">N° Précommande</TableHead>
        <TableHead className="font-semibold">Date</TableHead>
        <TableHead className="font-semibold">Client</TableHead>
        <TableHead className="font-semibold">Disponibilité</TableHead>
        <TableHead className="font-semibold">Statut</TableHead>
        <TableHead className="font-semibold text-right">Montant TTC</TableHead>
        <TableHead className="font-semibold text-center">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default PrecommandesTableHeader;
