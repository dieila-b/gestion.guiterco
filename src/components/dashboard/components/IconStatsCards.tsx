
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Package, CreditCard, Users, BarChart3 } from 'lucide-react';
import { formatAmount } from '@/lib/currency';
import { useViewPermissions } from '@/hooks/useViewPermissions';
import type { AdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';

interface IconStatsCardsProps {
  stats: AdvancedDashboardStats | undefined;
  isLoading: boolean;
}

const IconStatsCards: React.FC<IconStatsCardsProps> = ({ stats, isLoading }) => {
  const { shouldBlurFinancialData } = useViewPermissions();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Nombre d'articles */}
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1">Nombre d'article</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-7 w-16" /> : formatAmount(stats?.nombreArticles || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Règlement fournisseur */}
      <Card className={`bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl ${shouldBlurFinancialData() ? 'blur-sm pointer-events-none select-none opacity-75' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1">Règlement fournisseur</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-7 w-16" /> : (shouldBlurFinancialData() ? '• • • • •' : formatAmount(stats?.reglementsFournisseurs || 0))}
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
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1">Nombre de client</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-7 w-16" /> : formatAmount(stats?.nombreClients || 0)}
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
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-1">Stock Global</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-7 w-16" /> : formatAmount(stats?.stockGlobal || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IconStatsCards;
