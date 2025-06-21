
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

  const cards = [
    {
      title: 'Vente du jour',
      value: stats?.ventesJour || 0,
      date: today,
      color: 'from-cyan-400 to-cyan-500',
      onClick: onVentesClick
    },
    {
      title: 'Marge du jour',
      value: stats?.margeJour || 0,
      date: today,
      color: 'from-green-400 to-green-500',
      onClick: onMargeClick
    },
    {
      title: 'Facture impayée du jour',
      value: stats?.facturesImpayeesJour || 0,
      date: today,
      color: 'from-yellow-400 to-yellow-500',
      onClick: onFacturesImpayeesClick
    },
    {
      title: 'Dépense du mois',
      value: stats?.depensesMois || 0,
      date: 'Savoir plus',
      color: 'from-red-400 to-red-500',
      onClick: onDepensesClick
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card
          key={index}
          className={`relative overflow-hidden bg-gradient-to-br ${card.color} text-white border-0 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105`}
          onClick={card.onClick}
        >
          <CardContent className="p-6">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-white/90 text-sm font-medium mb-4">
                  {card.title}
                </h3>
                <div className="text-3xl font-bold mb-4">
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 bg-white/20" />
                  ) : (
                    formatCurrency(card.value)
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">
                  {card.date}
                </span>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ModernMainStatsCards;
