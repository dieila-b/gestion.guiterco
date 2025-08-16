
import React from 'react';
import SupabaseDebugPanel from '@/components/debug/SupabaseDebugPanel';

const DebugPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Diagnostic et Debug</h1>
        <p className="text-muted-foreground mt-2">
          Outils de diagnostic pour identifier et résoudre les problèmes de chargement des données
        </p>
      </div>
      
      <SupabaseDebugPanel />
    </div>
  );
};

export default DebugPage;
