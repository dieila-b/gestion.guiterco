import React from "react";
import ReportsTab from "@/components/cash-register/ReportsTab";
import { AppLayout } from "@/components/layout/AppLayout";
import ClientsReportsTabs from "@/components/cash-register/reports/ClientsReportsTabs";

const Reports: React.FC = () => (
  <AppLayout title="Rapports">
    <ClientsReportsTabs />
  </AppLayout>
);

export default Reports;
