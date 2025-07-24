"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import UserDropdown from "@/components/user-dropdown";
import { RiArrowLeftLine, RiWalletLine, RiSettings4Line } from "@remixicon/react";
import ThemeToggle from "@/components/theme-toggle";
import Link from "next/link";

export const SettingsHeader = memo(() => {
  return (
    <header className="bg-sidebar/90 backdrop-blur-sm sticky top-0 z-50 -mx-2 px-2">
      <div className="flex shrink-0 items-center gap-2 border-b py-4 w-full max-w-7xl mx-auto">
        <Link href="/">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 mr-2"
            aria-label="Go back"
          >
            <RiArrowLeftLine size={20} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Settings</h1>
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
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            aria-label="Settings"
          >
            <RiSettings4Line size={20} />
          </Button>
          <ThemeToggle />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
});

SettingsHeader.displayName = 'SettingsHeader';