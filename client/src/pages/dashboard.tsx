import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { LeadInsights } from "@/components/dashboard/lead-insights";
import { AiInsights } from "@/components/dashboard/ai-insights";
import { CompanyIntelligence } from "@/components/dashboard/company-intelligence";
import { Users, Building, ClipboardList, CheckSquare } from "lucide-react";
import { DashboardStats } from "@/types";
import { Lead, LeadWithCompany, Company, AiInsight } from "@shared/schema";

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading: isStatsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch leads data
  const { data: leads = [], isLoading: isLeadsLoading } = useQuery<LeadWithCompany[]>({
    queryKey: ["/api/leads"],
  });

  // Fetch companies data
  const { data: companies = [], isLoading: isCompaniesLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  // Fetch AI insights
  const { data: insights = [], isLoading: isInsightsLoading } = useQuery<AiInsight[]>({
    queryKey: ["/api/ai-insights"],
  });

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Overview of your CRM activities and performance</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard 
            title="New Leads"
            value={stats?.newLeads || 0}
            change={{
              value: "+12%",
              type: "increase",
              text: "from last week"
            }}
            icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            iconBgColor="bg-blue-100 dark:bg-blue-900"
          />
          
          <StatsCard 
            title="Companies Added"
            value={stats?.newCompanies || 0}
            change={{
              value: "+5%",
              type: "increase",
              text: "from last week"
            }}
            icon={<Building className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
            iconBgColor="bg-purple-100 dark:bg-purple-900"
          />
          
          <StatsCard 
            title="Active Projects"
            value={stats?.activeProjects || 0}
            change={{
              value: "No change",
              type: "neutral",
              text: ""
            }}
            icon={<ClipboardList className="h-5 w-5 text-green-600 dark:text-green-400" />}
            iconBgColor="bg-green-100 dark:bg-green-900"
          />
          
          <StatsCard 
            title="Tasks Due Today"
            value={stats?.tasksDueToday || 0}
            change={{
              value: "-3",
              type: "decrease",
              text: "from yesterday"
            }}
            icon={<CheckSquare className="h-5 w-5 text-red-600 dark:text-red-400" />}
            iconBgColor="bg-red-100 dark:bg-red-900"
          />
        </div>
        
        {/* Main Content Area - 2 columns on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* AI Lead Insights */}
          <div className="lg:col-span-2">
            <LeadInsights leads={leads} isLoading={isLeadsLoading} />
          </div>
          
          {/* AI Insights */}
          <div>
            <AiInsights insights={insights} isLoading={isInsightsLoading} />
          </div>
        </div>
        
        {/* Company Intelligence Section */}
        <div>
          <CompanyIntelligence companies={companies} isLoading={isCompaniesLoading} />
        </div>
      </div>
    </Layout>
  );
}
