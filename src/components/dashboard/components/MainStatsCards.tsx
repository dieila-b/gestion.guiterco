
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Vente du jour - Turquoise/Cyan */}
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-cyan-400 to-cyan-500 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl"
        onClick={onVentesClick}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Vente du jour</h3>
              <div className="text-sm text-white/80">{today}</div>
            </div>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold mb-2">
              {isLoading ? <Skeleton className="h-8 w-20 bg-white/20" /> : formatCurrency(stats?.ventesJour || 0)}
            </div>
            <div className="flex justify-end">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-sm font-medium">→</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marge du jour - Vert */}
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-green-400 to-green-500 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl"
        onClick={onMargeClick}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Marge du jour</h3>
              <div className="text-sm text-white/80">{today}</div>
            </div>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold mb-2">
              {isLoading ? <Skeleton className="h-8 w-20 bg-white/20" /> : formatCurrency(stats?.margeJour || 0)}
            </div>
            <div className="flex justify-end">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-sm font-medium">→</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facture impayée du jour - Jaune */}
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-500 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl"
        onClick={onFacturesImpayeesClick}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Facture impayée du jour</h3>
              <div className="text-sm text-white/80">{today}</div>
            </div>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold mb-2">
              {isLoading ? <Skeleton className="h-8 w-20 bg-white/20" /> : formatCurrency(stats?.facturesImpayeesJour || 0)}
            </div>
            <div className="flex justify-end">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-sm font-medium">→</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dépense du mois - Rouge/Coral */}
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-red-400 to-red-500 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl"
        onClick={onDepensesClick}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Dépense du mois</h3>
              <div className="text-sm text-white/80">Savoir plus</div>
            </div>
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold mb-2">
              {isLoading ? <Skeleton className="h-8 w-20 bg-white/20" /> : formatCurrency(stats?.depensesMois || 0)}
            </div>
            <div className="flex justify-end">
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
