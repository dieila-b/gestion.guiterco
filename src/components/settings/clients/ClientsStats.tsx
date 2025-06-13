
import React from 'react';

interface Client {
  id: string;
  statut_client?: string;
}

interface ClientsStatsProps {
  clients: Client[];
}

const ClientsStats: React.FC<ClientsStatsProps> = ({ clients }) => {
  if (clients.length === 0) return null;

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="font-medium">Total clients:</span> {clients.length}
        </div>
        <div>
          <span className="font-medium">Particuliers:</span> {clients.filter(c => c.statut_client === 'particulier').length}
        </div>
        <div>
          <span className="font-medium">Entreprises:</span> {clients.filter(c => c.statut_client === 'entreprise').length}
        </div>
      </div>
    </div>
  );
};

export default ClientsStats;
