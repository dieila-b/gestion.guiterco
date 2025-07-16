
import React, { useState, useMemo } from 'react';
import { usePrecommandesComplete } from '@/hooks/precommandes/usePrecommandesComplete';
import PrecommandesTable from './precommandes/PrecommandesTable';
import PrecommandesTableRowRestructured from './precommandes/PrecommandesTableRowRestructured';
import PrecommandesFilters from './precommandes/PrecommandesFilters';
import CreatePrecommandeDialog from './precommandes/CreatePrecommandeDialog';
import PrecommandesManagementTabs from './precommandes/PrecommandesManagementTabs';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, List, Settings } from 'lucide-react';

const Precommandes = () => {
  const { data: precommandes, isLoading } = usePrecommandesComplete();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filtrage des précommandes
  const filteredPrecommandes = useMemo(() => {
    if (!precommandes) return [];

    return precommandes.filter((precommande) => {
      // Filtre par statut
      if (statusFilter !== 'tous' && precommande.statut !== statusFilter) {
        return false;
      }

      // Filtre par recherche (client ou produit)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const clientMatch = precommande.client?.nom?.toLowerCase().includes(searchLower);
        const produitMatch = precommande.lignes_precommande?.some(ligne => 
          ligne.article?.nom?.toLowerCase().includes(searchLower)
        );
        const numeroMatch = precommande.numero_precommande.toLowerCase().includes(searchLower);
        
        if (!clientMatch && !produitMatch && !numeroMatch) {
          return false;
        }
      }

      return true;
    });
  }, [precommandes, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg">Chargement des précommandes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Précommandes</h1>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Liste des précommandes
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gestion automatique
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <div className="space-y-6">
            <PrecommandesFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onNouvellePrecommande={() => setShowCreateDialog(true)}
            />

            {filteredPrecommandes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  {searchTerm || statusFilter !== 'tous' 
                    ? 'Aucune précommande ne correspond aux critères de recherche.'
                    : 'Aucune précommande trouvée.'
                  }
                </p>
                {!searchTerm && statusFilter === 'tous' && (
                  <button
                    onClick={() => setShowCreateDialog(true)}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Créer votre première précommande
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        N° Précommande
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Disponibilité Stock
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut de Livraison
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut de Paiement
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant TTC
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant Payé
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reste à Payer
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPrecommandes.map((precommande) => (
                      <PrecommandesTableRowRestructured 
                        key={precommande.id} 
                        precommande={precommande} 
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <CreatePrecommandeDialog 
              open={showCreateDialog}
              onClose={() => setShowCreateDialog(false)}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="management" className="mt-6">
          <PrecommandesManagementTabs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Precommandes;
