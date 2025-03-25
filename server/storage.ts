import { 
  users, type User, type InsertUser,
  leads, type Lead, type InsertLead,
  companies, type Company, type InsertCompany,
  tasks, type Task, type InsertTask,
  aiInsights, type AiInsight, type InsertAiInsight
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import postgres from "postgres";
import connectPg from "connect-pg-simple";
import { eq, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import pg from 'pg';

const MemoryStore = createMemoryStore(session);

// Konfiguration für PostgreSQL-Verbindung
const connectionString = process.env.DATABASE_URL;
const pgPool = postgres(connectionString!);
const pgStandardPool = new pg.Pool({ connectionString });
const PostgresSessionStore = connectPg(session);
const db = drizzle(postgres(connectionString!));

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
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private leads: Map<number, Lead>;
  private companies: Map<number, Company>;
  private tasks: Map<number, Task>;
  private aiInsights: Map<number, AiInsight>;
  sessionStore: session.Store;
  
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

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool: pgStandardPool,
      createTableIfMissing: true
    });
    
    // Initialisiere Datenbanktabellen
    this.initDatabase().catch(console.error);
  }

  private async initDatabase() {
    try {
      // Erstellen der Datenbanktabellen, wenn sie nicht existieren
      await pgPool.unsafe(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          email VARCHAR(255),
          role VARCHAR(50),
          profile_image_url VARCHAR(255)
        );
        
        CREATE TABLE IF NOT EXISTS companies (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          size VARCHAR(50),
          industry VARCHAR(100),
          website VARCHAR(255),
          market VARCHAR(100),
          city VARCHAR(100),
          country VARCHAR(100),
          address TEXT,
          engagement_score INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          notes TEXT,
          logo_url VARCHAR(255)
        );
        
        CREATE TABLE IF NOT EXISTS leads (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          position VARCHAR(255),
          status VARCHAR(50),
          market VARCHAR(100),
          company_id INTEGER REFERENCES companies(id),
          phone VARCHAR(50),
          source VARCHAR(100),
          engagement_score INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          notes TEXT,
          last_contacted_at TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          status VARCHAR(50),
          description TEXT,
          assigned_to INTEGER REFERENCES users(id),
          lead_id INTEGER REFERENCES leads(id),
          company_id INTEGER REFERENCES companies(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          due_date TIMESTAMP,
          completed_at TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS ai_insights (
          id SERIAL PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          lead_id INTEGER REFERENCES leads(id),
          company_id INTEGER REFERENCES companies(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          action_text VARCHAR(255),
          action_url VARCHAR(255),
          is_read BOOLEAN DEFAULT FALSE,
          is_dismissed BOOLEAN DEFAULT FALSE
        );
      `);
      
      console.log("Datenbanktabellen erfolgreich initialisiert");
      
      // Prüfen, ob bereits Daten vorhanden sind
      const existingUsers = await pgPool`SELECT * FROM users`;
      if (existingUsers.length === 0) {
        await this.seedSampleData();
      }
    } catch (error) {
      console.error("Fehler beim Initialisieren der Datenbanktabellen:", error);
      throw error;
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await pgPool`SELECT * FROM users WHERE id = ${id}`;
      if (result.length === 0) return undefined;
      
      return this.mapUserFromDb(result[0]);
    } catch (error) {
      console.error("Fehler beim Abrufen des Benutzers:", error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await pgPool`SELECT * FROM users WHERE username = ${username}`;
      if (result.length === 0) return undefined;
      
      return this.mapUserFromDb(result[0]);
    } catch (error) {
      console.error("Fehler beim Abrufen des Benutzers nach Benutzernamen:", error);
      throw error;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const { username, password, firstName, lastName, email, role, profileImageUrl } = userData;
      
      const result = await pgPool`
        INSERT INTO users (
          username, password, first_name, last_name, email, role, profile_image_url
        ) VALUES (
          ${username}, ${password}, ${firstName}, ${lastName}, ${email}, ${role}, ${profileImageUrl}
        )
        RETURNING *
      `;
      
      return this.mapUserFromDb(result[0]);
    } catch (error) {
      console.error("Fehler beim Erstellen des Benutzers:", error);
      throw error;
    }
  }
  
  // Lead methods
  async getLeads(): Promise<Lead[]> {
    try {
      const result = await pgPool`SELECT * FROM leads`;
      return result.map(this.mapLeadFromDb);
    } catch (error) {
      console.error("Fehler beim Abrufen der Leads:", error);
      throw error;
    }
  }
  
  async getLead(id: number): Promise<Lead | undefined> {
    try {
      const result = await pgPool`SELECT * FROM leads WHERE id = ${id}`;
      if (result.length === 0) return undefined;
      
      return this.mapLeadFromDb(result[0]);
    } catch (error) {
      console.error("Fehler beim Abrufen des Leads:", error);
      throw error;
    }
  }
  
  async createLead(leadData: InsertLead): Promise<Lead> {
    try {
      const {
        firstName, lastName, email, position, status, market,
        companyId, phone, source, engagementScore, notes, lastContactedAt
      } = leadData;
      
      const result = await pgPool`
        INSERT INTO leads (
          first_name, last_name, email, position, status, market,
          company_id, phone, source, engagement_score, notes, last_contacted_at
        ) VALUES (
          ${firstName}, ${lastName}, ${email}, ${position}, ${status}, ${market},
          ${companyId}, ${phone}, ${source}, ${engagementScore}, ${notes}, ${lastContactedAt}
        )
        RETURNING *
      `;
      
      return this.mapLeadFromDb(result[0]);
    } catch (error) {
      console.error("Fehler beim Erstellen des Leads:", error);
      throw error;
    }
  }
  
  async updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead | undefined> {
    try {
      // Wir müssen Feldzuordnungen explizit behandeln, um snake_case in der DB zu camelCase in JS zu konvertieren
      const updates: any = {};
      
      if (leadData.firstName !== undefined) updates.first_name = leadData.firstName;
      if (leadData.lastName !== undefined) updates.last_name = leadData.lastName;
      if (leadData.email !== undefined) updates.email = leadData.email;
      if (leadData.position !== undefined) updates.position = leadData.position;
      if (leadData.status !== undefined) updates.status = leadData.status;
      if (leadData.market !== undefined) updates.market = leadData.market;
      if (leadData.companyId !== undefined) updates.company_id = leadData.companyId;
      if (leadData.phone !== undefined) updates.phone = leadData.phone;
      if (leadData.source !== undefined) updates.source = leadData.source;
      if (leadData.engagementScore !== undefined) updates.engagement_score = leadData.engagementScore;
      if (leadData.notes !== undefined) updates.notes = leadData.notes;
      if (leadData.lastContactedAt !== undefined) updates.last_contacted_at = leadData.lastContactedAt;
      
      // Keine Felder zu aktualisieren
      if (Object.keys(updates).length === 0) {
        const currentLead = await this.getLead(id);
        return currentLead;
      }
      
      // Erstelle SET Klauseln für das SQL Update
      const setClauses = Object.entries(updates)
        .map(([key, value]) => `${key} = ${value === null ? 'NULL' : `'${value}'`}`)
        .join(', ');
      
      const query = `
        UPDATE leads 
        SET ${setClauses} 
        WHERE id = ${id} 
        RETURNING *
      `;
      
      const result = await pgPool.unsafe(query);
      
      if (result.length === 0) return undefined;
      return this.mapLeadFromDb(result[0]);
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Leads:", error);
      throw error;
    }
  }
  
  async deleteLead(id: number): Promise<boolean> {
    try {
      const result = await pgPool`DELETE FROM leads WHERE id = ${id} RETURNING id`;
      return result.length > 0;
    } catch (error) {
      console.error("Fehler beim Löschen des Leads:", error);
      throw error;
    }
  }
  
  async getLeadsByCompany(companyId: number): Promise<Lead[]> {
    try {
      const result = await pgPool`SELECT * FROM leads WHERE company_id = ${companyId}`;
      return result.map(this.mapLeadFromDb);
    } catch (error) {
      console.error("Fehler beim Abrufen der Leads nach Unternehmen:", error);
      throw error;
    }
  }
  
  async getLeadsByStatus(status: string): Promise<Lead[]> {
    try {
      const result = await pgPool`SELECT * FROM leads WHERE status = ${status}`;
      return result.map(this.mapLeadFromDb);
    } catch (error) {
      console.error("Fehler beim Abrufen der Leads nach Status:", error);
      throw error;
    }
  }
  
  async getLeadsByMarket(market: string): Promise<Lead[]> {
    try {
      const result = await pgPool`SELECT * FROM leads WHERE market = ${market}`;
      return result.map(this.mapLeadFromDb);
    } catch (error) {
      console.error("Fehler beim Abrufen der Leads nach Markt:", error);
      throw error;
    }
  }
  
  // Company methods
  async getCompanies(): Promise<Company[]> {
    try {
      const result = await pgPool`SELECT * FROM companies`;
      return result.map(this.mapCompanyFromDb);
    } catch (error) {
      console.error("Fehler beim Abrufen der Unternehmen:", error);
      throw error;
    }
  }
  
  async getCompany(id: number): Promise<Company | undefined> {
    try {
      const result = await pgPool`SELECT * FROM companies WHERE id = ${id}`;
      if (result.length === 0) return undefined;
      
      return this.mapCompanyFromDb(result[0]);
    } catch (error) {
      console.error("Fehler beim Abrufen des Unternehmens:", error);
      throw error;
    }
  }
  
  async createCompany(companyData: InsertCompany): Promise<Company> {
    try {
      const {
        name, size, industry, website, market, city,
        country, address, engagementScore, notes, logoUrl
      } = companyData;
      
      const result = await pgPool`
        INSERT INTO companies (
          name, size, industry, website, market, city,
          country, address, engagement_score, notes, logo_url
        ) VALUES (
          ${name}, ${size}, ${industry}, ${website}, ${market}, ${city},
          ${country}, ${address}, ${engagementScore}, ${notes}, ${logoUrl}
        )
        RETURNING *
      `;
      
      return this.mapCompanyFromDb(result[0]);
    } catch (error) {
      console.error("Fehler beim Erstellen des Unternehmens:", error);
      throw error;
    }
  }
  
  async updateCompany(id: number, companyData: Partial<InsertCompany>): Promise<Company | undefined> {
    try {
      // Wir müssen Feldzuordnungen explizit behandeln, um snake_case in der DB zu camelCase in JS zu konvertieren
      const updates: any = {};
      
      if (companyData.name !== undefined) updates.name = companyData.name;
      if (companyData.size !== undefined) updates.size = companyData.size;
      if (companyData.industry !== undefined) updates.industry = companyData.industry;
      if (companyData.website !== undefined) updates.website = companyData.website;
      if (companyData.market !== undefined) updates.market = companyData.market;
      if (companyData.city !== undefined) updates.city = companyData.city;
      if (companyData.country !== undefined) updates.country = companyData.country;
      if (companyData.address !== undefined) updates.address = companyData.address;
      if (companyData.engagementScore !== undefined) updates.engagement_score = companyData.engagementScore;
      if (companyData.notes !== undefined) updates.notes = companyData.notes;
      if (companyData.logoUrl !== undefined) updates.logo_url = companyData.logoUrl;
      
      // Keine Felder zu aktualisieren
      if (Object.keys(updates).length === 0) {
        const currentCompany = await this.getCompany(id);
        return currentCompany;
      }
      
      // Erstelle SET Klauseln für das SQL Update
      const setClauses = Object.entries(updates)
        .map(([key, value]) => `${key} = ${value === null ? 'NULL' : `'${value}'`}`)
        .join(', ');
      
      const query = `
        UPDATE companies 
        SET ${setClauses} 
        WHERE id = ${id} 
        RETURNING *
      `;
      
      const result = await pgPool.unsafe(query);
      
      if (result.length === 0) return undefined;
      return this.mapCompanyFromDb(result[0]);
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Unternehmens:", error);
      throw error;
    }
  }
  
  async deleteCompany(id: number): Promise<boolean> {
    try {
      const result = await pgPool`DELETE FROM companies WHERE id = ${id} RETURNING id`;
      return result.length > 0;
    } catch (error) {
      console.error("Fehler beim Löschen des Unternehmens:", error);
      throw error;
    }
  }
  
  async getCompaniesByMarket(market: string): Promise<Company[]> {
    try {
      const result = await pgPool`SELECT * FROM companies WHERE market = ${market}`;
      return result.map(this.mapCompanyFromDb);
    } catch (error) {
      console.error("Fehler beim Abrufen der Unternehmen nach Markt:", error);
      throw error;
    }
  }
  
  async getCompaniesByIndustry(industry: string): Promise<Company[]> {
    try {
      const result = await pgPool`SELECT * FROM companies WHERE industry = ${industry}`;
      return result.map(this.mapCompanyFromDb);
    } catch (error) {
      console.error("Fehler beim Abrufen der Unternehmen nach Branche:", error);
      throw error;
    }
  }
  
  // Task methods
  async getTasks(): Promise<Task[]> {
    try {
      const result = await pgPool`SELECT * FROM tasks`;
      return result.map(this.mapTaskFromDb);
    } catch (error) {
      console.error("Fehler beim Abrufen der Aufgaben:", error);
      throw error;
    }
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    try {
      const result = await pgPool`SELECT * FROM tasks WHERE id = ${id}`;
      if (result.length === 0) return undefined;
      
      return this.mapTaskFromDb(result[0]);
    } catch (error) {
      console.error("Fehler beim Abrufen der Aufgabe:", error);
      throw error;
    }
  }
  
  async createTask(taskData: InsertTask): Promise<Task> {
    try {
      const {
        title, status, description, assignedTo, leadId,
        companyId, dueDate
      } = taskData;
      
      const result = await pgPool`
        INSERT INTO tasks (
          title, status, description, assigned_to, lead_id,
          company_id, due_date
        ) VALUES (
          ${title}, ${status}, ${description}, ${assignedTo}, ${leadId},
          ${companyId}, ${dueDate}
        )
        RETURNING *
      `;
      
      return this.mapTaskFromDb(result[0]);
    } catch (error) {
      console.error("Fehler beim Erstellen der Aufgabe:", error);
      throw error;
    }
  }
  
  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    try {
      // Wir müssen Feldzuordnungen explizit behandeln, um snake_case in der DB zu camelCase in JS zu konvertieren
      const updates: any = {};
      
      if (taskData.title !== undefined) updates.title = taskData.title;
      if (taskData.status !== undefined) updates.status = taskData.status;
      if (taskData.description !== undefined) updates.description = taskData.description;
      if (taskData.assignedTo !== undefined) updates.assigned_to = taskData.assignedTo;
      if (taskData.leadId !== undefined) updates.lead_id = taskData.leadId;
      if (taskData.companyId !== undefined) updates.company_id = taskData.companyId;
      if (taskData.dueDate !== undefined) updates.due_date = taskData.dueDate;
      
      // Keine Felder zu aktualisieren
      if (Object.keys(updates).length === 0) {
        const currentTask = await this.getTask(id);
        return currentTask;
      }
      
      // Erstelle SET Klauseln für das SQL Update
      const setClauses = Object.entries(updates)
        .map(([key, value]) => `${key} = ${value === null ? 'NULL' : `'${value}'`}`)
        .join(', ');
      
      const query = `
        UPDATE tasks 
        SET ${setClauses} 
        WHERE id = ${id} 
        RETURNING *
      `;
      
      const result = await pgPool.unsafe(query);
      
      if (result.length === 0) return undefined;
      return this.mapTaskFromDb(result[0]);
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Aufgabe:", error);
      throw error;
    }
  }
  
  async deleteTask(id: number): Promise<boolean> {
    try {
      const result = await pgPool`DELETE FROM tasks WHERE id = ${id} RETURNING id`;
      return result.length > 0;
    } catch (error) {
      console.error("Fehler beim Löschen der Aufgabe:", error);
      throw error;
    }
  }
  
  async getTasksByLead(leadId: number): Promise<Task[]> {
    try {
      const result = await pgPool`SELECT * FROM tasks WHERE lead_id = ${leadId}`;
      return result.map(this.mapTaskFromDb);
    } catch (error) {
      console.error("Fehler beim Abrufen der Aufgaben nach Lead:", error);
      throw error;
    }
  }
  
  async getTasksByCompany(companyId: number): Promise<Task[]> {
    try {
      const result = await pgPool`SELECT * FROM tasks WHERE company_id = ${companyId}`;
      return result.map(this.mapTaskFromDb);
    } catch (error) {
      console.error("Fehler beim Abrufen der Aufgaben nach Unternehmen:", error);
      throw error;
    }
  }
  
  async getTasksByAssignee(assignedTo: number): Promise<Task[]> {
    try {
      const result = await pgPool`SELECT * FROM tasks WHERE assigned_to = ${assignedTo}`;
      return result.map(this.mapTaskFromDb);
    } catch (error) {
      console.error("Fehler beim Abrufen der Aufgaben nach Beauftragten:", error);
      throw error;
    }
  }
  
  async getTasksByDueDate(date: Date): Promise<Task[]> {
    try {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      
      const result = await pgPool`
        SELECT * FROM tasks 
        WHERE DATE(due_date) = DATE(${targetDate})
      `;
      
      return result.map(this.mapTaskFromDb);
    } catch (error) {
      console.error("Fehler beim Abrufen der Aufgaben nach Fälligkeitsdatum:", error);
      throw error;
    }
  }
  
  // AI Insights methods
  async getAiInsights(): Promise<AiInsight[]> {
    try {
      const result = await pgPool`SELECT * FROM ai_insights`;
      return result.map(this.mapAiInsightFromDb);
    } catch (error) {
      console.error("Fehler beim Abrufen der KI-Erkenntnisse:", error);
      throw error;
    }
  }
  
  async getAiInsight(id: number): Promise<AiInsight | undefined> {
    try {
      const result = await pgPool`SELECT * FROM ai_insights WHERE id = ${id}`;
      if (result.length === 0) return undefined;
      
      return this.mapAiInsightFromDb(result[0]);
    } catch (error) {
      console.error("Fehler beim Abrufen der KI-Erkenntnis:", error);
      throw error;
    }
  }
  
  async createAiInsight(insightData: InsertAiInsight): Promise<AiInsight> {
    try {
      const {
        type, title, description, leadId, companyId,
        actionText, actionUrl, isRead, isDismissed
      } = insightData;
      
      const result = await pgPool`
        INSERT INTO ai_insights (
          type, title, description, lead_id, company_id,
          action_text, action_url, is_read, is_dismissed
        ) VALUES (
          ${type}, ${title}, ${description}, ${leadId}, ${companyId},
          ${actionText}, ${actionUrl}, ${isRead}, ${isDismissed}
        )
        RETURNING *
      `;
      
      return this.mapAiInsightFromDb(result[0]);
    } catch (error) {
      console.error("Fehler beim Erstellen der KI-Erkenntnis:", error);
      throw error;
    }
  }
  
  async updateAiInsight(id: number, insightData: Partial<InsertAiInsight>): Promise<AiInsight | undefined> {
    try {
      // Wir müssen Feldzuordnungen explizit behandeln, um snake_case in der DB zu camelCase in JS zu konvertieren
      const updates: any = {};
      
      if (insightData.type !== undefined) updates.type = insightData.type;
      if (insightData.title !== undefined) updates.title = insightData.title;
      if (insightData.description !== undefined) updates.description = insightData.description;
      if (insightData.leadId !== undefined) updates.lead_id = insightData.leadId;
      if (insightData.companyId !== undefined) updates.company_id = insightData.companyId;
      if (insightData.actionText !== undefined) updates.action_text = insightData.actionText;
      if (insightData.actionUrl !== undefined) updates.action_url = insightData.actionUrl;
      if (insightData.isRead !== undefined) updates.is_read = insightData.isRead;
      if (insightData.isDismissed !== undefined) updates.is_dismissed = insightData.isDismissed;
      
      // Keine Felder zu aktualisieren
      if (Object.keys(updates).length === 0) {
        const currentInsight = await this.getAiInsight(id);
        return currentInsight;
      }
      
      // Erstelle SET Klauseln für das SQL Update
      const setClauses = Object.entries(updates)
        .map(([key, value]) => {
          if (typeof value === 'boolean') {
            return `${key} = ${value}`;
          }
          return `${key} = ${value === null ? 'NULL' : `'${value}'`}`;
        })
        .join(', ');
      
      const query = `
        UPDATE ai_insights 
        SET ${setClauses} 
        WHERE id = ${id} 
        RETURNING *
      `;
      
      const result = await pgPool.unsafe(query);
      
      if (result.length === 0) return undefined;
      return this.mapAiInsightFromDb(result[0]);
    } catch (error) {
      console.error("Fehler beim Aktualisieren der KI-Erkenntnis:", error);
      throw error;
    }
  }
  
  async deleteAiInsight(id: number): Promise<boolean> {
    try {
      const result = await pgPool`DELETE FROM ai_insights WHERE id = ${id} RETURNING id`;
      return result.length > 0;
    } catch (error) {
      console.error("Fehler beim Löschen der KI-Erkenntnis:", error);
      throw error;
    }
  }
  
  async getAiInsightsByLead(leadId: number): Promise<AiInsight[]> {
    try {
      const result = await pgPool`SELECT * FROM ai_insights WHERE lead_id = ${leadId}`;
      return result.map(this.mapAiInsightFromDb);
    } catch (error) {
      console.error("Fehler beim Abrufen der KI-Erkenntnisse nach Lead:", error);
      throw error;
    }
  }
  
  async getAiInsightsByCompany(companyId: number): Promise<AiInsight[]> {
    try {
      const result = await pgPool`SELECT * FROM ai_insights WHERE company_id = ${companyId}`;
      return result.map(this.mapAiInsightFromDb);
    } catch (error) {
      console.error("Fehler beim Abrufen der KI-Erkenntnisse nach Unternehmen:", error);
      throw error;
    }
  }
  
  // Beispieldaten in die Datenbank einfügen
  private async seedSampleData() {
    try {
      console.log("Füge Beispieldaten in die Datenbank ein...");
      
      // Benutzer einfügen
      const adminUser = {
        username: "admin",
        password: "5eb77ef50e634eee14bb97a073db1d860c04cce96f33409672d2773a1fa1af4c77cad846e4d89d3e3a82f4b4066ae4faf0bcfc212e4acca6fa0c3c8452f51d1a.5dcc4761d18db0b8", // "admin123"
        first_name: "Admin",
        last_name: "User",
        email: "admin@example.com",
        role: "admin",
        profile_image_url: null
      };
      
      const regularUser = {
        username: "johndoe",
        password: "5eb77ef50e634eee14bb97a073db1d860c04cce96f33409672d2773a1fa1af4c77cad846e4d89d3e3a82f4b4066ae4faf0bcfc212e4acca6fa0c3c8452f51d1a.5dcc4761d18db0b8", // "admin123"
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        role: "user",
        profile_image_url: null
      };
      
      const insertedUsers = await pgPool`
        INSERT INTO users ${pgPool(
          [adminUser, regularUser],
          'username', 'password', 'first_name', 'last_name', 'email', 'role', 'profile_image_url'
        )}
        RETURNING id
      `;
      
      // Unternehmen einfügen
      const companies = [
        {
          name: "TechCorp GmbH",
          size: "Medium",
          industry: "Technology",
          website: "https://techcorp.de",
          market: "Germany",
          city: "Berlin",
          country: "Germany",
          address: "Alexanderplatz 7, 10178 Berlin",
          engagement_score: 85,
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          notes: "Major player in cloud services for SMB market",
          logo_url: null
        },
        {
          name: "CloudNet AG",
          size: "Large",
          industry: "Hosting",
          website: "https://cloudnet.de",
          market: "Germany",
          city: "Munich",
          country: "Germany",
          address: "Maximilianstrasse 37, 80539 Munich",
          engagement_score: 70,
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
          notes: "Expanding their services to include AI-powered solutions",
          logo_url: null
        },
        {
          name: "Digital Solutions Inc.",
          size: "Enterprise",
          industry: "Software",
          website: "https://digitalsolutions.com",
          market: "USA",
          city: "Boston",
          country: "USA",
          address: "100 Technology Square, Boston, MA 02142",
          engagement_score: 90,
          created_at: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
          notes: "Leader in enterprise software solutions",
          logo_url: null
        },
        {
          name: "NetFlex Systems",
          size: "Small",
          industry: "Networking",
          website: "https://netflex.com",
          market: "USA",
          city: "San Francisco",
          country: "USA",
          address: "350 Mission St, San Francisco, CA 94105",
          engagement_score: 60,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          notes: "Innovative networking solutions for small businesses",
          logo_url: null
        },
        {
          name: "DataSecure GmbH",
          size: "Medium",
          industry: "Cybersecurity",
          website: "https://datasecure.de",
          market: "Germany",
          city: "Hamburg",
          country: "Germany",
          address: "Speersort 10, 20095 Hamburg",
          engagement_score: 78,
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          notes: "Specializes in data protection and security compliance",
          logo_url: null
        }
      ];
      
      const insertedCompanies = await pgPool`
        INSERT INTO companies ${pgPool(
          companies,
          'name', 'size', 'industry', 'website', 'market', 'city', 'country', 'address', 
          'engagement_score', 'created_at', 'notes', 'logo_url'
        )}
        RETURNING id
      `;
      
      // Leads einfügen
      const leads = [
        {
          first_name: "Markus",
          last_name: "Schmidt",
          email: "markus.schmidt@techcorp.de",
          position: "CTO",
          status: "Qualified",
          market: "Germany",
          company_id: insertedCompanies[0].id,
          phone: "+49 30 12345678",
          source: "Website",
          engagement_score: 85,
          created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          notes: "Interested in cloud migration services",
          last_contacted_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          first_name: "Julia",
          last_name: "Müller",
          email: "j.mueller@cloudnet.de",
          position: "IT Director",
          status: "New",
          market: "Germany",
          company_id: insertedCompanies[1].id,
          phone: "+49 89 87654321",
          source: "Conference",
          engagement_score: 65,
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          notes: "Met at CloudExpo, looking for managed services",
          last_contacted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        {
          first_name: "Michael",
          last_name: "Johnson",
          email: "mjohnson@digitalsolutions.com",
          position: "VP Technology",
          status: "Opportunity",
          market: "USA",
          company_id: insertedCompanies[2].id,
          phone: "+1 617-555-1234",
          source: "Referral",
          engagement_score: 92,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          notes: "Highly interested in our enterprise solutions",
          last_contacted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          first_name: "Sarah",
          last_name: "Williams",
          email: "swilliams@netflex.com",
          position: "Procurement Manager",
          status: "Contacted",
          market: "USA",
          company_id: insertedCompanies[3].id,
          phone: "+1 415-555-6789",
          source: "Email Campaign",
          engagement_score: 40,
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          notes: "Responded to outreach about networking solutions",
          last_contacted_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        },
        {
          first_name: "Thomas",
          last_name: "Fischer",
          email: "tfischer@datasecure.de",
          position: "CISO",
          status: "Qualified",
          market: "Germany",
          company_id: insertedCompanies[4].id,
          phone: "+49 40 98765432",
          source: "LinkedIn",
          engagement_score: 78,
          created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          notes: "Looking for comprehensive security audit services",
          last_contacted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      ];
      
      const insertedLeads = await pgPool`
        INSERT INTO leads ${pgPool(
          leads,
          'first_name', 'last_name', 'email', 'position', 'status', 'market', 'company_id',
          'phone', 'source', 'engagement_score', 'created_at', 'notes', 'last_contacted_at'
        )}
        RETURNING id
      `;
      
      // Aufgaben einfügen
      const tasks = [
        {
          title: "Schedule follow-up call",
          status: "Open",
          description: "Call Markus to discuss cloud migration proposal",
          assigned_to: insertedUsers[0].id,
          lead_id: insertedLeads[0].id,
          company_id: insertedCompanies[0].id,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          completed_at: null
        },
        {
          title: "Send proposal document",
          status: "Open",
          description: "Prepare and send the service proposal to Julia",
          assigned_to: insertedUsers[1].id,
          lead_id: insertedLeads[1].id,
          company_id: insertedCompanies[1].id,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          completed_at: null
        },
        {
          title: "Contract review",
          status: "In Progress",
          description: "Review contract terms with legal team",
          assigned_to: insertedUsers[0].id,
          lead_id: insertedLeads[2].id,
          company_id: insertedCompanies[2].id,
          created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          completed_at: null
        },
        {
          title: "Product demo",
          status: "Completed",
          description: "Conduct online product demo for NetFlex team",
          assigned_to: insertedUsers[1].id,
          lead_id: insertedLeads[3].id,
          company_id: insertedCompanies[3].id,
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          completed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          title: "Security assessment",
          status: "In Progress",
          description: "Prepare security assessment document for DataSecure",
          assigned_to: insertedUsers[0].id,
          lead_id: insertedLeads[4].id,
          company_id: insertedCompanies[4].id,
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          completed_at: null
        }
      ];
      
      const insertedTasks = await pgPool`
        INSERT INTO tasks ${pgPool(
          tasks,
          'title', 'status', 'description', 'assigned_to', 'lead_id', 'company_id',
          'created_at', 'due_date', 'completed_at'
        )}
        RETURNING id
      `;
      
      // AI-Erkenntnisse einfügen
      const aiInsights = [
        {
          type: "lead_score",
          title: "High potential lead detected",
          description: "Markus Schmidt shows high engagement patterns based on recent interactions.",
          lead_id: insertedLeads[0].id,
          company_id: insertedCompanies[0].id,
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          action_text: "View lead profile",
          action_url: `/leads/${insertedLeads[0].id}`,
          is_read: false,
          is_dismissed: false
        },
        {
          type: "company_intel",
          title: "Company expansion alert",
          description: "CloudNet AG is reportedly planning to open a new data center in Frankfurt.",
          lead_id: null,
          company_id: insertedCompanies[1].id,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          action_text: "View company profile",
          action_url: `/companies/${insertedCompanies[1].id}`,
          is_read: true,
          is_dismissed: false
        },
        {
          type: "market_trend",
          title: "US market opportunity",
          description: "Recent policy changes in the US market indicate growing demand for compliance solutions.",
          lead_id: insertedLeads[2].id,
          company_id: insertedCompanies[2].id,
          created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          action_text: "Generate market report",
          action_url: "/market-intelligence/us",
          is_read: false,
          is_dismissed: false
        },
        {
          type: "engagement_alert",
          title: "Engagement drop detected",
          description: "Sarah Williams has not responded to the last 3 communications.",
          lead_id: insertedLeads[3].id,
          company_id: insertedCompanies[3].id,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          action_text: "Create follow-up task",
          action_url: `/tasks/new?leadId=${insertedLeads[3].id}`,
          is_read: false,
          is_dismissed: false
        },
        {
          type: "content_suggestion",
          title: "Content recommendation",
          description: "Based on Thomas Fischer's interests, share our whitepaper on GDPR compliance.",
          lead_id: insertedLeads[4].id,
          company_id: insertedCompanies[4].id,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          action_text: "Send content",
          action_url: `/content/share?leadId=${insertedLeads[4].id}`,
          is_read: true,
          is_dismissed: false
        }
      ];
      
      await pgPool`
        INSERT INTO ai_insights ${pgPool(
          aiInsights,
          'type', 'title', 'description', 'lead_id', 'company_id', 'created_at',
          'action_text', 'action_url', 'is_read', 'is_dismissed'
        )}
      `;
      
      console.log("Beispieldaten erfolgreich eingefügt");
    } catch (error) {
      console.error("Fehler beim Einfügen der Beispieldaten:", error);
      throw error;
    }
  }
  
  // Hilfsfunktionen für das Mapping zwischen Datenbank und Anwendungsobjekten
  private mapUserFromDb(dbUser: any): User {
    return {
      id: dbUser.id,
      username: dbUser.username,
      password: dbUser.password,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      email: dbUser.email,
      role: dbUser.role,
      profileImageUrl: dbUser.profile_image_url
    };
  }
  
  private mapLeadFromDb(dbLead: any): Lead {
    return {
      id: dbLead.id,
      firstName: dbLead.first_name,
      lastName: dbLead.last_name,
      email: dbLead.email,
      position: dbLead.position,
      status: dbLead.status,
      market: dbLead.market,
      companyId: dbLead.company_id,
      phone: dbLead.phone,
      source: dbLead.source,
      engagementScore: dbLead.engagement_score,
      createdAt: dbLead.created_at,
      notes: dbLead.notes,
      lastContactedAt: dbLead.last_contacted_at
    };
  }
  
  private mapCompanyFromDb(dbCompany: any): Company {
    return {
      id: dbCompany.id,
      name: dbCompany.name,
      size: dbCompany.size,
      industry: dbCompany.industry,
      website: dbCompany.website,
      market: dbCompany.market,
      city: dbCompany.city,
      country: dbCompany.country,
      address: dbCompany.address,
      engagementScore: dbCompany.engagement_score,
      createdAt: dbCompany.created_at,
      notes: dbCompany.notes,
      logoUrl: dbCompany.logo_url
    };
  }
  
  private mapTaskFromDb(dbTask: any): Task {
    return {
      id: dbTask.id,
      title: dbTask.title,
      status: dbTask.status,
      description: dbTask.description,
      assignedTo: dbTask.assigned_to,
      leadId: dbTask.lead_id,
      companyId: dbTask.company_id,
      createdAt: dbTask.created_at,
      dueDate: dbTask.due_date,
      completedAt: dbTask.completed_at
    };
  }
  
  private mapAiInsightFromDb(dbInsight: any): AiInsight {
    return {
      id: dbInsight.id,
      type: dbInsight.type,
      title: dbInsight.title,
      description: dbInsight.description,
      leadId: dbInsight.lead_id,
      companyId: dbInsight.company_id,
      createdAt: dbInsight.created_at,
      actionText: dbInsight.action_text,
      actionUrl: dbInsight.action_url,
      isRead: dbInsight.is_read,
      isDismissed: dbInsight.is_dismissed
    };
  }
}

// Wechseln Sie zur DatabaseStorage anstelle von MemStorage
export const storage = new DatabaseStorage();
