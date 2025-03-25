import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CompanyFilters } from "@/types";
import { Filter, X } from "lucide-react";

interface CompanyFilterProps {
  onApplyFilters: (filters: CompanyFilters) => void;
}

export function CompanyFilter({ onApplyFilters }: CompanyFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<CompanyFilters>({});
  
  const handleReset = () => {
    setFilters({});
  };
  
  const handleApply = () => {
    onApplyFilters(filters);
    setIsOpen(false);
  };
  
  const toggleFilters = () => {
    setIsOpen(!isOpen);
  };
  
  const updateFilter = (key: keyof CompanyFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Count active filters
  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  
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
              <CardTitle className="text-lg">Filter Companies</CardTitle>
              <Button variant="ghost" size="sm" onClick={toggleFilters}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-3 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <Select 
                value={filters.industry || ""} 
                onValueChange={(value) => updateFilter("industry", value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Industries</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Software Development">Software Development</SelectItem>
                  <SelectItem value="Data Analytics">Data Analytics</SelectItem>
                  <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Min Size</label>
              <Select 
                value={filters.minSize || ""} 
                onValueChange={(value) => updateFilter("minSize", value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select min size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Size</SelectItem>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Size</label>
              <Select 
                value={filters.maxSize || ""} 
                onValueChange={(value) => updateFilter("maxSize", value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select max size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Size</SelectItem>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                  <SelectItem value="1001+">1001+ employees</SelectItem>
                </SelectContent>
              </Select>
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
