
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, CreditCard, Package, Star } from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import type { AdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';

interface ModernIconStatsCardsProps {
  stats: AdvancedDashboardStats | undefined;
  isLoading: boolean;
}

const ModernIconStatsCards: React.FC<ModernIconStatsCardsProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      title: "Nombre d'article",
      value: stats?.nombreArticles || 0,
      icon: Mail,
      color: 'bg-cyan-500'
    },
    {
      title: "Règlement fournisseur",
      value: stats?.reglementsFournisseurs || 0,
      icon: CreditCard,
      color: 'bg-green-500'
    },
    {
      title: "Nombre de client",
      value: stats?.nombreClients || 0,
      icon: Package,
      color: 'bg-yellow-500'
    },
    {
      title: "Stock Global",
      value: stats?.stockGlobal || 0,
      icon: Star,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">
                  {card.title}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {isLoading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    formatNumber(card.value)
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

export default ModernIconStatsCards;
