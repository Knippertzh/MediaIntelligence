import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { LeadFilters } from "@/types";
import { Filter, X } from "lucide-react";

interface LeadFilterProps {
  onApplyFilters: (filters: LeadFilters) => void;
}

export function LeadFilter({ onApplyFilters }: LeadFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [scoreRange, setScoreRange] = useState<[number, number]>([0, 100]);
  
  const handleReset = () => {
    setFilters({});
    setScoreRange([0, 100]);
  };
  
  const handleApply = () => {
    const appliedFilters: LeadFilters = {
      ...filters,
      minScore: scoreRange[0] > 0 ? scoreRange[0] : undefined,
      maxScore: scoreRange[1] < 100 ? scoreRange[1] : undefined,
    };
    
    onApplyFilters(appliedFilters);
    setIsOpen(false);
  };
  
  const toggleFilters = () => {
    setIsOpen(!isOpen);
  };
  
  const updateFilter = (key: keyof LeadFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Count active filters
  const activeFilterCount = Object.values(filters).filter(Boolean).length + 
    (scoreRange[0] > 0 || scoreRange[1] < 100 ? 1 : 0);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={toggleFilters}
          className="flex items-center"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>
      
      {isOpen && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filter Leads</CardTitle>
              <Button variant="ghost" size="sm" onClick={toggleFilters}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-3 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={filters.status || ""} 
                onValueChange={(value) => updateFilter("status", value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Market</label>
              <Select 
                value={filters.market || ""} 
                onValueChange={(value) => updateFilter("market", value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select market" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Markets</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="Austria">Austria</SelectItem>
                  <SelectItem value="Switzerland">Switzerland</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="Global">Global</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 lg:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">AI Score Range</label>
                <span className="text-sm text-gray-500">
                  {scoreRange[0]} - {scoreRange[1]}%
                </span>
              </div>
              <Slider 
                min={0} 
                max={100} 
                step={5} 
                value={scoreRange} 
                onValueChange={(value) => setScoreRange(value as [number, number])} 
                className="py-4"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>Reset</Button>
            <Button onClick={handleApply}>Apply Filters</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
