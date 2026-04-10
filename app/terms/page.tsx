export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose max-w-none">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using Elevate, you accept and agree to be bound by the terms 
          and provision of this agreement.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4">Use License</h2>
        <p className="mb-4">
          Permission is granted to temporarily use Elevate for the purpose of viewing 
          content and interacting with NFT collections. This is the grant of a license, 
          not a transfer of title.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4">NFT Purchases</h2>
        <p className="mb-4">
          When you purchase an NFT through our platform, you agree to:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Provide accurate wallet information</li>
          <li>Pay all applicable fees and gas costs</li>
          <li>Comply with blockchain network rules</li>
          <li>Not engage in fraudulent activities</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mb-4">Prohibited Uses</h2>
        <p className="mb-4">
          You may not use our service for any unlawful purposes or in any way that could 
          damage, disable, or impair the service.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
        <p className="mb-4">
          In no event shall Elevate or its suppliers be liable for any damages arising 
          out of the use or inability to use this service.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right to modify these terms at any time. Your continued use 
          of the service constitutes acceptance of any changes.
        </p>
      </div>
    </div>
  )
}
