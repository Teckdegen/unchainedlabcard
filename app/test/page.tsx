export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Tailwind CSS Test</h1>
        <p className="text-gray-700 mb-4">If you see this styled correctly, Tailwind is working.</p>
        <div className="flex space-x-4">
          <div className="w-16 h-16 bg-red-500 rounded"></div>
          <div className="w-16 h-16 bg-green-500 rounded"></div>
          <div className="w-16 h-16 bg-blue-500 rounded"></div>
        </div>
        <button className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
          Test Button
        </button>
      </div>
    </div>
  );
}