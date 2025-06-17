
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useAdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Mail, CreditCard, Users, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VentesDuJourModal from './modals/VentesDuJourModal';
import MargeDuJourModal from './modals/MargeDuJourModal';
import DepensesDuMoisModal from './modals/DepensesDuMoisModal';

const NewDashboard = () => {
  const { data: stats, isLoading, error } = useAdvancedDashboardStats();
  const navigate = useNavigate();
  
  const [ventesModalOpen, setVentesModalOpen] = useState(false);
  const [margeModalOpen, setMargeModalOpen] = useState(false);
  const [depensesModalOpen, setDepensesModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const handleFacturesImpayeesClick = () => {
    navigate('/cash-registers?tab=reports&subtab=unpaid-invoices');
  };

  if (error) {
    console.error('Error loading dashboard stats:', error);
    return (
      <div className="text-center text-red-500 p-4">
        Erreur lors du chargement des statistiques
      </div>
    );
  }

  const today = new Date().toLocaleDateString('fr-FR');

  return (
    <div className="space-y-6 p-6">
      {/* Ligne du haut - 4 cartes principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vente du jour */}
        <Card 
          className="relative overflow-hidden bg-gradient-to-br from-cyan-400 to-cyan-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setVentesModalOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="text-4xl font-bold">
                {isLoading ? <Skeleton className="h-10 w-8 bg-white/20" /> : formatCurrency(stats?.ventesJour || 0)}
              </div>
            </div>
            <div className="text-white/90 text-sm mb-2">Vente du jour</div>
            <div className="flex items-center justify-between text-sm">
              <span>{today}</span>
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                →
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marge du jour */}
        <Card 
          className="relative overflow-hidden bg-gradient-to-br from-green-400 to-green-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setMargeModalOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="text-4xl font-bold">
                {isLoading ? <Skeleton className="h-10 w-8 bg-white/20" /> : formatCurrency(stats?.margeJour || 0)}
              </div>
            </div>
            <div className="text-white/90 text-sm mb-2">Marge du jour</div>
            <div className="flex items-center justify-between text-sm">
              <span>{today}</span>
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                →
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facture impayée du jour */}
        <Card 
          className="relative overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={handleFacturesImpayeesClick}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="text-4xl font-bold">
                {isLoading ? <Skeleton className="h-10 w-8 bg-white/20" /> : formatCurrency(stats?.facturesImpayeesJour || 0)}
              </div>
            </div>
            <div className="text-white/90 text-sm mb-2">Facture impayée du jour</div>
            <div className="flex items-center justify-between text-sm">
              <span>{today}</span>
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                →
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dépense du mois */}
        <Card 
          className="relative overflow-hidden bg-gradient-to-br from-red-400 to-red-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setDepensesModalOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="text-4xl font-bold">
                {isLoading ? <Skeleton className="h-10 w-8 bg-white/20" /> : formatCurrency(stats?.depensesMois || 0)}
              </div>
            </div>
            <div className="text-white/90 text-sm mb-2">Dépense du mois</div>
            <div className="flex items-center justify-between text-sm">
              <span>Savoir plus</span>
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                →
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ligne du milieu - 4 cartes avec icônes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nombre d'articles */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Nombre d'article</div>
              <div className="text-xl font-bold">
                {isLoading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats?.nombreArticles || 0)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Règlement fournisseur */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Règlement fournisseur</div>
              <div className="text-xl font-bold">
                {isLoading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats?.reglementsFournisseurs || 0)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nombre de client */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Nombre de client</div>
              <div className="text-xl font-bold">
                {isLoading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats?.nombreClients || 0)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Global */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Stock Global</div>
              <div className="text-xl font-bold">
                {isLoading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats?.stockGlobal || 0)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ligne du bas - 3 cartes horizontales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stock Global Achat */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Stock Global Achat</div>
              <div className="text-lg font-bold">
                {isLoading ? <Skeleton className="h-6 w-24" /> : formatCurrency(stats?.stockGlobalAchat || 0)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock global vente */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Stock global vente</div>
              <div className="text-lg font-bold">
                {isLoading ? <Skeleton className="h-6 w-24" /> : formatCurrency(stats?.stockGlobalVente || 0)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Marge globale en stock */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Marge globale en stock</div>
              <div className="text-lg font-bold">
                {isLoading ? <Skeleton className="h-6 w-24" /> : formatCurrency(stats?.margeGlobaleStock || 0)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Situation actuelle */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Situation actuelle</h2>
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Solde Avoir :</span>
                  <span className="font-bold text-lg">
                    {isLoading ? <Skeleton className="h-6 w-32" /> : formatCurrency(stats?.soldeAvoir || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Solde Devoir :</span>
                  <span className="font-bold text-lg">
                    {isLoading ? <Skeleton className="h-6 w-32" /> : formatCurrency(stats?.soldeDevoir || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-gray-600">Situation normale :</span>
                  <span className="font-bold text-xl text-green-600">
                    {isLoading ? <Skeleton className="h-6 w-32" /> : formatCurrency(stats?.situationNormale || 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <VentesDuJourModal 
        isOpen={ventesModalOpen} 
        onClose={() => setVentesModalOpen(false)} 
      />
      <MargeDuJourModal 
        isOpen={margeModalOpen} 
        onClose={() => setMargeModalOpen(false)} 
      />
      <DepensesDuMoisModal 
        isOpen={depensesModalOpen} 
        onClose={() => setDepensesModalOpen(false)} 
      />
    </div>
  );
};

export default NewDashboard;
