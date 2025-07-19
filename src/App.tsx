
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/providers/DataProvider";
import Index from "./pages/Index";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import CashRegisters from "./pages/CashRegisters";
import Clients from "./pages/Clients";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/cash-registers" element={<CashRegisters />} />
              <Route path="/clients" element={<Clients />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </QueryClientProvider>
  );
}

export default App;
