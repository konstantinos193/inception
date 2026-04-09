// Patch to apply to project-detail.tsx mint handler
// Replace the existing handleOnChainMint function with this improved version

// Add this function after the refreshOnChainStatusBeforeMint function:

// Improved mint handler with fresh data validation
const handleOnChainMintWithValidation = async () => {
  if (!contractAddress || selectedPhaseIndex === null || !activeOnChainPhase || !publicClient) return

  setMintError(null)
  setMintSuccess(null)
  setCurrentTxHash(null)
  resetWrite()

  try {
    // 1. Refresh on-chain status immediately before minting
    console.log("Refreshing on-chain status before mint...")
    await refreshOnChainStatusBeforeMint()
    
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

    // 3. Gas limit estimation
    const baseGas = 21000
    const mintGasPerToken = 50000
    const estimatedGas = baseGas + (mintGasPerToken * mintQuantity)
    const maxGasLimit = 16777216
    
    if (estimatedGas >= maxGasLimit) {
      const maxTokens = Math.floor((maxGasLimit - baseGas) / mintGasPerToken)
      setMintError(`Gas limit too high. Try minting ${maxTokens} or fewer tokens at once`)
      return
    }

    // 4. Proceed with mint
    console.log("All checks passed, proceeding with mint...")
    const hash = await writeContractAsync({
      address: contractAddress,
      abi: TAO_NFT_ABI,
      functionName: "mint",
      args: [
        BigInt(selectedPhaseIndex),
        BigInt(mintQuantity),
        mintSignature as `0x${string}`,
        BigInt(wlMaxAllowance),
      ],
      value: activeOnChainPhase.price * BigInt(mintQuantity),
    })

    // Show hash immediately
    console.log("Transaction submitted:", hash)
    setCurrentTxHash(hash)

    // Now wait properly with viem
    setIsConfirming(true)

    const receipt = await waitForTransactionReceipt(publicClient, {
      hash,
      confirmations: 1,
      pollingInterval: 2000,
      timeout: 60000,
      retryCount: 5,
      retryDelay: 1500,
    })

    if (receipt.status === 'success') {
      // Success path
      resetWrite()
      setMintSuccess({ 
        txHash: hash, 
        quantity: mintQuantity,
        phaseName: activeOnChainPhase.name,
        priceEach: Number(fmt(activeOnChainPhase.price)),
        totalCost: Number(fmt(activeOnChainPhase.price * BigInt(mintQuantity)))
      })

      loadOnChainStatus()
      loadProject()
      recordOnChainMint({
        slug,
        wallet: connectedWallet ?? "",
        txHash: hash,
        quantity: mintQuantity,
        phaseIndex: selectedPhaseIndex,
        phaseName: activeOnChainPhase.name,
        priceEach: Number(fmt(activeOnChainPhase.price)),
      })
      setMintQuantity(1)
      setCurrentTxHash(null)
    } else {
      setMintError("Transaction reverted")
      setCurrentTxHash(null)
    }
  } catch (error: any) {
    console.error("Mint error:", error)
    setMintError(error?.shortMessage || error?.message || "Mint failed")
  } finally {
    setIsConfirming(false)
  }
}

// Then replace the existing handleOnChainMint call in the Button onClick:
// Change: onClick={handleOnChainMint}
// To: onClick={handleOnChainMintWithValidation}
