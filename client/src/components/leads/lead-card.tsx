import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LeadWithCompany } from "@shared/schema";
import { getScoreColorClass, getScoreRating, getMarketBadgeColor, getStatusBadgeColor, formatDate } from "@/lib/utils";
import { Phone, Mail, Building, Calendar, Edit, Trash2 } from "lucide-react";

interface LeadCardProps {
  lead: LeadWithCompany;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export function LeadCard({ lead, onEdit, onDelete }: LeadCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-1">
        <div 
          className={`absolute top-0 left-0 h-full ${getScoreColorClass(lead.aiScore)}`} 
          style={{ width: `${lead.aiScore || 0}%` }}
        ></div>
      </div>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt={`${lead.firstName} ${lead.lastName}`} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {lead.firstName?.[0]}{lead.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <h3 className="text-lg font-medium">{lead.firstName} {lead.lastName}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{lead.position || 'Unknown Position'}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge className={getStatusBadgeColor(lead.status)}>
              {lead.status || 'New'}
            </Badge>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Score:</span>
              <span className="ml-1 font-medium">{lead.aiScore || 0}%</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            <span>{lead.email}</span>
          </div>
          
          {lead.phone && (
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              <span>{lead.phone}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-2 text-gray-400" />
            <span>{lead.company?.name || 'No Company'}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>Added on {formatDate(lead.createdAt)}</span>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline" className={getMarketBadgeColor(lead.market)}>
            {lead.market || 'Unknown Market'}
          </Badge>
          
          <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            {getScoreRating(lead.aiScore)}
          </Badge>
          
          {lead.source && (
            <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {lead.source}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
        <Button variant="ghost" size="sm" className="text-gray-500" onClick={() => onEdit(lead.id)}>
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => onDelete(lead.id)}>
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
