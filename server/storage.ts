import { 
  users, type User, type InsertUser,
  leads, type Lead, type InsertLead,
  companies, type Company, type InsertCompany,
  tasks, type Task, type InsertTask,
  aiInsights, type AiInsight, type InsertAiInsight
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Lead methods
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  getLeadsByCompany(companyId: number): Promise<Lead[]>;
  getLeadsByStatus(status: string): Promise<Lead[]>;
  getLeadsByMarket(market: string): Promise<Lead[]>;
  
  // Company methods
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;
  getCompaniesByMarket(market: string): Promise<Company[]>;
  getCompaniesByIndustry(industry: string): Promise<Company[]>;
  
  // Task methods
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTasksByLead(leadId: number): Promise<Task[]>;
  getTasksByCompany(companyId: number): Promise<Task[]>;
  getTasksByAssignee(assignedTo: number): Promise<Task[]>;
  getTasksByDueDate(date: Date): Promise<Task[]>;
  
  // AI Insights methods
  getAiInsights(): Promise<AiInsight[]>;
  getAiInsight(id: number): Promise<AiInsight | undefined>;
  createAiInsight(insight: InsertAiInsight): Promise<AiInsight>;
  updateAiInsight(id: number, insight: Partial<InsertAiInsight>): Promise<AiInsight | undefined>;
  deleteAiInsight(id: number): Promise<boolean>;
  getAiInsightsByLead(leadId: number): Promise<AiInsight[]>;
  getAiInsightsByCompany(companyId: number): Promise<AiInsight[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private leads: Map<number, Lead>;
  private companies: Map<number, Company>;
  private tasks: Map<number, Task>;
  private aiInsights: Map<number, AiInsight>;
  sessionStore: session.SessionStore;
  
  currentUserId: number;
  currentLeadId: number;
  currentCompanyId: number;
  currentTaskId: number;
  currentAiInsightId: number;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.companies = new Map();
    this.tasks = new Map();
    this.aiInsights = new Map();
    
    this.currentUserId = 1;
    this.currentLeadId = 1;
    this.currentCompanyId = 1;
    this.currentTaskId = 1;
    this.currentAiInsightId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with sample data for development
    this.initSampleData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Lead methods
  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }
  
  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }
  
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const lead: Lead = { 
      ...insertLead, 
      id, 
      createdAt: new Date() 
    };
    this.leads.set(id, lead);
    return lead;
  }
  
  async updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;
    
    const updatedLead = { ...lead, ...leadData };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }
  
  async deleteLead(id: number): Promise<boolean> {
    return this.leads.delete(id);
  }
  
  async getLeadsByCompany(companyId: number): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(
      (lead) => lead.companyId === companyId
    );
  }
  
  async getLeadsByStatus(status: string): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(
      (lead) => lead.status === status
    );
  }
  
  async getLeadsByMarket(market: string): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(
      (lead) => lead.market === market
    );
  }
  
  // Company methods
  async getCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }
  
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }
  
  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = this.currentCompanyId++;
    const company: Company = { 
      ...insertCompany, 
      id, 
      createdAt: new Date() 
    };
    this.companies.set(id, company);
    return company;
  }
  
  async updateCompany(id: number, companyData: Partial<InsertCompany>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updatedCompany = { ...company, ...companyData };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }
  
  async deleteCompany(id: number): Promise<boolean> {
    return this.companies.delete(id);
  }
  
  async getCompaniesByMarket(market: string): Promise<Company[]> {
    return Array.from(this.companies.values()).filter(
      (company) => company.market === market
    );
  }
  
  async getCompaniesByIndustry(industry: string): Promise<Company[]> {
    return Array.from(this.companies.values()).filter(
      (company) => company.industry === industry
    );
  }
  
  // Task methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { 
      ...insertTask, 
      id, 
      createdAt: new Date() 
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  async getTasksByLead(leadId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.leadId === leadId
    );
  }
  
  async getTasksByCompany(companyId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.companyId === companyId
    );
  }
  
  async getTasksByAssignee(assignedTo: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.assignedTo === assignedTo
    );
  }
  
  async getTasksByDueDate(date: Date): Promise<Task[]> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return Array.from(this.tasks.values()).filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate.getTime() === targetDate.getTime();
    });
  }
  
  // AI Insights methods
  async getAiInsights(): Promise<AiInsight[]> {
    return Array.from(this.aiInsights.values());
  }
  
  async getAiInsight(id: number): Promise<AiInsight | undefined> {
    return this.aiInsights.get(id);
  }
  
  async createAiInsight(insertInsight: InsertAiInsight): Promise<AiInsight> {
    const id = this.currentAiInsightId++;
    const insight: AiInsight = { 
      ...insertInsight, 
      id, 
      createdAt: new Date() 
    };
    this.aiInsights.set(id, insight);
    return insight;
  }
  
  async updateAiInsight(id: number, insightData: Partial<InsertAiInsight>): Promise<AiInsight | undefined> {
    const insight = this.aiInsights.get(id);
    if (!insight) return undefined;
    
    const updatedInsight = { ...insight, ...insightData };
    this.aiInsights.set(id, updatedInsight);
    return updatedInsight;
  }
  
  async deleteAiInsight(id: number): Promise<boolean> {
    return this.aiInsights.delete(id);
  }
  
  async getAiInsightsByLead(leadId: number): Promise<AiInsight[]> {
    return Array.from(this.aiInsights.values()).filter(
      (insight) => insight.leadId === leadId
    );
  }
  
  async getAiInsightsByCompany(companyId: number): Promise<AiInsight[]> {
    return Array.from(this.aiInsights.values()).filter(
      (insight) => insight.companyId === companyId
    );
  }
  
  private initSampleData() {
    // We don't pre-populate with data - users will add their own
  }
}

export const storage = new MemStorage();
