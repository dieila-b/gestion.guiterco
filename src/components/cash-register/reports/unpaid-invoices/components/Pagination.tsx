
import React from 'react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({ totalItems }) => {
  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>Afficher</span>
        <select className="border rounded px-2 py-1 bg-background">
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
        <span>par page</span>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" disabled>
          Previous
        </Button>
        <span>Page 1 sur 1</span>
        <Button variant="ghost" size="sm" disabled>
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
