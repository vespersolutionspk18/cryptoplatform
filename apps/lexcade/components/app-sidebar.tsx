"use client";

import * as React from "react";
import { memo, useCallback } from "react";
import { useCrypto, CryptoType, CRYPTO_CONFIGS } from "@/contexts/crypto-context";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Navigation items generated from CRYPTO_CONFIGS
const navigationItems = Object.values(CRYPTO_CONFIGS).map(config => ({
  title: config.name,
  cryptoType: config.symbol,
  icon: config.logo,
}));

const AppSidebarComponent = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { selectedCrypto, setSelectedCrypto } = useCrypto();
  
  const handleCryptoSelect = useCallback((cryptoType: CryptoType) => {
    setSelectedCrypto(cryptoType);
  }, [setSelectedCrypto]);
  
  return (
    <Sidebar collapsible="none" className="w-16 sm:w-20 border-r" {...props}>
      <SidebarHeader className="items-center py-4">
        <Link className="inline-flex" href="/" aria-label="Go to homepage">
          <svg
            className="text-foreground"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M4 13.5V4a1 1 0 0 1 1-1h6.5zM12 2h6.5A1.5 1.5 0 0 1 20 3.5V12zm-1.5 9.5H4A1.5 1.5 0 0 0 2.5 13v6.5zm2 0V20a1 1 0 0 0 1 1H20z"
            />
          </svg>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="items-center px-2">
          <SidebarMenu className="gap-2">
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.cryptoType}>
                <span
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  <SidebarMenuButton
                    className="relative size-9 sm:size-11 p-0 items-center justify-center rounded-full bg-linear-to-b from-background/64 to-background dark:bg-none dark:bg-card/64 dark:hover:bg-card/80 shadow-[0_1px_1px_rgba(0,0,0,0.05),_0_2px_2px_rgba(0,0,0,0.05),_0_4px_4px_rgba(0,0,0,0.05),_0_6px_6px_rgba(0,0,0,0.05)] dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)] cursor-pointer"
                    tooltip={{
                      children: item.title,
                      hidden: false,
                    }}
                    isActive={selectedCrypto === item.cryptoType}
                    onClick={() => handleCryptoSelect(item.cryptoType)}
                  >
                    <img
                      className="rounded-full"
                      src={item.icon}
                      alt={item.title}
                      width={28}
                      height={28}
                    />
                    <span className="sr-only">{item.title}</span>
                  </SidebarMenuButton>
                </span>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export const AppSidebar = memo(AppSidebarComponent);