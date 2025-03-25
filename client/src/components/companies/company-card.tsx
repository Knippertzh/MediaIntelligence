import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Company } from "@shared/schema";
import { formatDate, getMarketBadgeColor } from "@/lib/utils";
import { Building, Globe, MapPin, Users, Calendar, Edit, Trash2, Brain } from "lucide-react";

interface CompanyCardProps {
  company: Company;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onResearch: (id: number) => void;
}

export function CompanyCard({ company, onEdit, onDelete, onResearch }: CompanyCardProps) {
  // Map company size to a color
  const getSizeColor = (size: string | undefined) => {
    if (!size) return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    
    // Convert size to a numeric range for comparison
    if (size.includes("1-10") || size.includes("11-50")) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    } else if (size.includes("51-200") || size.includes("201-500")) {
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    } else {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };
  
  // Get icon background color
  const getIconColor = (industry: string | undefined) => {
    if (!industry) return "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400";
    
    const industryMap: Record<string, string> = {
      "Information Technology": "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
      "Software Development": "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
      "Data Analytics": "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
      "Manufacturing": "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
      "Healthcare": "bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400",
      "Finance": "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400"
    };
    
    return industryMap[industry] || "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400";
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative h-1">
        <div 
          className={`absolute top-0 left-0 h-full ${
            company.engagementScore && company.engagementScore >= 70 ? "bg-green-500" :
            company.engagementScore && company.engagementScore >= 40 ? "bg-yellow-500" :
            "bg-red-500"
          }`} 
          style={{ width: `${company.engagementScore || 0}%` }}
        ></div>
      </div>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center">
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getIconColor(company.industry)}`}>
              <Building className="h-6 w-6" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium">{company.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{company.industry || 'Unknown Industry'}</p>
            </div>
          </div>
          <div>
            {company.engagementScore !== undefined && (
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">Engagement</span>
                <div className="flex items-center mt-1">
                  <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={
                        company.engagementScore >= 70 ? "bg-green-500 dark:bg-green-400" :
                        company.engagementScore >= 40 ? "bg-yellow-500 dark:bg-yellow-400" :
                        "bg-red-500 dark:bg-red-400"
                      }
                      style={{ width: `${company.engagementScore}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {company.engagementScore >= 70 ? "High" :
                     company.engagementScore >= 40 ? "Medium" :
                     "Low"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3 text-sm">
          {company.website && (
            <div className="flex items-center">
              <Globe className="h-4 w-4 mr-2 text-gray-400" />
              <a 
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {company.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </div>
          )}
          
          {(company.city || company.country) && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span>
                {[company.city, company.country].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
          
          {company.size && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-gray-400" />
              <span>{company.size} employees</span>
            </div>
          )}
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>Added on {formatDate(company.createdAt)}</span>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {company.market && (
            <Badge variant="outline" className={getMarketBadgeColor(company.market)}>
              {company.market}
            </Badge>
          )}
          
          {company.size && (
            <Badge variant="outline" className={getSizeColor(company.size)}>
              {company.size} employees
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="text-gray-500" onClick={() => onEdit(company.id)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => onDelete(company.id)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
        <Button variant="outline" size="sm" className="text-primary" onClick={() => onResearch(company.id)}>
          <Brain className="h-4 w-4 mr-1" />
          AI Research
        </Button>
      </CardFooter>
    </Card>
  );
}
