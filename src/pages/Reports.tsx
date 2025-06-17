
import React, { useEffect, useState } from "react";
import ReportsTab from "@/components/cash-register/ReportsTab";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSearchParams } from "react-router-dom";

const Reports: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [defaultTab, setDefaultTab] = useState("daily-report");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "unpaid") {
      setDefaultTab("unpaid");
    }
  }, [searchParams]);

  return (
    <AppLayout title="Rapports">
      <ReportsTab defaultTab={defaultTab} />
    </AppLayout>
  );
};

export default Reports;
