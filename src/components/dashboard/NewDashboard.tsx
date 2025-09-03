
import React, { useState } from 'react';
import { useAdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';
import { useNavigate } from 'react-router-dom';
import VentesDuJourModal from './modals/VentesDuJourModal';
import BalanceDuJourModal from './modals/BalanceDuJourModal';
import DepensesDuMoisModal from './modals/DepensesDuMoisModal';
import MainStatsCards from './components/MainStatsCards';
import IconStatsCards from './components/IconStatsCards';
import BottomStatsCards from './components/BottomStatsCards';
import SituationCard from './components/SituationCard';

const NewDashboard = () => {
  const { data: stats, isLoading, error } = useAdvancedDashboardStats();
  const navigate = useNavigate();
  
  const [ventesModalOpen, setVentesModalOpen] = useState(false);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [depensesModalOpen, setDepensesModalOpen] = useState(false);

  const handleFacturesImpayeesClick = () => {
    navigate('/reports?tab=unpaid');
  };

  const handleDepensesClick = () => {
    // Rediriger vers l'onglet Sorties du module Finances
    navigate('/cash-registers?tab=expenses&subtab=sorties');
  };

  if (error) {
    console.error('Error loading dashboard stats:', error);
    return (
      <div className="text-center text-red-500 p-4">
        Erreur lors du chargement des statistiques
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Ligne du haut - 4 cartes principales colorées */}
      <MainStatsCards
        stats={stats}
        isLoading={isLoading}
        onVentesClick={() => setVentesModalOpen(true)}
        onBalanceClick={() => setBalanceModalOpen(true)}
        onFacturesImpayeesClick={handleFacturesImpayeesClick}
        onDepensesClick={handleDepensesClick}
      />

      {/* Ligne du milieu - 4 cartes avec icônes */}
      <IconStatsCards stats={stats} isLoading={isLoading} />

      {/* Ligne du bas - 3 cartes horizontales */}
      <BottomStatsCards stats={stats} isLoading={isLoading} />

      {/* Situation actuelle */}
      <SituationCard stats={stats} isLoading={isLoading} />

      {/* Modals */}
      <VentesDuJourModal 
        isOpen={ventesModalOpen} 
        onClose={() => setVentesModalOpen(false)} 
      />
      <BalanceDuJourModal 
        isOpen={balanceModalOpen} 
        onClose={() => setBalanceModalOpen(false)} 
      />
      <DepensesDuMoisModal 
        isOpen={depensesModalOpen} 
        onClose={() => setDepensesModalOpen(false)} 
      />
    </div>
  );
};

export default NewDashboard;
