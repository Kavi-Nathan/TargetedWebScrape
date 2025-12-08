import { CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';
import { Scrape } from '../types/scrape';

interface ScrapeListProps {
  scrapes: Scrape[];
  onSelectScrape: (scrape: Scrape) => void;
  selectedScrapeId: string | null;
}

export function ScrapeList({ scrapes, onSelectScrape, selectedScrapeId }: ScrapeListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (scrapes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No research yet</h3>
        <p className="text-gray-500">Start by entering a URL and keyword above to generate your first analysis</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Research History</h3>
        <p className="text-sm text-gray-500 mt-1">{scrapes.length} total analyses</p>
      </div>

      <div className="divide-y divide-gray-200">
        {scrapes.map((scrape) => (
          <button
            key={scrape.id}
            onClick={() => onSelectScrape(scrape)}
            className={`w-full px-6 py-4 hover:bg-gray-50 transition-colors text-left ${
              selectedScrapeId === scrape.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-0.5">{getStatusIcon(scrape.status)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {scrape.title || 'Untitled'}
                  </h4>
                  {getStatusBadge(scrape.status)}
                </div>

                {scrape.keyword && (
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600 mb-1">
                    <span className="bg-blue-50 px-2 py-0.5 rounded-full">{scrape.keyword}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{scrape.url}</span>
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>{formatDate(scrape.created_at)}</span>
                  {scrape.error && (
                    <span className="text-red-600 truncate">Error: {scrape.error}</span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Globe({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}
