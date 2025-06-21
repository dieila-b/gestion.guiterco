
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { AdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';

interface SituationCardProps {
  stats: AdvancedDashboardStats | undefined;
  isLoading: boolean;
}

const SituationCard: React.FC<SituationCardProps> = ({ stats, isLoading }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Situation actuelle</h2>
      <Card className="bg-white border border-gray-100 shadow-md rounded-xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-medium text-gray-700">Solde Avoir :</span>
                <span className="text-2xl font-bold text-green-600">
                  {isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(stats?.soldeAvoir || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-lg font-medium text-gray-700">Solde Devoir :</span>
                <span className="text-2xl font-bold text-gray-900">
                  {isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(stats?.soldeDevoir || 0)}
                </span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Situation normale :</span>
                  <span className="text-3xl font-bold text-green-600">
                    {isLoading ? <Skeleton className="h-9 w-36" /> : formatCurrency(stats?.situationNormale || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SituationCard;
