import { 
  User, Lead, Company, Task, AiInsight,
  LeadWithCompany, CompanyWithLeads
} from "@shared/schema";

// Dashboard types
export interface DashboardStats {
  newLeads: number;
  newCompanies: number;
  activeProjects: number;
  tasksDueToday: number;
}

export interface StatCard {
  title: string;
  value: number;
  change?: {
    value: number | string;
    type: 'increase' | 'decrease' | 'neutral';
    text: string;
  };
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'red' | 'yellow';
}

// AI Insight card types
export interface AiInsightCard {
  id: number;
  type: string;
  title: string;
  description: string;
  actionText?: string;
  actionUrl?: string;
  icon: string;
  color: 'blue' | 'yellow' | 'green' | 'red' | 'purple';
}

// Lead Management types
export interface LeadFilters {
  status?: string;
  market?: string;
  minScore?: number;
  maxScore?: number;
  searchTerm?: string;
}

// Company Intelligence types
export interface CompanyFilters {
  industry?: string;
  market?: string;
  minSize?: string;
  maxSize?: string;
  searchTerm?: string;
}

// Marketing Suggestions types
export interface MarketingSuggestion {
  marketTrends: { market: string; trend: string }[];
  contentSuggestions: string[];
}

// AI Research types
export interface CompanyResearch {
  insights: string;
  recommendations: string[];
  insightId: number;
}
