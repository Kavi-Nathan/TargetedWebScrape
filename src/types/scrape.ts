export interface AnalysisPoint {
  point: string;
  searchQuery?: string;
  references: Array<{
    url: string;
    title: string;
  }>;
}

export interface Scrape {
  id: string;
  url: string;
  keyword: string | null;
  status: 'pending' | 'completed' | 'failed';
  content: string | null;
  scraped_content: string | null;
  title: string | null;
  url_summary: string | null;
  origin_analysis: string | null;
  trends_analysis: string | null;
  reference_links: any;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}
