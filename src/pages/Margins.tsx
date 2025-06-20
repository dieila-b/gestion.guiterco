
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import MarginReports from '@/components/margins/MarginReports';

const Margins = () => {
  return (
    <AppLayout title="Marges Commerciales">
      <MarginReports />
    </AppLayout>
  );
};

export default Margins;
