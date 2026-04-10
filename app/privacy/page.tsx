export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
        <p className="mb-4">
          We collect information to provide better services to all our users. This includes:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Wallet address (when you connect)</li>
          <li>Transaction history on our platform</li>
          <li>Browser and device information</li>
          <li>Usage data and analytics</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
        <p className="mb-4">
          We use the information we collect to:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Provide and maintain our services</li>
          <li>Process transactions</li>
          <li>Send you technical notices and support messages</li>
          <li>Improve our services</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
        <p className="mb-4">
          We implement appropriate security measures to protect your personal information 
          against unauthorized access, alteration, disclosure, or destruction.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us.
        </p>
      </div>
    </div>
  )
}
