import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { CompanyCard } from "@/components/companies/company-card";
import { CompanyFilter } from "@/components/companies/company-filter";
import { CompanyForm } from "@/components/companies/company-form";
import { Company, InsertCompany } from "@shared/schema";
import { Search, Plus, Loader2, Brain } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { CompanyFilters } from "@/types";

export default function CompaniesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResearchDialogOpen, setIsResearchDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<CompanyFilters>({});
  
  // Fetch companies
  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });
  
  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (data: InsertCompany) => {
      const res = await apiRequest("POST", "/api/companies", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Company created",
        description: "The company has been created successfully.",
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create company",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCompany> }) => {
      const res = await apiRequest("PUT", `/api/companies/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Company updated",
        description: "The company has been updated successfully.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update company",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Company deleted",
        description: "The company has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete company",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // AI Research mutation
  const researchMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/companies/${id}/research`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-insights"] });
      toast({
        title: "AI Research completed",
        description: "Check the dashboard for new insights about this company.",
      });
      setIsResearchDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Research failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleEditCompany = (id: number) => {
    setSelectedCompanyId(id);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteCompany = (id: number) => {
    setSelectedCompanyId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleResearchCompany = (id: number) => {
    setSelectedCompanyId(id);
    setIsResearchDialogOpen(true);
  };
  
  const handleApplyFilters = (newFilters: CompanyFilters) => {
    setFilters(newFilters);
  };
  
  // Filter and search companies
  const filteredCompanies = companies.filter(company => {
    // Search term filter
    if (searchTerm && !`${company.name} ${company.industry || ''} ${company.city || ''} ${company.country || ''}`.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Industry filter
    if (filters.industry && company.industry !== filters.industry) {
      return false;
    }
    
    // Market filter
    if (filters.market && company.market !== filters.market) {
      return false;
    }
    
    // Size filter
    if (filters.minSize && company.size) {
      // Convert size ranges to numeric values for comparison
      const sizeMap: Record<string, number> = {
        '1-10': 1,
        '11-50': 2,
        '51-200': 3,
        '201-500': 4,
        '501-1000': 5,
        '1001+': 6
      };
      
      const companySize = sizeMap[company.size] || 0;
      const minSize = sizeMap[filters.minSize] || 0;
      
      if (companySize < minSize) {
        return false;
      }
    }
    
    if (filters.maxSize && company.size) {
      const sizeMap: Record<string, number> = {
        '1-10': 1,
        '11-50': 2,
        '51-200': 3,
        '201-500': 4,
        '501-1000': 5,
        '1001+': 6
      };
      
      const companySize = sizeMap[company.size] || 0;
      const maxSize = sizeMap[filters.maxSize] || 6;
      
      if (companySize > maxSize) {
        return false;
      }
    }
    
    return true;
  });
  
  // Get the selected company for editing
  const selectedCompany = selectedCompanyId ? companies.find(company => company.id === selectedCompanyId) : null;
  
  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Companies</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your company database</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Search companies..." 
                className="pl-10 w-full sm:w-64" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-6">
          <CompanyFilter onApplyFilters={handleApplyFilters} />
        </div>
        
        {/* Company Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <Building className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No companies found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchTerm || Object.keys(filters).length > 0 
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Get started by adding your first company."}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map(company => (
              <CompanyCard 
                key={company.id} 
                company={company} 
                onEdit={handleEditCompany} 
                onDelete={handleDeleteCompany}
                onResearch={handleResearchCompany}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Create Company Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>
              Enter the details of the new company. Required fields are marked with an asterisk (*).
            </DialogDescription>
          </DialogHeader>
          
          <CompanyForm 
            onSubmit={(data) => createCompanyMutation.mutate(data)}
            isSubmitting={createCompanyMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Company Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update the company information.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCompany && (
            <CompanyForm 
              initialData={selectedCompany}
              onSubmit={(data) => updateCompanyMutation.mutate({ id: selectedCompany.id, data })}
              isSubmitting={updateCompanyMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this company? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCompanyId && deleteCompanyMutation.mutate(selectedCompanyId)}
              disabled={deleteCompanyMutation.isPending}
            >
              {deleteCompanyMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Company"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* AI Research Dialog */}
      <Dialog open={isResearchDialogOpen} onOpenChange={setIsResearchDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>AI Company Research</DialogTitle>
            <DialogDescription>
              Our AI will analyze this company and generate insights and recommendations.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <div className="mx-auto bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Run AI Company Research</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
                Our AI will gather intelligence about this company and provide valuable insights to help your sales process.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsResearchDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => selectedCompanyId && researchMutation.mutate(selectedCompanyId)}
              disabled={researchMutation.isPending}
            >
              {researchMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Start Research"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
