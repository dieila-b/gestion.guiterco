
import React, { useState, useMemo } from 'react';
import { usePrecommandesComplete } from '@/hooks/precommandes/usePrecommandesComplete';
import PrecommandesTable from './precommandes/PrecommandesTable';
import PrecommandesFilters from './precommandes/PrecommandesFilters';
import CreatePrecommandeDialog from './precommandes/CreatePrecommandeDialog';
import { useToast } from '@/hooks/use-toast';

const Precommandes = () => {
  const { data: precommandes, isLoading } = usePrecommandesComplete();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [showCreateDialog, setShowCreateDialog] = useState(false');

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
        <PrecommandesTable precommandes={filteredPrecommandes} />
      )}

      <CreatePrecommandeDialog 
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </div>
  );
};

export default Precommandes;
