
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Search } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <TableRow>
      <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <Search className="h-12 w-12 text-muted-foreground/50" />
          <span className="text-lg font-medium">Aucune facture trouvée</span>
          <span className="text-sm">Aucune facture impayée ne correspond à vos critères de recherche</span>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default EmptyState;
