export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Rental Management Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Efficiently manage rental properties, tenant relationships, and financial transactions
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                For Landlords
              </h2>
              <ul className="text-gray-600 space-y-2">
                <li>• Manage multiple properties</li>
                <li>• Track rent payments</li>
                <li>• Handle maintenance requests</li>
                <li>• Generate financial reports</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                For Tenants
              </h2>
              <ul className="text-gray-600 space-y-2">
                <li>• View payment history</li>
                <li>• Submit maintenance requests</li>
                <li>• Access lease documents</li>
                <li>• Receive notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
