import { X, ExternalLink, Calendar, Clock, History, TrendingUp, Sparkles, FileText, Link, Download } from 'lucide-react';
import { Scrape, AnalysisPoint } from '../types/scrape';
import { exportToTXT, exportToJSON, exportToDOC, exportToPDF } from '../utils/exportUtils';

interface ScrapeDetailsProps {
  scrape: Scrape;
  onClose: () => void;
}

export function ScrapeDetails({ scrape, onClose }: ScrapeDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const parseAnalysis = (analysisString: string | null): AnalysisPoint[] => {
    if (!analysisString) return [];
    try {
      const parsed = JSON.parse(analysisString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  const originPoints = parseAnalysis(scrape.origin_analysis);
  const trendsPoints = parseAnalysis(scrape.trends_analysis);

  const handleExport = (format: 'txt' | 'doc' | 'pdf' | 'json') => {
    switch (format) {
      case 'txt':
        exportToTXT(scrape, originPoints, trendsPoints);
        break;
      case 'doc':
        exportToDOC(scrape, originPoints, trendsPoints);
        break;
      case 'pdf':
        exportToPDF(scrape, originPoints, trendsPoints);
        break;
      case 'json':
        exportToJSON(scrape, originPoints, trendsPoints);
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                {scrape.title || 'Untitled'}
              </h2>
              {scrape.keyword && (
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex-shrink-0">
                  {scrape.keyword}
                </span>
              )}
            </div>
            <a
              href={scrape.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="truncate">{scrape.url}</span>
            </a>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {scrape.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-red-900 mb-2">Error</h3>
              <p className="text-sm text-red-700">{scrape.error}</p>
            </div>
          )}

          {scrape.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <Sparkles className="w-12 h-12 text-yellow-600 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-medium text-yellow-900 mb-2">Analysis in Progress</h3>
              <p className="text-sm text-yellow-700">AI is researching and generating insights...</p>
            </div>
          )}

          {scrape.status === 'completed' && (
            <div className="space-y-6">
              {scrape.url_summary && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Source Summary</h3>
                      <p className="text-sm text-gray-600">What the input URL is conveying</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-5">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {scrape.url_summary}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-600 rounded-lg">
                    <History className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Verified Origin / Moment of Truth</h3>
                    <p className="text-sm text-gray-600">Historical analysis and earliest mentions</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {originPoints.length > 0 ? (
                    originPoints.map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-5 border border-amber-100">
                        <p className="text-gray-800 leading-relaxed mb-3">{item.point}</p>
                        {item.references && item.references.length > 0 && (
                          <div className="border-t border-gray-200 pt-3 mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Link className="w-4 h-4 text-amber-600" />
                              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                Reference Sources
                              </span>
                            </div>
                            <div className="space-y-2">
                              {item.references.map((ref, refIndex) => (
                                <a
                                  key={refIndex}
                                  href={ref.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  <span className="break-words">{ref.title || ref.url}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-lg p-5 text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {scrape.origin_analysis || 'No origin analysis available'}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Latest Updates & Future Forecast</h3>
                    <p className="text-sm text-gray-600">Current trends and future predictions</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {trendsPoints.length > 0 ? (
                    trendsPoints.map((item, index) => (
                      <div key={index} className="bg-white rounded-lg p-5 border border-blue-100">
                        <p className="text-gray-800 leading-relaxed mb-3">{item.point}</p>
                        {item.references && item.references.length > 0 && (
                          <div className="border-t border-gray-200 pt-3 mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Link className="w-4 h-4 text-blue-600" />
                              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                Reference Sources
                              </span>
                            </div>
                            <div className="space-y-2">
                              {item.references.map((ref, refIndex) => (
                                <a
                                  key={refIndex}
                                  href={ref.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  <span className="break-words">{ref.title || ref.url}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-lg p-5 text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {scrape.trends_analysis || 'No trends analysis available'}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-medium">Created</span>
                    </div>
                    <p className="text-sm text-gray-900">{formatDate(scrape.created_at)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">Completed</span>
                    </div>
                    <p className="text-sm text-gray-900">
                      {scrape.completed_at ? formatDate(scrape.completed_at) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {scrape.status === 'completed' && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Download className="w-5 h-5 text-gray-700" />
                <span className="text-sm font-semibold text-gray-700">Export Analysis</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => handleExport('txt')}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">.TXT</span>
                </button>
                <button
                  onClick={() => handleExport('doc')}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-blue-300 text-blue-700 font-medium py-2.5 px-4 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">.DOC</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-red-300 text-red-700 font-medium py-2.5 px-4 rounded-lg hover:bg-red-50 hover:border-red-400 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">.PDF</span>
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-green-300 text-green-700 font-medium py-2.5 px-4 rounded-lg hover:bg-green-50 hover:border-green-400 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">.JSON</span>
                </button>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium py-3 px-6 rounded-lg hover:from-gray-900 hover:to-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
