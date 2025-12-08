import { useEffect, useState } from 'react';
import { ScrapeForm } from './components/ScrapeForm';
import { ScrapeList } from './components/ScrapeList';
import { ScrapeDetails } from './components/ScrapeDetails';
import { supabase } from './lib/supabase';
import { Scrape } from './types/scrape';
import { RefreshCw } from 'lucide-react';

function App() {
  const [scrapes, setScrapes] = useState<Scrape[]>([]);
  const [selectedScrape, setSelectedScrape] = useState<Scrape | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchScrapes = async () => {
    setIsRefreshing(true);
    const { data, error } = await supabase
      .from('scrapes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setScrapes(data);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchScrapes();

    const subscription = supabase
      .channel('scrapes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scrapes',
        },
        () => {
          fetchScrapes();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            AI Research & Analysis Platform
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover historical origins and future trends with AI-powered insights
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div>
            <ScrapeForm onScrapeComplete={fetchScrapes} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Quick Stats</h2>
                <p className="text-sm text-gray-500 mt-1">Overview of your research activity</p>
              </div>
              <button
                onClick={fetchScrapes}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {scrapes.length}
                </div>
                <div className="text-sm text-gray-600">Total Analyses</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {scrapes.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-100">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {scrapes.filter(s => s.status === 'failed').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </div>
        </div>

        <ScrapeList
          scrapes={scrapes}
          onSelectScrape={setSelectedScrape}
          selectedScrapeId={selectedScrape?.id || null}
        />
      </div>

      {selectedScrape && (
        <ScrapeDetails
          scrape={selectedScrape}
          onClose={() => setSelectedScrape(null)}
        />
      )}
    </div>
  );
}

export default App;
