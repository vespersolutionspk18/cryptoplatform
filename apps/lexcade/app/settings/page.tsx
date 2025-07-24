"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SettingsHeader } from "@/components/settings-header";
import { SettingsContent } from "@/components/settings-content";

export default function SettingsPage() {
  return (
    <div className="flex h-svh">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-auto px-4 md:px-6 lg:px-8">
          <SettingsHeader />
          <SettingsContent />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}