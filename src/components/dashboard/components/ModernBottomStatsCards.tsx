
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Stock Global Achat */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Stock Global Achat</p>
              <p className="text-xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-6 w-24" /> : formatCurrency(stats?.stockGlobalAchat || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock global vente */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Stock global vente</p>
              <p className="text-xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-6 w-24" /> : formatCurrency(stats?.stockGlobalVente || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marge globale en stock */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Marge globale en stock</p>
              <p className="text-xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-6 w-24" /> : formatCurrency(stats?.margeGlobaleStock || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernBottomStatsCards;
