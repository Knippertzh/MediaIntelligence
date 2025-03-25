import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  getScoreColorClass, 
  getScoreRating, 
  getMarketBadgeColor, 
  getStatusBadgeColor 
} from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type Lead, type LeadWithCompany } from "@shared/schema";

interface LeadInsightsProps {
  leads: LeadWithCompany[];
  isLoading: boolean;
}

export function LeadInsights({ leads, isLoading }: LeadInsightsProps) {
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const totalLeads = leads.length;
  const totalPages = Math.ceil(totalLeads / pageSize);
  
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, totalLeads);
  const displayedLeads = leads.slice(startIdx, endIdx);
  
  return (
    <Card>
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle>AI Lead Insights</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lead Name</TableHead>
              <TableHead className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</TableHead>
              <TableHead className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">AI Score</TableHead>
              <TableHead className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Market</TableHead>
              <TableHead className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</TableHead>
              <TableHead className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </TableCell>
              </TableRow>
            ) : displayedLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No leads available
                </TableCell>
              </TableRow>
            ) : (
              displayedLeads.map((lead) => (
                <TableRow key={lead.id} className="divide-y divide-gray-200 dark:divide-gray-700">
                  <TableCell className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={""} alt={`${lead.firstName} ${lead.lastName}`} />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                          {lead.firstName?.[0]}{lead.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {lead.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {lead.company?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {lead.company?.industry || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getScoreColorClass(lead.aiScore)}`} 
                          style={{ width: `${lead.aiScore || 0}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                        {lead.aiScore || 0}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMarketBadgeColor(lead.market)}`}>
                      {lead.market || 'Unknown'}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(lead.status)}`}>
                      {getScoreRating(lead.aiScore)}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="link" className="text-primary dark:text-primary-foreground">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      
      <CardFooter className="border-t border-gray-200 dark:border-gray-700 flex items-center justify-between p-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium">{startIdx + 1}</span> to <span className="font-medium">{endIdx}</span> of <span className="font-medium">{totalLeads}</span> leads
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
