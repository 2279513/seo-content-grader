export interface SEOScore {
  title: ScoreItem;
  metaDescription: ScoreItem;
  keywords: ScoreItem;
  readability: ScoreItem;
  structuredData: ScoreItem;
  overall: number;
}

export interface ScoreItem {
  score: number;
  status?: 'good' | 'warning' | 'error';
  current: string;
  suggestion: string;
}

export interface AnalysisRequest {
  url?: string;
  screenshotBase64?: string;
  email: string;
}

export interface AnalysisResult {
  id: string;
  url: string;
  scores: SEOScore;
  improvements: string[];
  createdAt: Date;
}

export interface CreditInfo {
  used: number;
  limit: number;
  remaining: number;
}
