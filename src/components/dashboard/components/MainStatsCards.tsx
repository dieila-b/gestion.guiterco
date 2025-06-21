
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, DollarSign, AlertTriangle, CreditCard } from 'lucide-react';
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Vente du jour - Bleu */}
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl"
        onClick={onVentesClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-20 bg-white/20" /> : formatCurrency(stats?.ventesJour || 0)}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white/90">Vente du jour</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">{today}</span>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-sm font-medium">→</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marge du jour - Vert */}
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl"
        onClick={onMargeClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-20 bg-white/20" /> : formatCurrency(stats?.margeJour || 0)}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white/90">Marge du jour</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">{today}</span>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-sm font-medium">→</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facture impayée du jour - Jaune */}
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl"
        onClick={onFacturesImpayeesClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-20 bg-white/20" /> : formatCurrency(stats?.facturesImpayeesJour || 0)}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white/90">Facture impayée du jour</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">{today}</span>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-sm font-medium">→</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dépense du mois - Rouge */}
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl"
        onClick={onDepensesClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-20 bg-white/20" /> : formatCurrency(stats?.depensesMois || 0)}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white/90">Dépense du mois</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">Savoir plus</span>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-sm font-medium">→</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MainStatsCards;
