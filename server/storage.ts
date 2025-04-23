import { 
  User, InsertUser, users,
  ReportTemplate, InsertReportTemplate, reportTemplates,
  Report, InsertReport, reports, ReportStatus,
  ReportPeriod, InsertReportPeriod, reportPeriods,
  Notification, InsertNotification, notifications,
  Company, InsertCompany, companies
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Company methods
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByCode(code: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  getCompanies(active?: boolean): Promise<Company[]>;
  
  // Report template methods
  getReportTemplate(id: number): Promise<ReportTemplate | undefined>;
  createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate>;
  getReportTemplates(active?: boolean): Promise<ReportTemplate[]>;
  
  // Report period methods
  createReportPeriod(periodData: InsertReportPeriod): Promise<ReportPeriod>;
  getReportPeriods(templateId?: number, active?: boolean): Promise<ReportPeriod[]>;
  getReportPeriod(id: number): Promise<ReportPeriod | undefined>;
  
  // Report methods
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: number): Promise<Report | undefined>;
  getReportsByCompany(companyId: number): Promise<Report[]>;
  getReportsByTemplate(templateId: number): Promise<Report[]>;
  getReportsByPeriod(period: string): Promise<Report[]>;
  getReportsByStatus(status: ReportStatus): Promise<Report[]>;
  submitReport(id: number, userId: number, data: any, fileUrl?: string): Promise<Report | undefined>;
  updateReportStatus(id: number, status: ReportStatus): Promise<Report | undefined>;
  getAllReports(): Promise<Report[]>;
  
  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private reportTemplates: Map<number, ReportTemplate>;
  private reportPeriods: Map<number, ReportPeriod>;
  private reports: Map<number, Report>;
  private notifications: Map<number, Notification>;
  
  private userIdCounter: number;
  private companyIdCounter: number;
  private templateIdCounter: number;
  private periodIdCounter: number;
  private reportIdCounter: number;
  private notificationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.reportTemplates = new Map();
    this.reportPeriods = new Map();
    this.reports = new Map();
    this.notifications = new Map();
    
    this.userIdCounter = 1;
    this.companyIdCounter = 1;
    this.templateIdCounter = 1;
    this.periodIdCounter = 1;
    this.reportIdCounter = 1;
    this.notificationIdCounter = 1;
    
    // Initialize with sample admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      name: "Admin User",
      email: "admin@vinatex.com.vn",
      role: "admin",
      company: "Vinatex",
      companyCode: "VTX",
      department: "Admin",
      isActive: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  // Company methods
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async getCompanyByCode(code: string): Promise<Company | undefined> {
    return Array.from(this.companies.values()).find(
      (company) => company.code === code
    );
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const id = this.companyIdCounter++;
    const now = new Date();
    const newCompany: Company = { 
      ...company, 
      id, 
      createdAt: now
    };
    this.companies.set(id, newCompany);
    return newCompany;
  }

  async getCompanies(active?: boolean): Promise<Company[]> {
    const allCompanies = Array.from(this.companies.values());
    if (active !== undefined) {
      return allCompanies.filter(company => company.isActive === active);
    }
    return allCompanies;
  }

  // Report template methods
  async getReportTemplate(id: number): Promise<ReportTemplate | undefined> {
    return this.reportTemplates.get(id);
  }

  async createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate> {
    const id = this.templateIdCounter++;
    const now = new Date();
    const newTemplate: ReportTemplate = { 
      ...template, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.reportTemplates.set(id, newTemplate);
    return newTemplate;
  }

  async getReportTemplates(active?: boolean): Promise<ReportTemplate[]> {
    const allTemplates = Array.from(this.reportTemplates.values());
    if (active !== undefined) {
      return allTemplates.filter(template => template.isActive === active);
    }
    return allTemplates;
  }

  // Report period methods
  async createReportPeriod(periodData: InsertReportPeriod): Promise<ReportPeriod> {
    const id = this.periodIdCounter++;
    const now = new Date();
    const newPeriod: ReportPeriod = { 
      ...periodData, 
      id, 
      createdAt: now
    };
    this.reportPeriods.set(id, newPeriod);
    return newPeriod;
  }

  async getReportPeriods(templateId?: number, active?: boolean): Promise<ReportPeriod[]> {
    let periods = Array.from(this.reportPeriods.values());
    
    if (templateId !== undefined) {
      periods = periods.filter(period => period.templateId === templateId);
    }
    
    if (active !== undefined) {
      periods = periods.filter(period => period.isActive === active);
    }
    
    return periods;
  }

  async getReportPeriod(id: number): Promise<ReportPeriod | undefined> {
    return this.reportPeriods.get(id);
  }

  // Report methods
  async createReport(report: InsertReport): Promise<Report> {
    const id = this.reportIdCounter++;
    const now = new Date();
    const newReport: Report = { 
      ...report, 
      id, 
      status: ReportStatus.PENDING,
      createdAt: now,
      updatedAt: now
    };
    this.reports.set(id, newReport);
    return newReport;
  }

  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async getReportsByCompany(companyId: number): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(
      report => report.companyId === companyId
    );
  }

  async getReportsByTemplate(templateId: number): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(
      report => report.templateId === templateId
    );
  }

  async getReportsByPeriod(period: string): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(
      report => report.period === period
    );
  }

  async getReportsByStatus(status: ReportStatus): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(
      report => report.status === status
    );
  }

  async submitReport(id: number, userId: number, data: any, fileUrl?: string): Promise<Report | undefined> {
    const report = this.reports.get(id);
    if (!report) return undefined;
    
    const now = new Date();
    const updatedReport: Report = { 
      ...report, 
      data, 
      submittedAt: now, 
      submittedBy: userId, 
      status: ReportStatus.SUBMITTED,
      fileUrl: fileUrl ?? report.fileUrl,
      updatedAt: now
    };
    this.reports.set(id, updatedReport);
    return updatedReport;
  }

  async updateReportStatus(id: number, status: ReportStatus): Promise<Report | undefined> {
    const report = this.reports.get(id);
    if (!report) return undefined;
    
    const updatedReport: Report = { 
      ...report, 
      status,
      updatedAt: new Date()
    };
    this.reports.set(id, updatedReport);
    return updatedReport;
  }

  async getAllReports(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }

  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const now = new Date();
    const newNotification: Notification = { 
      ...notification, 
      id, 
      createdAt: now
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      this.notifications.set(id, { ...notification, read: true });
    }
  }
}

