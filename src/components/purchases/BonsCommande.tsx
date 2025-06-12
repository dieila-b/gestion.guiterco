
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Check, Trash, Printer, Plus, Search } from 'lucide-react';
import { useBonsCommande } from '@/hooks/usePurchases';
import { useAllBonCommandeArticles } from '@/hooks/useBonCommandeArticles';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CreateBonCommandeDialog } from './CreateBonCommandeDialog';
import { formatCurrency } from '@/lib/currency';
import { toast } from '@/hooks/use-toast';

const BonsCommande = () => {
  const { bonsCommande, isLoading, updateBonCommande, deleteBonCommande } = useBonsCommande();
  const { articlesCounts, isLoading: loadingArticles } = useAllBonCommandeArticles();
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_cours': return 'default';
      case 'valide': return 'secondary';
      case 'livre': return 'outline';
      case 'annule': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'en_cours': return 'En attente';
      case 'valide': return 'Approuvé';
      case 'livre': return 'Livré';
      case 'annule': return 'Annulé';
      default: return statut;
    }
  };

  const formatNumeroCommande = (numero: string, date: string) => {
    if (numero.startsWith('BC-')) {
      return numero;
    }
    
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const time = Date.now().toString().slice(-3);
    
    return `BC-${year}-${month}-${day}-${time}`;
  };

  const handleApprove = async (id: string) => {
    try {
      await updateBonCommande.mutateAsync({
        id,
        statut: 'valide'
      });
      
      // TODO: Générer automatiquement un bon de livraison
      toast({
        title: "Bon de commande approuvé",
        description: "Un bon de livraison sera généré automatiquement.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error approving bon de commande:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bon de commande ?')) {
      try {
        await deleteBonCommande.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting bon de commande:', error);
      }
    }
  };

  const handlePrint = (id: string) => {
    // TODO: Implémenter la fonctionnalité d'impression
    toast({
      title: "Impression",
      description: "Fonctionnalité d'impression en cours de développement.",
      variant: "default",
    });
  };

  const filteredBons = bonsCommande?.filter(bon =>
    bon.numero_bon.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.fournisseur.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Bons de commande</h2>
          <p className="text-gray-400">Gérez vos bons de commande fournisseurs</p>
        </div>
        <CreateBonCommandeDialog />
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Liste des bons de commande</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">N° Commande</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Fournisseur</TableHead>
                <TableHead className="text-gray-300">Articles</TableHead>
                <TableHead className="text-gray-300">Statut</TableHead>
                <TableHead className="text-gray-300">Total</TableHead>
                <TableHead className="text-gray-300 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBons.map((bon) => {
                const articlesCount = articlesCounts[bon.id] || 0;
                return (
                  <TableRow key={bon.id} className="border-gray-700 hover:bg-gray-700/50">
                    <TableCell className="text-white font-medium">
                      {formatNumeroCommande(bon.numero_bon, bon.date_commande)}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {format(new Date(bon.date_commande), 'dd/MM/yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {bon.fournisseur}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                        {articlesCount} article{articlesCount > 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeColor(bon.statut)} className="text-xs">
                        {getStatusLabel(bon.statut)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white font-semibold">
                      {formatCurrency(bon.montant_total)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300"
                          title="Éditer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {bon.statut === 'en_cours' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-green-400 hover:bg-green-500/20 hover:text-green-300"
                            onClick={() => handleApprove(bon.id)}
                            title="Approuver"
                          >
                            <Check className="h-4 w-4" />
                        </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                          onClick={() => handleDelete(bon.id)}
                          title="Supprimer"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-500/20 hover:text-gray-300"
                          onClick={() => handlePrint(bon.id)}
                          title="Imprimer"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredBons.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? 'Aucun résultat trouvé' : 'Aucun bon de commande trouvé'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BonsCommande;
