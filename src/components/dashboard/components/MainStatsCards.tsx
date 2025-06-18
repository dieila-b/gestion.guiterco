
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '../utils/formatters';
import type { AdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';

interface MainStatsCardsProps {
  stats: AdvancedDashboardStats | undefined;
  isLoading: boolean;
  onVentesClick: () => void;
  onMargeClick: () => void;
  onFacturesImpayeesClick: () => void;
  onDepensesClick: () => void;
}

const MainStatsCards: React.FC<MainStatsCardsProps> = ({
  stats,
  isLoading,
  onVentesClick,
  onMargeClick,
  onFacturesImpayeesClick,
  onDepensesClick,
}) => {
  const today = new Date().toLocaleDateString('fr-FR');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Vente du jour */}
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-cyan-400 to-cyan-600 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={onVentesClick}
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
        onClick={onMargeClick}
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
        onClick={onFacturesImpayeesClick}
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
        onClick={onDepensesClick}
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
  );
};

export default MainStatsCards;
