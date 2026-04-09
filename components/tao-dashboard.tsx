"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, TrendingUp, Wallet, AlertCircle, CheckCircle, Copy } from "lucide-react"
import { TaoLogo } from "./tao-logo"
import { taoWallet, type WalletInfo, type TransactionResult } from "@/lib/tao-wallet-mock"

export function TaoDashboard({ wallet }: { wallet: WalletInfo }) {
  const [balance, setBalance] = useState<string>(wallet.balance)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [transferAmount, setTransferAmount] = useState("")
  const [transferTo, setTransferTo] = useState("")
  const [stakeAmount, setStakeAmount] = useState("")
  const [stakeHotkey, setStakeHotkey] = useState("")
  const [isTransferring, setIsTransferring] = useState(false)
  const [isStaking, setIsStaking] = useState(false)
  const [transaction, setTransaction] = useState<TransactionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refreshBalance = async () => {
    setIsRefreshing(true)
    try {
      const newBalance = await taoWallet.getBalance(wallet.address)
      setBalance(newBalance)
    } catch (err) {
      setError("Failed to refresh balance")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleTransfer = async () => {
    if (!transferAmount || !transferTo) {
      setError("Please fill in all transfer fields")
      return
    }

    setIsTransferring(true)
    setError(null)
    setTransaction(null)

    try {
      const result = await taoWallet.sendTransaction(transferTo, transferAmount)
      setTransaction(result)
      if (result.success) {
        setTransferAmount("")
        setTransferTo("")
        await refreshBalance()
      }
    } catch (err) {
      setError("Transfer failed")
    } finally {
      setIsTransferring(false)
    }
  }

  const handleStake = async () => {
    if (!stakeAmount || !stakeHotkey) {
      setError("Please fill in all staking fields")
      return
    }

    setIsStaking(true)
    setError(null)
    setTransaction(null)

    try {
      const result = await taoWallet.stakeToValidator(stakeHotkey, stakeAmount)
      setTransaction(result)
      if (result.success) {
        setStakeAmount("")
        setStakeHotkey("")
        await refreshBalance()
      }
    } catch (err) {
      setError("Staking failed")
    } finally {
      setIsStaking(false)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address)
  }

  const formatBalance = (balance: string) => {
    const taoBalance = parseFloat(balance) / 1_000_000_000
    return (
      <div className="flex items-center space-x-1">
        <span>{taoBalance.toFixed(4)}</span>
        <TaoLogo size={16} className="text-current" />
      </div>
    )
  }

  const formatRao = (balance: string) => {
    return `${parseInt(balance).toLocaleString()} Rao`
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Wallet Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <CardTitle>Wallet Overview</CardTitle>
            </div>
            <Badge variant="outline" className="text-green-500 border-green-500">
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Address</Label>
              <div className="flex items-center space-x-2">
                <div className="font-mono text-sm bg-gray-800 p-2 rounded flex-1 break-all">
                  {wallet.address}
                </div>
                <Button size="sm" variant="outline" onClick={copyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Name</Label>
              <div className="text-sm bg-gray-800 p-2 rounded">
                {wallet.name || "Unnamed Wallet"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-400">Balance</Label>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={refreshBalance}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Refresh"
                  )}
                </Button>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {formatBalance(balance)}
              </div>
              <div className="text-xs text-gray-400">
                {formatRao(balance)}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-400">Network</Label>
              <div className="text-sm bg-gray-800 p-2 rounded">
                Bittensor (Finney)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Actions</CardTitle>
          <CardDescription>
            <div className="flex items-center space-x-1">
              <span>Transfer</span>
              <TaoLogo size={14} className="text-current" />
              <span>tokens or stake to validators</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transfer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transfer">Transfer</TabsTrigger>
              <TabsTrigger value="stake">Stake</TabsTrigger>
            </TabsList>

            <TabsContent value="transfer" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transfer-to">Recipient Address</Label>
                  <Input
                    id="transfer-to"
                    placeholder="5..."
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transfer-amount" className="flex items-center space-x-1">
                    <span>Amount</span>
                    <TaoLogo size={14} className="text-current" />
                  </Label>
                  <Input
                    id="transfer-amount"
                    type="number"
                    step="0.000000001"
                    placeholder="0.1"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleTransfer} 
                disabled={isTransferring || !transferAmount || !transferTo}
                className="w-full"
              >
                {isTransferring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    <div className="flex items-center space-x-1">
                      <span>Send</span>
                      <TaoLogo size={16} className="text-current" />
                    </div>
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="stake" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stake-hotkey">Validator Hotkey</Label>
                  <Input
                    id="stake-hotkey"
                    placeholder="5..."
                    value={stakeHotkey}
                    onChange={(e) => setStakeHotkey(e.target.value)}
                    className="font-mono"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stake-amount" className="flex items-center space-x-1">
                    <span>Amount</span>
                    <TaoLogo size={14} className="text-current" />
                  </Label>
                  <Input
                    id="stake-amount"
                    type="number"
                    step="0.000000001"
                    placeholder="1.0"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={handleStake} 
                disabled={isStaking || !stakeAmount || !stakeHotkey}
                className="w-full"
              >
                {isStaking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Staking...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    <div className="flex items-center space-x-1">
                      <span>Stake</span>
                      <TaoLogo size={16} className="text-current" />
                    </div>
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Transaction Result */}
      {transaction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {transaction.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Transaction Result</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transaction.success ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    Success
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm text-gray-400">Transaction Hash</Label>
                  <div className="font-mono text-sm bg-gray-800 p-2 rounded break-all">
                    {transaction.hash}
                  </div>
                </div>
              </div>
            ) : (
              <Alert className="border-red-500 text-red-500">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{transaction.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert className="border-red-500 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
