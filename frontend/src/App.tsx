import { Routes, Route } from 'react-router-dom';
import { WeatherList } from './components/WeatherList';
import { WeatherDetail } from './components/WeatherDetail';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-gray-900">
            Weather Chain
          </h1>
          <p className="text-sm text-gray-500">
            BSV Blockchain Weather Data with Client-Side Proof Verification
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<WeatherList />} />
          <Route path="/weather/:id" element={<WeatherDetail />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            Weather data verified on BSV blockchain using{' '}
            <a
              href="https://github.com/bitcoin-sv/ts-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              @bsv/sdk
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
