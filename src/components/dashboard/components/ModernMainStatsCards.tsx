
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { AdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';

interface ModernMainStatsCardsProps {
  stats: AdvancedDashboardStats | undefined;
  isLoading: boolean;
  onVentesClick: () => void;
  onMargeClick: () => void;
  onFacturesImpayeesClick: () => void;
  onDepensesClick: () => void;
}

const ModernMainStatsCards: React.FC<ModernMainStatsCardsProps> = ({
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
      {/* Vente du jour - Bleu */}
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-cyan-400 to-cyan-600 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
        onClick={onVentesClick}
      >
        <CardContent className="p-6">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Vente du jour</h3>
                <p className="text-sm text-white/80">{today}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold mt-auto">
              {isLoading ? <Skeleton className="h-8 w-32 bg-white/20" /> : formatCurrency(stats?.ventesJour || 0)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marge du jour - Vert */}
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-green-400 to-green-600 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
        onClick={onMargeClick}
      >
        <CardContent className="p-6">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Marge du jour</h3>
                <p className="text-sm text-white/80">{today}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold mt-auto">
              {isLoading ? <Skeleton className="h-8 w-32 bg-white/20" /> : formatCurrency(stats?.margeJour || 0)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facture impayée du jour - Jaune */}
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
        onClick={onFacturesImpayeesClick}
      >
        <CardContent className="p-6">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Facture impayée du jour</h3>
                <p className="text-sm text-white/80">{today}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold mt-auto">
              {isLoading ? <Skeleton className="h-8 w-32 bg-white/20" /> : formatCurrency(stats?.facturesImpayeesJour || 0)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dépense du mois - Rouge */}
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-red-400 to-red-600 text-white border-0 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105"
        onClick={onDepensesClick}
      >
        <CardContent className="p-6">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Dépense du mois</h3>
                <p className="text-sm text-white/80">Savoir plus</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold mt-auto">
              {isLoading ? <Skeleton className="h-8 w-32 bg-white/20" /> : formatCurrency(stats?.depensesMois || 0)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernMainStatsCards;
