
import React from "react";
import ReportsTab from "@/components/cash-register/ReportsTab";
import { AppLayout } from "@/components/layout/AppLayout";

const Reports: React.FC = () => (
  <AppLayout title="Rapports">
    <ReportsTab />
  </AppLayout>
);

export default Reports;
