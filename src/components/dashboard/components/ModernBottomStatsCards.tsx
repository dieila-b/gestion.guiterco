
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { AdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';

interface ModernBottomStatsCardsProps {
  stats: AdvancedDashboardStats | undefined;
  isLoading: boolean;
}

const ModernBottomStatsCards: React.FC<ModernBottomStatsCardsProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      title: "Stock Global Achat",
      value: stats?.stockGlobalAchat || 0,
      color: 'bg-cyan-500'
    },
    {
      title: "Stock global vente",
      value: stats?.stockGlobalVente || 0,
      color: 'bg-yellow-500'
    },
    {
      title: "Marge globale en stock",
      value: stats?.margeGlobaleStock || 0,
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">
                  {card.title}
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {isLoading ? (
                    <Skeleton className="h-6 w-24" />
                  ) : (
                    formatCurrency(card.value)
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ModernBottomStatsCards;
