
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Package, CreditCard, Users, BarChart3 } from 'lucide-react';
import { formatNumber } from '../utils/formatters';
import type { AdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';

interface IconStatsCardsProps {
  stats: AdvancedDashboardStats | undefined;
  isLoading: boolean;
}

const IconStatsCards: React.FC<IconStatsCardsProps> = ({ stats, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Nombre d'articles */}
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1">Nombre d'article</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-7 w-16" /> : formatNumber(stats?.nombreArticles || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Règlement fournisseur */}
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1">Règlement fournisseur</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-7 w-16" /> : formatNumber(stats?.reglementsFournisseurs || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nombre de client */}
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1">Nombre de client</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-7 w-16" /> : formatNumber(stats?.nombreClients || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Global */}
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1">Stock Global</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-7 w-16" /> : formatNumber(stats?.stockGlobal || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IconStatsCards;
