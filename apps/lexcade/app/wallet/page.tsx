"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { WalletHeader } from "@/components/wallet-header";
import { WalletContent } from "@/components/wallet-content";

export default function WalletPage() {
  return (
    <div className="flex h-svh">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-auto px-4 md:px-6 lg:px-8">
          <WalletHeader />
          <WalletContent />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}