
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, User, ShoppingCart } from 'lucide-react';
import { useCommandesClients } from '@/hooks/useSales';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const VenteComptoirOptimized = () => {
  const { data: commandes, isLoading } = useCommandesClients();
  const [selectedPDV, setSelectedPDV] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const getStatusBadgeColor = (statut: string) => {
    switch (statut) {
      case 'en_cours': return 'default';
      case 'confirmee': return 'secondary';
      case 'livree': return 'outline';
      case 'annulee': return 'destructive';
      default: return 'default';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header avec titre */}
      <div>
        <h2 className="text-2xl font-bold">Vente au comptoir</h2>
      </div>

      {/* Ligne supérieure optimisée */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sélecteur PDV */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Point de vente</label>
          <Select value={selectedPDV} onValueChange={setSelectedPDV}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner PDV" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdv1">PDV Principal</SelectItem>
              <SelectItem value="pdv2">PDV Secondaire</SelectItem>
              <SelectItem value="pdv3">PDV Mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Recherche produit */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Recherche produit</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Scanner ou rechercher..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtres catégories */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Catégorie</label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes catégories</SelectItem>
              <SelectItem value="electronique">Électronique</SelectItem>
              <SelectItem value="vetements">Vêtements</SelectItem>
              <SelectItem value="alimentaire">Alimentaire</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bloc client requis compact */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Client requis</label>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Sélectionner client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client1">Jean Dupont</SelectItem>
                <SelectItem value="client2">Marie Martin</SelectItem>
                <SelectItem value="client3">Pierre Bernard</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Zone principale - deux colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Produits et panier (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Panier actuel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Panier actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Aucun article dans le panier
              </div>
            </CardContent>
          </Card>

          {/* Produits suggérés/recherchés */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Exemples de produits */}
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="aspect-square bg-gray-100 rounded mb-2"></div>
                    <div className="text-sm font-medium">Produit {item}</div>
                    <div className="text-sm text-gray-500">REF-00{item}</div>
                    <div className="font-bold text-blue-600">19.99 €</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite - Actions et historique (1/3) */}
        <div className="space-y-4">
          {/* Actions de vente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle vente
              </Button>
              <Button variant="outline" className="w-full">
                <User className="mr-2 h-4 w-4" />
                Gestion client
              </Button>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filtres avancés
              </Button>
            </CardContent>
          </Card>

          {/* Résumé */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total:</span>
                <span>0.00 €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TVA (20%):</span>
                <span>0.00 €</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total TTC:</span>
                  <span>0.00 €</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historique des ventes récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Ventes récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commandes?.slice(0, 5).map((commande) => (
              <div key={commande.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium">{commande.numero_commande}</div>
                    <div className="text-sm text-gray-500">
                      {commande.client ? `${commande.client.nom} ${commande.client.prenom || ''}`.trim() : 'Client non spécifié'}
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeColor(commande.statut)}>
                    {commande.statut}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-medium">{commande.montant_ttc.toFixed(2)} €</div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(commande.date_commande), 'dd/MM HH:mm', { locale: fr })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VenteComptoirOptimized;
