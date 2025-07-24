import { CandlestickChart } from '@/components/candlestick-chart'
import { Card, CardContent } from '@/components/ui/card'
import CoinSelector from '@/components/coin-selector'
import PeriodSelector from "@/components/period-selector";
import React from 'react'

const page = () => {
  return (
    <div>
       <Card className="shadow-2xl rounded-3xl border-transparent dark:border-border/64">
              <CardContent>
                {/* Header */}
                <div className="flex flex-col @xl:flex-row @xl:items-center gap-3 mb-6">
                  {/* Left side */}
                  <div className="flex-1 flex gap-3">
                    {/* Coin symbols */}
                    <div className="mt-0.5 shrink-0">
                      <div className="inline-flex rounded-full border-2 border-card last:-ms-3.5 last:translate-y-3.5">
                        <img
                          src="https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp5/coin-01_tidmpi.svg"
                          width={28}
                          height={28}
                          alt="TRX"
                        />
                      </div>
                      <div className="inline-flex rounded-full border-2 border-card last:-ms-3.5 last:translate-y-3.5">
                        <img
                          src="https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp5/coin-02_a6ineb.svg"
                          width={28}
                          height={28}
                          alt="TOK"
                        />
                      </div>
                    </div>
                    {/* Exchange information */}
                    <div className="flex flex-col gap-0.5">
                      <div className="text-xl font-semibold">
                        TRX <span className="text-muted-foreground">:</span> TOK
                      </div>
                      <div className="text-[13px] text-muted-foreground/72 dark:text-muted-foreground/64 uppercase font-medium">
                        1 Year{" "}
                        <span className="text-muted-foreground/40">·</span> PRC{" "}
                        <span className="text-emerald-500">
                          1,970.84 (+4.37%)
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Right side */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CoinSelector defaultValue="TRX" />
                      <CoinSelector defaultValue="TOK" />
                    </div>
                    <PeriodSelector />
                  </div>
                </div>
                {/* The Chart */}
                <CandlestickChart />
              </CardContent>
            </Card>
    </div>
  )
}

export default page