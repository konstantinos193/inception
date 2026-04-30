import { ExternalLink, BarChart3, TrendingUp, Zap } from "lucide-react"

interface ContractInfoProps {
  contractAddress: string
  explorerUrl: string | null
  owner?: string
  royaltyBps?: number | null
  phasesCount: number
  transfersLocked?: boolean
}

export default function ContractInfo({
  contractAddress,
  explorerUrl,
  owner,
  royaltyBps,
  phasesCount,
  transfersLocked,
}: ContractInfoProps) {
  const royaltyPct = royaltyBps !== undefined && royaltyBps !== null && !isNaN(royaltyBps)
    ? (royaltyBps / 100).toFixed(1) + "%"
    : "..."

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground/35">Contract</p>
        {explorerUrl && (
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] hover:opacity-70 transition-opacity" style={{ color: "var(--electric-blue)" }}>
            Explorer <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
          <span className="text-[10px] text-foreground/40 uppercase tracking-[0.12em]">Address</span>
          {explorerUrl ? (
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-foreground hover:opacity-70 flex items-center gap-1">
              {contractAddress.slice(0, 6)}…{contractAddress.slice(-4)}<ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : (
            <span className="font-mono text-xs text-foreground">{contractAddress.slice(0, 6)}…{contractAddress.slice(-4)}</span>
          )}
        </div>
        {owner && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
            <span className="text-[10px] text-foreground/40 uppercase tracking-[0.12em]">Creator</span>
            {explorerUrl ? (
              <a href={`${explorerUrl?.replace(contractAddress, owner)}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-foreground hover:opacity-70 flex items-center gap-1">
                {owner.slice(0, 6)}…{owner.slice(-4)}<ExternalLink className="w-2.5 h-2.5" />
              </a>
            ) : (
              <span className="font-mono text-xs text-foreground">{owner.slice(0, 6)}…{owner.slice(-4)}</span>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-background border border-border">
          <p className="text-[10px] text-foreground/40 uppercase tracking-[0.1em] mb-1">Royalty</p>
          <p className="text-xs font-bold text-foreground">{royaltyPct}</p>
        </div>
        <div className="p-3 rounded-xl bg-background border border-border">
          <p className="text-[10px] text-foreground/40 uppercase tracking-[0.1em] mb-1">Phases</p>
          <p className="text-xs font-bold text-foreground">{phasesCount}</p>
        </div>
        <div className="p-3 rounded-xl bg-background border border-border">
          <p className="text-[10px] text-foreground/40 uppercase tracking-[0.1em] mb-1">Transfers</p>
          <p className="text-xs font-bold text-green-400">{transfersLocked ? "Locked" : "Open"}</p>
        </div>
        <div className="p-3 rounded-xl bg-background border border-border">
          <p className="text-[10px] text-foreground/40 uppercase tracking-[0.1em] mb-1">Standard</p>
          <p className="text-xs font-bold text-foreground">ERC-721A</p>
        </div>
      </div>
      {explorerUrl && (
        <div className="flex flex-wrap gap-2">
          <a href={`${explorerUrl}?tab=contract`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-foreground/50 hover:text-foreground border border-border hover:border-foreground/30 px-3 py-1.5 rounded-lg transition-all">
            <BarChart3 className="w-3 h-3" />Code
          </a>
          <a href={`${explorerUrl}?tab=logs`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-foreground/50 hover:text-foreground border border-border hover:border-foreground/30 px-3 py-1.5 rounded-lg transition-all">
            <TrendingUp className="w-3 h-3" />Logs
          </a>
          <a href={`${explorerUrl}?tab=txs`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] text-foreground/50 hover:text-foreground border border-border hover:border-foreground/30 px-3 py-1.5 rounded-lg transition-all">
            <Zap className="w-3 h-3" />Txs
          </a>
        </div>
      )}
    </div>
  )
}
