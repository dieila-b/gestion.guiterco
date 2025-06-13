
import React from 'react';
import ClientSearchDropdown from '../ClientSearchDropdown';

interface ClientSectionProps {
  selectedClient: string;
  setSelectedClient: (value: string) => void;
  onNewClient: () => void;
}

const ClientSection: React.FC<ClientSectionProps> = ({
  selectedClient,
  setSelectedClient,
  onNewClient
}) => {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
        <span className="text-sm font-medium text-red-600">Client requis</span>
      </div>
      <ClientSearchDropdown
        selectedClient={selectedClient}
        setSelectedClient={setSelectedClient}
        onNewClient={onNewClient}
      />
    </div>
  );
};

export default ClientSection;
