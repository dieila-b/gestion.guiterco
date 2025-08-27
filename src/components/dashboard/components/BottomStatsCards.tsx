
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, TrendingUp, Calculator } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import type { AdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';

interface BottomStatsCardsProps {
  stats: AdvancedDashboardStats | undefined;
  isLoading: boolean;
}

const BottomStatsCards: React.FC<BottomStatsCardsProps> = ({ stats, isLoading }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stock Global Achat */}
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-2">Stock Global Achat</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-7 w-24" /> : formatCurrency(stats?.stockGlobalAchat || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock global vente */}
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-2">Stock global vente</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-7 w-24" /> : formatCurrency(stats?.stockGlobalVente || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marge globale en stock */}
      <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <Calculator className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 mb-2">Marge globale en stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-7 w-24" /> : formatCurrency(stats?.margeGlobaleStock || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BottomStatsCards;
