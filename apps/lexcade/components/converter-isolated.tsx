"use client";

import { memo } from "react";
import { BuyWidget } from "@/components/buy-widget";
import { SellWidget } from "@/components/sell-widget";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ConverterContent = memo(() => {
  return (
    <Tabs defaultValue="buy" className="flex-1 gap-5">
      <TabsList className="flex w-full bg-background dark:bg-card/64 p-0 shadow-md *:not-first:ms-px dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]">
        <TabsTrigger
          value="buy"
          className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent relative before:absolute before:inset-y-2 before:-left-px before:w-px before:bg-border dark:before:bg-card first:before:hidden"
        >
          Buy
        </TabsTrigger>
        <TabsTrigger
          value="sell"
          className="flex-1 data-[state=active]:shadow-none data-[state=active]:bg-transparent relative before:absolute before:inset-y-2 before:-left-px before:w-px before:bg-border dark:before:bg-card first:before:hidden"
        >
          Sell
        </TabsTrigger>
      </TabsList>
      <div className="dark bg-background dark:bg-secondary/64 rounded-2xl p-2">
        <TabsContent value="buy">
          <BuyWidget />
        </TabsContent>
        <TabsContent value="sell">
          <SellWidget />
        </TabsContent>
      </div>
    </Tabs>
  );
});

ConverterContent.displayName = 'ConverterContent';

export const Converter = memo(ConverterContent);