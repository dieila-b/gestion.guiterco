
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { AdvancedDashboardStats } from '@/hooks/useAdvancedDashboardStats';

interface SituationCardProps {
  stats: AdvancedDashboardStats | undefined;
  isLoading: boolean;
}

const SituationCard: React.FC<SituationCardProps> = ({ stats, isLoading }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Situation actuelle</h2>
      <Card className="bg-white border border-gray-100 shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-12">
            {/* Solde Avoir */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700 mb-1">Solde Avoir :</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(stats?.soldeAvoir || 0)}
                </p>
              </div>
            </div>

            {/* Separator */}
            <div className="h-16 w-px bg-gray-200"></div>

            {/* Solde Devoir */}
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-lg font-medium text-gray-700 mb-1">Solde Devoir :</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(stats?.soldeDevoir || 0)}
                </p>
              </div>
            </div>

            {/* Separator */}
            <div className="h-16 w-px bg-gray-200"></div>

            {/* Situation normale */}
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-lg font-medium text-gray-700 mb-1">Situation normale :</p>
                <p className="text-2xl font-bold text-green-600">
                  {isLoading ? <Skeleton className="h-8 w-36" /> : formatCurrency(stats?.situationNormale || 0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SituationCard;
