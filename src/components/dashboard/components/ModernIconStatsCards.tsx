
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Nombre d'articles */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Nombre d'article</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats?.nombreArticles || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Règlement fournisseur */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Règlement fournisseur</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats?.reglementsFournisseurs || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nombre de client */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Nombre de client</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats?.nombreClients || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Global */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Stock Global</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? <Skeleton className="h-6 w-16" /> : formatNumber(stats?.stockGlobal || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernIconStatsCards;
