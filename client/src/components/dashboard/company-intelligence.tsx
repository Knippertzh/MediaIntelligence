import { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Company } from "@shared/schema";
import { cn } from "@/lib/utils";
import { Search, Sliders, Building, Plus, Brain } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CompanyIntelligenceProps {
  companies: Company[];
  isLoading: boolean;
}

export function CompanyIntelligence({ companies, isLoading }: CompanyIntelligenceProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  
  const researchMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/companies/${id}/research`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-insights"] });
    }
  });
  
  const filteredCompanies = companies
    .filter(company => 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .slice(0, 3);
  
  // Define icon colors
  const iconColors = [
    "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
    "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400"
  ];
  
  return (
    <Card>
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle>Company Intelligence</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Search companies..." 
                className="pl-10 w-64" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="icon">
              <Sliders className="h-5 w-5 text-primary" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden animate-pulse">
                <div className="bg-gray-100 dark:bg-gray-800 h-20"></div>
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))
          ) : filteredCompanies.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
              <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No companies found</p>
              <p className="mt-1">Try a different search term or add a new company</p>
            </div>
          ) : (
            filteredCompanies.map((company, index) => (
              <div key={company.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-colors">
                <div className="bg-gray-50 dark:bg-gray-900 px-4 py-4 flex items-center">
                  <div className={cn("flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center", iconColors[index % iconColors.length])}>
                    <Building className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">{company.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {company.industry} · {company.city}, {company.country}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500 dark:text-gray-400">Industry</div>
                    <div className="font-medium">{company.industry || 'Unknown'}</div>
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500 dark:text-gray-400">Size</div>
                    <div className="font-medium">{company.size || 'Unknown'}</div>
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500 dark:text-gray-400">Engagement</div>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full",
                            company.engagementScore >= 70 ? "bg-green-500 dark:bg-green-400" :
                            company.engagementScore >= 40 ? "bg-yellow-500 dark:bg-yellow-400" :
                            "bg-red-500 dark:bg-red-400"
                          )}
                          style={{ width: `${company.engagementScore || 0}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 font-medium">
                        {company.engagementScore >= 70 ? "High" :
                         company.engagementScore >= 40 ? "Medium" :
                         "Low"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="default" className="w-full">
                    View Company Profile
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between flex-wrap gap-4">
        <Button variant="outline" className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add New Company
        </Button>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center"
            onClick={() => {
              if (companies.length > 0) {
                // Research the first company in the list
                researchMutation.mutate(companies[0].id);
              }
            }}
            disabled={researchMutation.isPending || companies.length === 0}
          >
            <Brain className="h-4 w-4 mr-2" />
            {researchMutation.isPending ? "Running..." : "Run AI Research"}
          </Button>
          <Button variant="default">
            View All Companies
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
