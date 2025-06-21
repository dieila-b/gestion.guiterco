
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { SortField, SortDirection } from '../types';

interface TableHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

const SortIcon = ({ field, sortField, sortDirection }: { field: SortField; sortField: SortField; sortDirection: SortDirection }) => {
  if (sortField !== field) return null;
  return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
};

export const TableHeader: React.FC<TableHeaderProps> = ({ sortField, sortDirection, onSort }) => {
  return (
    <thead className="bg-muted/50">
      <tr>
        <th className="py-3 px-4 text-left">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort('date')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Date
            <SortIcon field="date" sortField={sortField} sortDirection={sortDirection} />
          </Button>
        </th>
        <th className="py-3 px-4 text-left">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort('type')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Type
            <SortIcon field="type" sortField={sortField} sortDirection={sortDirection} />
          </Button>
        </th>
        <th className="py-3 px-4 text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort('amount')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Montant
            <SortIcon field="amount" sortField={sortField} sortDirection={sortDirection} />
          </Button>
        </th>
        <th className="py-3 px-4 text-left">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort('description')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Description
            <SortIcon field="description" sortField={sortField} sortDirection={sortDirection} />
          </Button>
        </th>
        <th className="py-3 px-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort('source')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Source
            <SortIcon field="source" sortField={sortField} sortDirection={sortDirection} />
          </Button>
        </th>
      </tr>
    </thead>
  );
};
