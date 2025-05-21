
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

const Purchases = () => {
  return (
    <AppLayout title="Achats">
      <div className="flex justify-center items-center h-60">
        <p className="text-lg text-muted-foreground">
          Module d'achats en cours de développement...
        </p>
      </div>
    </AppLayout>
  );
};

export default Purchases;
