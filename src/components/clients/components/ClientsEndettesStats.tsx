
import React from 'react';
import { AlertTriangle, DollarSign, FileText } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { StatsGlobales } from '../types';

interface ClientsEndettesStatsProps {
  stats: StatsGlobales;
}

export const ClientsEndettesStats: React.FC<ClientsEndettesStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="text-center p-4 bg-red-50 rounded-lg">
        <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-red-600">{stats.totalClients}</p>
        <p className="text-sm text-gray-600">Clients endettés</p>
      </div>
      <div className="text-center p-4 bg-orange-50 rounded-lg">
        <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-orange-600">
          {formatCurrency(stats.totalDette)}
        </p>
        <p className="text-sm text-gray-600">Total des créances</p>
      </div>
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
        <p className="text-2xl font-bold text-blue-600">{stats.totalFactures}</p>
        <p className="text-sm text-gray-600">Factures impayées</p>
      </div>
      <div className="text-center p-4 bg-purple-50 rounded-lg">
        <p className="text-2xl font-bold text-purple-600">
          {formatCurrency(stats.montantTotal)}
        </p>
        <p className="text-sm text-gray-600">Montant total facturé</p>
      </div>
    </div>
  );
};
