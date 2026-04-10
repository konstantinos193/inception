export default function Docs() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Documentation</h1>
      <div className="prose max-w-none">
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <p className="mb-4">
          Welcome to the Elevate documentation. Here you'll find everything you need to know about using our platform.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4">How to Connect Your Wallet</h2>
        <ol className="list-decimal list-inside mb-4">
          <li>Click the "Connect Wallet" button</li>
          <li>Choose your preferred wallet provider</li>
          <li>Approve the connection request</li>
          <li>You're ready to start minting!</li>
        </ol>
        
        <h2 className="text-2xl font-semibold mb-4">Minting NFTs</h2>
        <p className="mb-4">
          Once your wallet is connected, you can mint NFTs from available collections. 
          Each collection may have different requirements and pricing.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4">Support</h2>
        <p className="mb-4">
          If you need help, please contact our support team or join our Discord community.
        </p>
      </div>
    </div>
  )
}
