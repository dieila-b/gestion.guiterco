
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <AppHeader title={title || "Dashboard"} />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
