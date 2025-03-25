import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { scoreLeadWithAI, generateCompanyInsights, generateMarketingSuggestions, generateAiInsights } from "./openai";
import { z } from "zod";
import { 
  insertLeadSchema, insertCompanySchema, 
  insertTaskSchema, insertAiInsightSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Dashboard Stats
  app.get("/api/dashboard/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const leads = await storage.getLeads();
      const companies = await storage.getCompanies();
      const tasks = await storage.getTasks();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tasksDueToday = (await storage.getTasks()).filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      });
      
      // Get leads created in the last 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const newLeads = leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= oneWeekAgo;
      });
      
      // Get companies created in the last 7 days
      const newCompanies = companies.filter(company => {
        const companyDate = new Date(company.createdAt);
        return companyDate >= oneWeekAgo;
      });
      
      // Active projects (tasks with status = 'in-progress')
      const activeProjects = tasks.filter(task => task.status === 'in-progress').length;
      
      res.json({
        newLeads: newLeads.length,
        newCompanies: newCompanies.length,
        activeProjects,
        tasksDueToday: tasksDueToday.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  
  // Lead Routes
  app.get("/api/leads", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const leads = await storage.getLeads();
      
      // If company info is needed, fetch that too
      const leadsWithCompany = await Promise.all(
        leads.map(async (lead) => {
          if (lead.companyId) {
            const company = await storage.getCompany(lead.companyId);
            return { ...lead, company };
          }
          return lead;
        })
      );
      
      res.json(leadsWithCompany);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });
  
  app.get("/api/leads/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      // Fetch company if exists
      let company;
      if (lead.companyId) {
        company = await storage.getCompany(lead.companyId);
      }
      
      // Fetch tasks related to this lead
      const tasks = await storage.getTasksByLead(id);
      
      res.json({ ...lead, company, tasks });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });
  
  app.post("/api/leads", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      
      // If we have enough data, generate an AI score
      if (lead.firstName && lead.lastName && lead.companyId) {
        const company = await storage.getCompany(lead.companyId);
        if (company) {
          const aiScore = await scoreLeadWithAI({
            firstName: lead.firstName,
            lastName: lead.lastName,
            company: company.name,
            industry: company.industry || "Unknown",
            position: lead.position || "Unknown",
            market: lead.market || company.market || "Unknown"
          });
          
          await storage.updateLead(lead.id, { aiScore: aiScore.score });
          lead.aiScore = aiScore.score;
        }
      }
      
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create lead" });
    }
  });
  
  app.put("/api/leads/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Get existing lead
      const existingLead = await storage.getLead(id);
      if (!existingLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      // Validate partial updates
      const validatedData = insertLeadSchema.partial().parse(req.body);
      const updatedLead = await storage.updateLead(id, validatedData);
      
      if (!updatedLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(updatedLead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update lead" });
    }
  });
  
  app.delete("/api/leads/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deleteLead(id);
      if (!success) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });
  
  // Company Routes
  app.get("/api/companies", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });
  
  app.get("/api/companies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      // Get leads associated with this company
      const leads = await storage.getLeadsByCompany(id);
      
      // Get tasks associated with this company
      const tasks = await storage.getTasksByCompany(id);
      
      res.json({ ...company, leads, tasks });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });
  
  app.post("/api/companies", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create company" });
    }
  });
  
  app.put("/api/companies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Get existing company
      const existingCompany = await storage.getCompany(id);
      if (!existingCompany) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      // Validate partial updates
      const validatedData = insertCompanySchema.partial().parse(req.body);
      const updatedCompany = await storage.updateCompany(id, validatedData);
      
      if (!updatedCompany) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(updatedCompany);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update company" });
    }
  });
  
  app.delete("/api/companies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deleteCompany(id);
      if (!success) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete company" });
    }
  });
  
  // Task Routes
  app.get("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  
  app.get("/api/tasks/due-today", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const today = new Date();
      const tasks = await storage.getTasksByDueDate(today);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks due today" });
    }
  });
  
  app.post("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  
  app.put("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Validate partial updates
      const validatedData = insertTaskSchema.partial().parse(req.body);
      
      // If marking as completed, add completedAt date
      if (validatedData.status === 'completed' && !validatedData.completedAt) {
        validatedData.completedAt = new Date();
      }
      
      const updatedTask = await storage.updateTask(id, validatedData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });
  
  // AI Insights Routes
  app.get("/api/ai-insights", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const insights = await storage.getAiInsights();
      const filteredInsights = insights.filter(insight => !insight.isDismissed);
      res.json(filteredInsights);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI insights" });
    }
  });
  
  app.post("/api/ai-insights/generate", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      // Get data for AI insights
      const leads = await storage.getLeads();
      const companies = await storage.getCompanies();
      const tasks = await storage.getTasks();
      
      // Calculate stats for AI
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentLeads = leads.filter(lead => {
        const leadDate = new Date(lead.createdAt);
        return leadDate >= oneWeekAgo;
      }).length;
      
      const tasksDueToday = (await storage.getTasks()).filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      }).length;
      
      const activeProjects = tasks.filter(task => task.status === 'in-progress').length;
      
      // Calculate lead stats by market and status
      const leadsByMarket: Record<string, number> = {};
      const leadsByStatus: Record<string, number> = {};
      
      for (const lead of leads) {
        if (lead.market) {
          leadsByMarket[lead.market] = (leadsByMarket[lead.market] || 0) + 1;
        }
        
        if (lead.status) {
          leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1;
        }
      }
      
      // Generate AI insights
      const generatedInsights = await generateAiInsights({
        recentLeads,
        leadsByMarket,
        leadsByStatus,
        activeProjects,
        tasksDueToday
      });
      
      // Save insights to storage
      const savedInsights = [];
      for (const insight of generatedInsights.insights) {
        const newInsight = await storage.createAiInsight({
          type: insight.type,
          title: insight.title,
          description: insight.description,
          actionText: insight.actionText,
          actionUrl: '',
          leadId: null,
          companyId: null,
          isRead: false,
          isDismissed: false
        });
        
        savedInsights.push(newInsight);
      }
      
      res.json(savedInsights);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate AI insights" });
    }
  });
  
  app.put("/api/ai-insights/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      // Validate partial updates
      const validatedData = insertAiInsightSchema.partial().parse(req.body);
      const updatedInsight = await storage.updateAiInsight(id, validatedData);
      
      if (!updatedInsight) {
        return res.status(404).json({ message: "AI Insight not found" });
      }
      
      res.json(updatedInsight);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update AI insight" });
    }
  });
  
  // Company Research with AI
  app.post("/api/companies/:id/research", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      const insights = await generateCompanyInsights({
        name: company.name,
        industry: company.industry || "",
        market: company.market || "",
        engagementScore: company.engagementScore || 0
      });
      
      // Create an AI insight for this company
      const aiInsight = await storage.createAiInsight({
        type: "research",
        title: `Company Research: ${company.name}`,
        description: insights.insights,
        actionText: "View Recommendations",
        actionUrl: `/companies/${id}`,
        leadId: null,
        companyId: id,
        isRead: false,
        isDismissed: false
      });
      
      res.json({
        insights: insights.insights,
        recommendations: insights.recommendations,
        insightId: aiInsight.id
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to research company" });
    }
  });
  
  // Marketing Suggestions with AI
  app.get("/api/marketing/suggestions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    try {
      const leads = await storage.getLeads();
      const companies = await storage.getCompanies();
      
      // Prepare data for AI
      const leadsData = leads.map(lead => ({
        market: lead.market || "Unknown",
        industry: companies.find(c => c.id === lead.companyId)?.industry || "Unknown"
      }));
      
      const companiesData = companies.map(company => ({
        market: company.market || "Unknown",
        industry: company.industry || "Unknown"
      }));
      
      const suggestions = await generateMarketingSuggestions({
        leads: leadsData,
        companies: companiesData
      });
      
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate marketing suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
