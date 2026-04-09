// Fix for the minting flow - ensures fresh on-chain data before minting

export const createImprovedMintHandler = (
  loadOnChainStatus: () => Promise<void>,
  handleOnChainMint: () => Promise<void>,
  setMintError: (error: string | null) => void,
  activeOnChainPhase: any,
  mintQuantity: number,
  remainingForWallet: number
) => {
  return async () => {
    // 1. Refresh on-chain status immediately before minting
    try {
      console.log("Refreshing on-chain status before mint...")
      await loadOnChainStatus()
      // Add a small delay to ensure the data is processed
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error("Failed to refresh on-chain status before mint:", error)
    }

    // 2. Additional validation to prevent gas limit errors
    if (!activeOnChainPhase) {
      setMintError("No active phase found")
      return
    }

    // Check if phase is actually still active after refresh
    const now = Math.floor(Date.now() / 1000)
    const phaseStartTime = Number(activeOnChainPhase.startTime)
    const phaseEndTime = Number(activeOnChainPhase.endTime)
    
    let isActive = true
    if (phaseStartTime > 0 && now < phaseStartTime) {
      isActive = false
      setMintError("Phase has not started yet")
      return
    }
    
    if (phaseEndTime > 0 && now > phaseEndTime) {
      isActive = false
      setMintError("Phase has ended")
      return
    }

    // Check wallet limit again after refresh
    if (mintQuantity > remainingForWallet) {
      setMintError(`You can only mint ${remainingForWallet} more in this phase`)
      return
    }

    // Check if phase is paused
    if (activeOnChainPhase.paused) {
      setMintError("This phase is currently paused")
      return
    }

    // 3. Proceed with original mint function
    console.log("All checks passed, proceeding with mint...")
    await handleOnChainMint()
  }
}

export const createGasLimitValidator = (
  mintQuantity: number,
  activeOnChainPhase: any,
  maxGasLimit: number = 16777216
) => {
  // Estimate if the transaction might exceed gas limit
  // This is a rough estimate - actual gas depends on contract complexity
  const baseGas = 21000 // Base transaction gas
  const mintGasPerToken = 50000 // Estimated gas per token minted
  const estimatedGas = baseGas + (mintGasPerToken * mintQuantity)
  
  return {
    withinLimit: estimatedGas < maxGasLimit,
    estimatedGas,
    maxGasLimit,
    recommendation: estimatedGas >= maxGasLimit 
      ? `Try minting ${Math.floor((maxGasLimit - baseGas) / mintGasPerToken)} or fewer tokens at once`
      : null
  }
}
