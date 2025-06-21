
import React, { useState } from 'react';
import { useAdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';
import { useNavigate } from 'react-router-dom';
import VentesDuJourModal from './modals/VentesDuJourModal';
import MargeDuJourModal from './modals/MargeDuJourModal';
import DepensesDuMoisModal from './modals/DepensesDuMoisModal';
import ModernMainStatsCards from './components/ModernMainStatsCards';
import ModernIconStatsCards from './components/ModernIconStatsCards';
import ModernBottomStatsCards from './components/ModernBottomStatsCards';
import ModernSituationCard from './components/ModernSituationCard';

const ModernDashboard = () => {
  const { data: stats, isLoading, error } = useAdvancedDashboardStats();
  const navigate = useNavigate();
  
  const [ventesModalOpen, setVentesModalOpen] = useState(false);
  const [margeModalOpen, setMargeModalOpen] = useState(false);
  const [depensesModalOpen, setDepensesModalOpen] = useState(false);

  const handleFacturesImpayeesClick = () => {
    navigate('/reports?tab=unpaid');
  };

  const handleDepensesClick = () => {
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Cartes principales colorées */}
        <ModernMainStatsCards
          stats={stats}
          isLoading={isLoading}
          onVentesClick={() => setVentesModalOpen(true)}
          onMargeClick={() => setMargeModalOpen(true)}
          onFacturesImpayeesClick={handleFacturesImpayeesClick}
          onDepensesClick={handleDepensesClick}
        />

        {/* Cartes avec icônes */}
        <ModernIconStatsCards stats={stats} isLoading={isLoading} />

        {/* Cartes du bas */}
        <ModernBottomStatsCards stats={stats} isLoading={isLoading} />

        {/* Situation actuelle */}
        <ModernSituationCard stats={stats} isLoading={isLoading} />

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
    </div>
  );
};

export default ModernDashboard;
