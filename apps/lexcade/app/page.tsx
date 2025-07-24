"use client";

import { useId, useState, useMemo, memo } from "react";
import dynamic from "next/dynamic";
import { useCrypto } from "@/contexts/crypto-context";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import UserDropdown from "@/components/user-dropdown";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RiSearch2Line, RiWalletLine, RiSettings4Line } from "@remixicon/react";
import ThemeToggle from "@/components/theme-toggle";
import { Converter } from "@/components/converter-isolated";
import { Card, CardContent } from "@/components/ui/card";
import PeriodSelector, { PERIOD_OPTIONS } from "@/components/period-selector";
import { TransactionsTablePaginated } from "@/components/transactions-table-paginated";

// Dynamically import the chart to ensure it's completely isolated
const ChartContainer = dynamic(() => import("@/components/chart-container"), {
  ssr: false,
  loading: () => <div className="w-full h-110 bg-muted/10 animate-pulse rounded-lg" />
});

// Memoized header component
const Header = memo(() => {
  const id = useId();
  console.log("Header rendered - this should only render once");
  return (
    <header className="bg-sidebar/90 backdrop-blur-sm sticky top-0 z-50 -mx-2 px-2">
      <div className="flex shrink-0 items-center gap-2 border-b py-4 w-full max-w-7xl mx-auto">
        <div className="flex-1">
          <div className="relative inline-flex">
            <Input
              id={id}
              className="h-8 ps-9 pe-9 bg-border border-transparent w-fit min-w-65"
              aria-label="Search"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground peer-disabled:opacity-50">
              <RiSearch2Line size={20} aria-hidden="true" />
            </div>
            <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-muted-foreground">
              <kbd className="inline-flex size-5 max-h-full items-center justify-center rounded bg-background shadow-xs px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                /
              </kbd>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/wallet">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              aria-label="Wallet"
            >
              <RiWalletLine size={20} />
            </Button>
          </Link>
          <Link href="/settings">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8"
              aria-label="Settings"
            >
              <RiSettings4Line size={20} />
            </Button>
          </Link>
          <ThemeToggle />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

// Memoized chart header component
const ChartHeader = memo(({ cryptoConfig, selectedPeriod, onPeriodChange }: {
  cryptoConfig: any;
  selectedPeriod: string;
  onPeriodChange: (value: string) => void;
}) => {
  console.log("ChartHeader rendered - should only render on crypto or period change");
  return (
    <div className="flex flex-col @xl:flex-row @xl:items-center gap-3 mb-6">
      {/* Left side */}
      <div className="flex-1 flex gap-3">
        {/* Coin symbols */}
        <div className="mt-0.5 shrink-0">
          <div className="inline-flex rounded-full border-2 border-card">
            <img
              src={cryptoConfig.logo}
              width={28}
              height={28}
              alt={cryptoConfig.symbol}
              className="rounded-full"
            />
          </div>
        </div>
        {/* Exchange information */}
        <div className="flex flex-col gap-0.5">
          <div className="text-xl font-semibold">
            {cryptoConfig.symbol} <span className="text-muted-foreground">/</span> USD
          </div>
          <div className="text-[13px] text-muted-foreground/72 dark:text-muted-foreground/64 uppercase font-medium">
            Live Data{" "}
            <span className="text-muted-foreground/40">·</span>{" "}
            <span className="animate-pulse text-emerald-500">
              Real-time
            </span>
          </div>
        </div>
      </div>
      {/* Right side */}
      <div className="flex items-center justify-between gap-2">
        <PeriodSelector value={selectedPeriod} onChange={onPeriodChange} />
      </div>
    </div>
  );
});

ChartHeader.displayName = 'ChartHeader';

// Main page component
const PageContent = memo(() => {
  const { cryptoConfig } = useCrypto();
  const [selectedPeriod, setSelectedPeriod] = useState("1m");
  
  const currentPeriodOption = useMemo(
    () => PERIOD_OPTIONS.find(opt => opt.value === selectedPeriod) || PERIOD_OPTIONS[0],
    [selectedPeriod]
  );

  console.log("PageContent rendered - this should only render on period/crypto change");

  return (
    <div className="flex max-lg:flex-col flex-1 gap-6 py-6 w-full max-w-7xl mx-auto">
      {/* Converter widget */}
      <div className="lg:order-1 lg:w-90 shrink-0">
        <Converter />
      </div>
      {/* Chart and table */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <Card className="shadow-2xl rounded-3xl border-transparent dark:border-border/64">
          <CardContent>
            <ChartHeader 
              cryptoConfig={cryptoConfig} 
              selectedPeriod={selectedPeriod} 
              onPeriodChange={setSelectedPeriod} 
            />
            {/* The Chart - Completely isolated */}
            <ChartContainer
              selectedPeriod={selectedPeriod}
              limit={currentPeriodOption?.limit || 60}
            />
          </CardContent>
        </Card>
        <TransactionsTablePaginated />
      </div>
    </div>
  );
});

PageContent.displayName = 'PageContent';

export default function Page() {
  console.log("Root Page rendered - this should only render once");
  
  return (
    <div className="flex h-svh">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="overflow-auto px-4 md:px-6 lg:px-8">
          <Header />
          <PageContent />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}