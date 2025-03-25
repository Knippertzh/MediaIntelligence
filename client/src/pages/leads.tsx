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
import { LeadCard } from "@/components/leads/lead-card";
import { LeadFilter } from "@/components/leads/lead-filter";
import { LeadForm } from "@/components/leads/lead-form";
import { LeadWithCompany, Lead, InsertLead } from "@shared/schema";
import { Search, Plus, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { LeadFilters } from "@/types";

export default function LeadsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<LeadFilters>({});
  
  // Fetch leads
  const { data: leads = [], isLoading } = useQuery<LeadWithCompany[]>({
    queryKey: ["/api/leads"],
  });
  
  // Fetch companies for form select
  const { data: companies = [] } = useQuery({
    queryKey: ["/api/companies"],
  });
  
  // Create lead mutation
  const createLeadMutation = useMutation({
    mutationFn: async (data: InsertLead) => {
      const res = await apiRequest("POST", "/api/leads", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead created",
        description: "The lead has been created successfully.",
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create lead",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertLead> }) => {
      const res = await apiRequest("PUT", `/api/leads/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead updated",
        description: "The lead has been updated successfully.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update lead",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete lead mutation
  const deleteLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead deleted",
        description: "The lead has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete lead",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleEditLead = (id: number) => {
    setSelectedLeadId(id);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteLead = (id: number) => {
    setSelectedLeadId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleApplyFilters = (newFilters: LeadFilters) => {
    setFilters(newFilters);
  };
  
  // Filter and search leads
  const filteredLeads = leads.filter(lead => {
    // Search term filter
    if (searchTerm && !`${lead.firstName} ${lead.lastName} ${lead.email} ${lead.company?.name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (filters.status && lead.status !== filters.status) {
      return false;
    }
    
    // Market filter
    if (filters.market && lead.market !== filters.market) {
      return false;
    }
    
    // Score range filter
    if (filters.minScore !== undefined && (lead.aiScore || 0) < filters.minScore) {
      return false;
    }
    
    if (filters.maxScore !== undefined && (lead.aiScore || 0) > filters.maxScore) {
      return false;
    }
    
    return true;
  });
  
  // Get the selected lead for editing
  const selectedLead = selectedLeadId ? leads.find(lead => lead.id === selectedLeadId) : null;
  
  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Leads</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage and track your leads</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                type="text" 
                placeholder="Search leads..." 
                className="pl-10 w-full sm:w-64" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-6">
          <LeadFilter onApplyFilters={handleApplyFilters} />
        </div>
        
        {/* Lead Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <Users className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No leads found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchTerm || Object.keys(filters).length > 0 
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Get started by adding your first lead."}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.map(lead => (
              <LeadCard 
                key={lead.id} 
                lead={lead} 
                onEdit={handleEditLead} 
                onDelete={handleDeleteLead}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Create Lead Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Enter the details of the new lead. Required fields are marked with an asterisk (*).
            </DialogDescription>
          </DialogHeader>
          
          <LeadForm 
            onSubmit={(data) => createLeadMutation.mutate(data)}
            companies={companies}
            isSubmitting={createLeadMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Lead Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogDescription>
              Update the lead information.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead && (
            <LeadForm 
              initialData={selectedLead}
              onSubmit={(data) => updateLeadMutation.mutate({ id: selectedLead.id, data })}
              companies={companies}
              isSubmitting={updateLeadMutation.isPending}
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
              Are you sure you want to delete this lead? This action cannot be undone.
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
              onClick={() => selectedLeadId && deleteLeadMutation.mutate(selectedLeadId)}
              disabled={deleteLeadMutation.isPending}
            >
              {deleteLeadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Lead"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
