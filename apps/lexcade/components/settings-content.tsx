"use client";

import { memo, useState, useEffect } from "react";
import { usePreferences } from "@/hooks/use-preferences";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  RiExchangeLine, 
  RiLockPasswordLine, 
  RiNotification3Line,
  RiShieldCheckLine,
  RiKey2Line,
  RiDeviceLine,
  RiCheckLine,
} from "@remixicon/react";

const SettingsContentComponent = () => {
  const { preferences, loading, saving, updateTradingPreferences } = usePreferences();
  
  // Trading preferences state
  const [defaultOrderType, setDefaultOrderType] = useState('market');
  const [defaultAmount, setDefaultAmount] = useState('100');
  const [slippageTolerance, setSlippageTolerance] = useState('0.5');
  const [oneClickTrading, setOneClickTrading] = useState(false);
  const [showOrderBook, setShowOrderBook] = useState(true);
  const [advancedCharts, setAdvancedCharts] = useState(false);
  
  // Other settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [newsUpdates, setNewsUpdates] = useState(false);
  
  // Load preferences when component mounts
  useEffect(() => {
    if (preferences?.trading) {
      setDefaultOrderType(preferences.trading.defaultOrderType);
      setDefaultAmount(preferences.trading.defaultAmount.toString());
      setSlippageTolerance(preferences.trading.slippageTolerance.toString());
      setOneClickTrading(preferences.trading.oneClickTrading);
      setShowOrderBook(preferences.trading.showOrderBook);
      setAdvancedCharts(preferences.trading.advancedCharts);
    }
  }, [preferences]);

  const handleSavePreferences = async () => {
    const success = await updateTradingPreferences({
      defaultOrderType,
      defaultAmount: parseFloat(defaultAmount),
      slippageTolerance: parseFloat(slippageTolerance),
      oneClickTrading,
      showOrderBook,
      advancedCharts
    });
    
    if (success) {
      // Show success message or toast
      console.log('Preferences saved successfully');
    }
  };

  return (
    <div className="py-6">
      <Tabs defaultValue="trading" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[450px]">
          <TabsTrigger value="trading" className="flex items-center gap-2">
            <RiExchangeLine className="h-4 w-4" />
            <span className="hidden sm:inline">Trading</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <RiLockPasswordLine className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <RiNotification3Line className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Preferences</CardTitle>
              <CardDescription>
                Customize your trading experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="default-order">Default Order Type</Label>
                  <Select value={defaultOrderType} onValueChange={setDefaultOrderType}>
                    <SelectTrigger id="default-order">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market Order</SelectItem>
                      <SelectItem value="limit">Limit Order</SelectItem>
                      <SelectItem value="stop-loss">Stop Loss</SelectItem>
                      <SelectItem value="take-profit">Take Profit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="default-amount">Default Trade Amount (USDC)</Label>
                  <Input 
                    id="default-amount" 
                    type="number" 
                    value={defaultAmount}
                    onChange={(e) => setDefaultAmount(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slippage">Max Slippage Tolerance (%)</Label>
                  <Input 
                    id="slippage" 
                    type="number" 
                    value={slippageTolerance}
                    onChange={(e) => setSlippageTolerance(e.target.value)}
                    step="0.1" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>One-Click Trading</Label>
                    <p className="text-sm text-muted-foreground">Execute trades without confirmation</p>
                  </div>
                  <Switch 
                    checked={oneClickTrading}
                    onCheckedChange={setOneClickTrading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Order Book</Label>
                    <p className="text-sm text-muted-foreground">Display order book on trading page</p>
                  </div>
                  <Switch 
                    checked={showOrderBook}
                    onCheckedChange={setShowOrderBook}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Advanced Charts</Label>
                    <p className="text-sm text-muted-foreground">Enable technical indicators</p>
                  </div>
                  <Switch 
                    checked={advancedCharts}
                    onCheckedChange={setAdvancedCharts}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePreferences} disabled={loading || saving}>
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trading Limits</CardTitle>
              <CardDescription>
                Your current trading limits and fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Daily Limit</span>
                  <span className="text-sm font-medium">$1,000 USDC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Monthly Limit</span>
                  <span className="text-sm font-medium">$30,000 USDC</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Maker Fee</span>
                  <span className="text-sm font-medium">0.1%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Taker Fee</span>
                  <span className="text-sm font-medium">0.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Platform Fee</span>
                  <span className="text-sm font-medium">0.7%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Protect your account with additional security measures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch 
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Biometric Login</Label>
                    <p className="text-sm text-muted-foreground">Use fingerprint or face ID</p>
                  </div>
                  <Switch 
                    checked={biometricEnabled}
                    onCheckedChange={setBiometricEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <RiKey2Line className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full">
                  <RiDeviceLine className="h-4 w-4 mr-2" />
                  Manage Devices
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Devices currently logged into your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <RiDeviceLine className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">MacBook Air</p>
                      <p className="text-xs text-muted-foreground">Lahore, Pakistan • Current</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-0">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Choose which emails you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>All Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive all email updates</p>
                </div>
                <Switch 
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Order Confirmations</Label>
                  <p className="text-sm text-muted-foreground">Get notified when orders are executed</p>
                </div>
                <Switch 
                  checked={orderNotifications}
                  onCheckedChange={setOrderNotifications}
                  disabled={!emailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Price Alerts</Label>
                  <p className="text-sm text-muted-foreground">Notifications for price movements</p>
                </div>
                <Switch 
                  checked={priceAlerts}
                  onCheckedChange={setPriceAlerts}
                  disabled={!emailNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Product updates and promotions</p>
                </div>
                <Switch 
                  checked={marketingEmails}
                  onCheckedChange={setMarketingEmails}
                  disabled={!emailNotifications}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Real-time alerts on your devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get instant alerts on your device</p>
                </div>
                <Switch 
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Trading Alerts</Label>
                  <p className="text-sm text-muted-foreground">Order fills and market movements</p>
                </div>
                <Switch defaultChecked disabled={!pushNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>News Updates</Label>
                  <p className="text-sm text-muted-foreground">Breaking crypto news</p>
                </div>
                <Switch 
                  checked={newsUpdates}
                  onCheckedChange={setNewsUpdates}
                  disabled={!pushNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const SettingsContent = memo(SettingsContentComponent);