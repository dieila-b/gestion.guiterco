
import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
import CashRegisterOverview from '@/components/cash-register/CashRegisterOverview';
import CompleteTransactionHistory from '@/components/cash-register/CompleteTransactionHistory';
import AddCashRegisterDialog from '@/components/cash-register/AddCashRegisterDialog';
import { useCashRegisters } from '@/hooks/useCashRegisters';
import ExpensesTab from '@/components/cash-register/ExpensesTab';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const CashRegisters: React.FC = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [selectedRegister, setSelectedRegister] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Récupérer les paramètres d'URL
  const tabParam = searchParams.get('tab');
  const subtabParam = searchParams.get('subtab');
  
  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  const [activeSubTab, setActiveSubTab] = useState(subtabParam || 'daily');

  // Fetch data from Supabase
  const { data: cashRegisters, isLoading: registersLoading } = useCashRegisters();

  // Set default selected register when data loads
  useEffect(() => {
    if (cashRegisters && cashRegisters.length > 0 && !selectedRegister) {
      setSelectedRegister(cashRegisters[0].id);
    }
  }, [cashRegisters, selectedRegister]);

  // Mettre à jour l'onglet actif depuis l'URL
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setLoading(true);
    setActiveTab(value);
    // Simuler un petit délai pour le chargement
    setTimeout(() => setLoading(false), 200);
  };

  const handleRegisterCreated = () => {
    toast({
      title: "Caisse créée",
      description: "La nouvelle caisse a été créée avec succès",
    });
  };

  if (registersLoading) {
    return (
      <AppLayout title="Gestion des finances">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <span className="ml-2 text-gray-600">Chargement des caisses...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Gestion des finances">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="expenses">Dépenses</TabsTrigger>
          </TabsList>
          <div className="space-x-2">
            <AddCashRegisterDialog onRegisterCreated={handleRegisterCreated} />
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
              <span className="ml-2 text-gray-600">Chargement de l'aperçu...</span>
            </div>
          ) : (
            <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="daily">Aperçu du jour</TabsTrigger>
                <TabsTrigger value="complete">Historique complet</TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="space-y-4">
                <CashRegisterOverview />
              </TabsContent>

              <TabsContent value="complete" className="space-y-4">
                <CompleteTransactionHistory />
              </TabsContent>
            </Tabs>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
              <span className="ml-2 text-gray-600">Chargement des dépenses...</span>
            </div>
          ) : (
            <ExpensesTab initialSubTab={subtabParam} />
          )}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default CashRegisters;