import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return db.select().from(users).where(eq(users.role, role));
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getCompanyByCode(code: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.code, code));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async getCompanies(active?: boolean): Promise<Company[]> {
    if (typeof active !== 'undefined') {
      return db.select().from(companies).where(eq(companies.isActive, active));
    }
    return db.select().from(companies);
  }

  async getReportTemplate(id: number): Promise<ReportTemplate | undefined> {
    const [template] = await db.select().from(reportTemplates).where(eq(reportTemplates.id, id));
    return template;
  }

  async createReportTemplate(template: InsertReportTemplate): Promise<ReportTemplate> {
    const [newTemplate] = await db.insert(reportTemplates).values(template).returning();
    return newTemplate;
  }

  async getReportTemplates(active?: boolean): Promise<ReportTemplate[]> {
    if (typeof active !== 'undefined') {
      return db.select().from(reportTemplates).where(eq(reportTemplates.isActive, active));
    }
    return db.select().from(reportTemplates);
  }

  async createReportPeriod(periodData: InsertReportPeriod): Promise<ReportPeriod> {
    const [newPeriod] = await db.insert(reportPeriods).values(periodData).returning();
    return newPeriod;
  }

  async getReportPeriods(templateId?: number, active?: boolean): Promise<ReportPeriod[]> {
    let query = db.select().from(reportPeriods);
    
    if (templateId !== undefined && active !== undefined) {
      query = query.where(
        and(
          eq(reportPeriods.templateId, templateId),
          eq(reportPeriods.isActive, active)
        )
      );
    } else if (templateId !== undefined) {
      query = query.where(eq(reportPeriods.templateId, templateId));
    } else if (active !== undefined) {
      query = query.where(eq(reportPeriods.isActive, active));
    }
    
    return query;
  }

  async getReportPeriod(id: number): Promise<ReportPeriod | undefined> {
    const [period] = await db.select().from(reportPeriods).where(eq(reportPeriods.id, id));
    return period;
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async getReportsByCompany(companyId: number): Promise<Report[]> {
    return db.select().from(reports).where(eq(reports.companyId, companyId));
  }

  async getReportsByTemplate(templateId: number): Promise<Report[]> {
    return db.select().from(reports).where(eq(reports.templateId, templateId));
  }

  async getReportsByPeriod(period: string): Promise<Report[]> {
    return db.select().from(reports).where(eq(reports.period, period));
  }

  async getReportsByStatus(status: ReportStatus): Promise<Report[]> {
    return db.select().from(reports).where(eq(reports.status, status));
  }

  async submitReport(id: number, userId: number, data: any, fileUrl?: string): Promise<Report | undefined> {
    const now = new Date();
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    
    if (!report) return undefined;
    
    // Determine status based on due date
    const status = now > report.dueDate ? ReportStatus.LATE : ReportStatus.SUBMITTED;
    
    const [updatedReport] = await db
      .update(reports)
      .set({
        submittedAt: now,
        submittedBy: userId,
        status,
        data,
        fileUrl,
        updatedAt: now
      })
      .where(eq(reports.id, id))
      .returning();
      
    return updatedReport;
  }

  async updateReportStatus(id: number, status: ReportStatus): Promise<Report | undefined> {
    const [updatedReport] = await db
      .update(reports)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(reports.id, id))
      .returning();
      
    return updatedReport;
  }

  async getAllReports(): Promise<Report[]> {
    return db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }
}

// Use the DatabaseStorage implementation instead of MemStorage
export const storage = new DatabaseStorage();
