
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from 'lucide-react';

interface Client {
  id: string;
  nom: string;
  nom_entreprise?: string;
  statut_client?: string;
  type_client?: string;
  email?: string;
  telephone?: string;
  whatsapp?: string;
  ville?: string;
}

interface ClientsTableProps {
  clients: Client[];
  searchTerm: string;
  onDelete: (id: string) => void;
}

const ClientsTable: React.FC<ClientsTableProps> = ({ clients, searchTerm, onDelete }) => {
  // Filter clients based on search term
  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.nom.toLowerCase().includes(searchLower) ||
      (client.nom_entreprise && client.nom_entreprise.toLowerCase().includes(searchLower)) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      (client.telephone && client.telephone.includes(searchTerm))
    );
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom / Entreprise</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Téléphone</TableHead>
          <TableHead>Ville</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredClients.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
              {searchTerm ? 'Aucun client trouvé pour cette recherche' : 'Aucun client enregistré'}
            </TableCell>
          </TableRow>
        ) : (
          filteredClients.map((client) => {
            const displayName = client.statut_client === 'entreprise' && client.nom_entreprise 
              ? `${client.nom_entreprise} (${client.nom})`
              : client.nom;
            
            return (
              <TableRow key={client.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-semibold">{displayName}</div>
                    {client.statut_client && (
                      <div className="text-xs text-gray-500 capitalize">
                        {client.statut_client}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                    {client.type_client || 'Non défini'}
                  </span>
                </TableCell>
                <TableCell>{client.nom}</TableCell>
                <TableCell>{client.email || '-'}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {client.telephone && <div>{client.telephone}</div>}
                    {client.whatsapp && <div className="text-xs text-green-600">WhatsApp: {client.whatsapp}</div>}
                  </div>
                </TableCell>
                <TableCell>{client.ville || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onDelete(client.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default ClientsTable;
