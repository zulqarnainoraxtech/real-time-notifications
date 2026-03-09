export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Welcome to NotifyApp
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Real-time notification system
        </p>
        <a
          href="/admin"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          Go to Admin Panel
        </a>
      </div>
    </div>
  );
}
