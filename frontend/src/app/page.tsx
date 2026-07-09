export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome to WFX AI ERP
        </h2>
        <p className="mt-1 text-gray-600">
          AI-powered analytics for the apparel and fashion industry.
        </p>
      </div>

      {/* Dashboard content will be built in Phase 11 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl border border-gray-200 bg-white p-6 animate-pulse"
          >
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="mt-4 h-8 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
