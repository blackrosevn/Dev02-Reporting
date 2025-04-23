import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { initSeedData } from "./accounts";
import { z } from "zod";
import bcrypt from "bcryptjs";
import MemoryStore from "memorystore";
import { 
  insertUserSchema, insertReportTemplateSchema, 
  insertReportSchema, insertReportPeriodSchema,
  UserRole, ReportStatus 
} from "@shared/schema";
import { sendReminderEmail, sendLateSubmissionEmail } from "./utils/email";
import { generateExcelFromForm, parseExcelToForm } from "./utils/excel";
import { uploadToSharePoint } from "./utils/sharepoint";

// Extend Express Request type to include user
declare module "express-session" {
  interface SessionData {
    userId: number;
    role: string;
    username: string;
    company: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const sessionStore = MemoryStore(session);

  // Setup session middleware
  app.use(
    session({
      cookie: {
        maxAge: 86400000, // 24 hours
        secure: process.env.NODE_ENV === "production",
      },
      store: new sessionStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "vinatex-report-portal-secret"
    })
  );

  // Initialize seed data for development
  await initSeedData(storage);

  // Auth middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.session && req.session.userId) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  };

  const hasRole = (roles: UserRole[]) => {
    return (req: any, res: any, next: any) => {
      if (req.session && req.session.role && roles.includes(req.session.role as UserRole)) {
        return next();
      }
      return res.status(403).json({ message: "Forbidden" });
    };
  };

  // Auth routes
  app.post("/api/login", async (req, res) => {
    const schema = z.object({
      username: z.string().min(1),
      password: z.string().min(1)
    });

    try {
      const { username, password } = schema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không hợp lệ" });
      }

      // Simple password check (in production would use bcrypt)
      // Replace with bcrypt.compare in production
      const isPasswordValid = password === user.password;
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không hợp lệ" });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "Tài khoản của bạn đã bị vô hiệu hóa" });
      }

      // Set session data
      req.session.userId = user.id;
      req.session.role = user.role;
      req.session.username = user.username;
      req.session.company = user.company;

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(400).json({ message: "Dữ liệu đăng nhập không hợp lệ" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Không thể đăng xuất" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Đăng xuất thành công" });
    });
  });

  app.get("/api/me", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }
      
      // Return user data without password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  // User management routes
  app.get("/api/users", isAuthenticated, hasRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const users = await storage.getUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      return res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  app.post("/api/users", isAuthenticated, hasRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
      }
      
      // In production, hash the password
      // userData.password = await bcrypt.hash(userData.password, 10);
      
      const newUser = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      }
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  app.put("/api/users/:id", isAuthenticated, hasRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = req.body;
      
      // Validate data
      const validationSchema = insertUserSchema.partial();
      validationSchema.parse(userData);
      
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      }
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  // Company routes
  app.get("/api/companies", isAuthenticated, async (req, res) => {
    try {
      const active = req.query.active === "true" ? true : 
                     req.query.active === "false" ? false : 
                     undefined;
      
      const companies = await storage.getCompanies(active);
      return res.status(200).json(companies);
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  // Report template routes
  app.get("/api/templates", isAuthenticated, async (req, res) => {
    try {
      const active = req.query.active === "true" ? true : 
                     req.query.active === "false" ? false : 
                     undefined;
      
      const templates = await storage.getReportTemplates(active);
      return res.status(200).json(templates);
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  app.get("/api/templates/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getReportTemplate(id);
      
      if (!template) {
        return res.status(404).json({ message: "Không tìm thấy mẫu báo cáo" });
      }
      
      return res.status(200).json(template);
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  app.post("/api/templates", isAuthenticated, hasRole([UserRole.ADMIN, UserRole.DEPARTMENT]), async (req, res) => {
    try {
      const templateData = insertReportTemplateSchema.parse(req.body);
      templateData.createdBy = req.session.userId;
      
      const newTemplate = await storage.createReportTemplate(templateData);
      return res.status(201).json(newTemplate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      }
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  // Report period routes
  app.post("/api/periods", isAuthenticated, hasRole([UserRole.ADMIN, UserRole.DEPARTMENT]), async (req, res) => {
    try {
      const periodData = insertReportPeriodSchema.parse(req.body);
      
      // Check if template exists
      const template = await storage.getReportTemplate(periodData.templateId);
      if (!template) {
        return res.status(404).json({ message: "Không tìm thấy mẫu báo cáo" });
      }
      
      const newPeriod = await storage.createReportPeriod(periodData);
      
      // Create report entries for all required units
      const companies = await storage.getCompanies(true);
      const requiredCompanies = companies.filter(company => 
        template.requiredUnits.includes(company.code)
      );
      
      for (const company of requiredCompanies) {
        await storage.createReport({
          templateId: template.id,
          companyId: company.id,
          companyName: company.name,
          companyCode: company.code,
          period: periodData.period,
          dueDate: periodData.dueDate,
          data: {}
        });
      }
      
      return res.status(201).json(newPeriod);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ", errors: error.errors });
      }
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  app.get("/api/periods", isAuthenticated, async (req, res) => {
    try {
      const templateId = req.query.templateId ? parseInt(req.query.templateId as string) : undefined;
      const active = req.query.active === "true" ? true : 
                     req.query.active === "false" ? false : 
                     undefined;
      
      const periods = await storage.getReportPeriods(templateId, active);
      return res.status(200).json(periods);
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  // Report routes
  app.get("/api/reports", isAuthenticated, async (req, res) => {
    try {
      let reports;
      
      // Filter reports based on role
      if (req.session.role === UserRole.ADMIN || req.session.role === UserRole.DEPARTMENT) {
        reports = await storage.getAllReports();
      } else {
        // For member units, only return their reports
        const user = await storage.getUser(req.session.userId);
        if (!user) {
          return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        
        const company = await storage.getCompanyByCode(user.companyCode || "");
        if (!company) {
          return res.status(404).json({ message: "Không tìm thấy công ty" });
        }
        
        reports = await storage.getReportsByCompany(company.id);
      }
      
      // Apply filters
      const templateId = req.query.templateId ? parseInt(req.query.templateId as string) : undefined;
      const period = req.query.period as string | undefined;
      const status = req.query.status as ReportStatus | undefined;
      
      if (templateId) {
        reports = reports.filter(report => report.templateId === templateId);
      }
      
      if (period) {
        reports = reports.filter(report => report.period === period);
      }
      
      if (status) {
        reports = reports.filter(report => report.status === status);
      }
      
      return res.status(200).json(reports);
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  app.get("/api/reports/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getReport(id);
      
      if (!report) {
        return res.status(404).json({ message: "Không tìm thấy báo cáo" });
      }
      
      // Check permission
      if (req.session.role === UserRole.MEMBER_UNIT) {
        const user = await storage.getUser(req.session.userId);
        if (!user) {
          return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        
        const company = await storage.getCompanyByCode(user.companyCode || "");
        if (!company || company.id !== report.companyId) {
          return res.status(403).json({ message: "Bạn không có quyền xem báo cáo này" });
        }
      }
      
      return res.status(200).json(report);
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  app.post("/api/reports/:id/submit", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getReport(id);
      
      if (!report) {
        return res.status(404).json({ message: "Không tìm thấy báo cáo" });
      }
      
      // Check permission
      if (req.session.role === UserRole.MEMBER_UNIT) {
        const user = await storage.getUser(req.session.userId);
        if (!user) {
          return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        
        const company = await storage.getCompanyByCode(user.companyCode || "");
        if (!company || company.id !== report.companyId) {
          return res.status(403).json({ message: "Bạn không có quyền nộp báo cáo này" });
        }
      }
      
      const { data } = req.body;
      
      // In a real implementation, we would validate the data against the template fields
      
      // Get template to generate Excel
      const template = await storage.getReportTemplate(report.templateId);
      if (!template) {
        return res.status(404).json({ message: "Không tìm thấy mẫu báo cáo" });
      }
      
      // Generate Excel file
      const excelBuffer = await generateExcelFromForm(data, template);
      
      // Upload to SharePoint
      let fileUrl = "";
      if (template.sharePointPath) {
        const fileName = `${report.companyCode}_${report.period}_${new Date().getTime()}.xlsx`;
        fileUrl = await uploadToSharePoint(excelBuffer, template.sharePointPath, fileName);
      }
      
      // Submit report
      const submittedReport = await storage.submitReport(id, req.session.userId, data, fileUrl);
      
      // Determine status based on due date
      const now = new Date();
      if (now > report.dueDate) {
        await storage.updateReportStatus(id, ReportStatus.LATE);
        
        // Send late submission notification
        const adminUsers = await storage.getUsersByRole(UserRole.ADMIN);
        for (const admin of adminUsers) {
          await storage.createNotification({
            userId: admin.id,
            title: "Báo cáo nộp muộn",
            message: `${report.companyName} đã nộp báo cáo "${template.name}" cho kỳ ${report.period} muộn hạn`,
            type: "late",
            reportId: report.id,
            read: false
          });
          
          // Send email in a real implementation
          await sendLateSubmissionEmail(admin.email, report, template);
        }
      }
      
      return res.status(200).json(submittedReport);
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  app.post("/api/reports/:id/upload", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await storage.getReport(id);
      
      if (!report) {
        return res.status(404).json({ message: "Không tìm thấy báo cáo" });
      }
      
      // Check permission
      if (req.session.role === UserRole.MEMBER_UNIT) {
        const user = await storage.getUser(req.session.userId);
        if (!user) {
          return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        
        const company = await storage.getCompanyByCode(user.companyCode || "");
        if (!company || company.id !== report.companyId) {
          return res.status(403).json({ message: "Bạn không có quyền nộp báo cáo này" });
        }
      }
      
      // In a real implementation, we would:
      // 1. Get the uploaded Excel file from the request
      // 2. Parse it to extract form data
      // 3. Validate the data against the template
      // 4. Submit the report
      
      // Here, we'll simulate with example data
      const { file } = req.body; // This would be the Excel file buffer in a real implementation
      
      // Get template
      const template = await storage.getReportTemplate(report.templateId);
      if (!template) {
        return res.status(404).json({ message: "Không tìm thấy mẫu báo cáo" });
      }
      
      // Parse Excel to form data
      const data = await parseExcelToForm(file, template);
      
      // Submit report
      const submittedReport = await storage.submitReport(id, req.session.userId, data);
      
      return res.status(200).json(submittedReport);
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  // Dashboard statistics routes
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const reports = await storage.getAllReports();
      
      // Calculate statistics
      const totalReports = reports.length;
      const submittedReports = reports.filter(report => report.status === ReportStatus.SUBMITTED).length;
      const pendingReports = reports.filter(report => report.status === ReportStatus.PENDING).length;
      const lateReports = reports.filter(report => report.status === ReportStatus.LATE).length;
      
      // Filter by current period if specified
      const period = req.query.period as string | undefined;
      let filteredReports = reports;
      
      if (period) {
        filteredReports = reports.filter(report => report.period === period);
      }
      
      return res.status(200).json({
        totalReports,
        submittedReports,
        pendingReports,
        lateReports,
        periodStats: {
          total: filteredReports.length,
          submitted: filteredReports.filter(report => report.status === ReportStatus.SUBMITTED).length,
          pending: filteredReports.filter(report => report.status === ReportStatus.PENDING).length,
          late: filteredReports.filter(report => report.status === ReportStatus.LATE).length
        }
      });
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  // Notification routes
  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const notifications = await storage.getNotifications(req.session.userId);
      return res.status(200).json(notifications);
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  app.post("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      return res.status(200).json({ message: "Đã đánh dấu là đã đọc" });
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  // Email reminders - in a real implementation, this would be a scheduled task
  app.post("/api/admin/send-reminders", isAuthenticated, hasRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const reports = await storage.getAllReports();
      const now = new Date();
      
      // Get reports that are due soon
      const upcomingReports = reports.filter(report => {
        if (report.status !== ReportStatus.PENDING) return false;
        
        const dueDate = new Date(report.dueDate);
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        return diffDays > 0 && diffDays <= 7; // Due within a week
      });
      
      // Group by company
      const reportsByCompany = new Map();
      
      for (const report of upcomingReports) {
        if (!reportsByCompany.has(report.companyId)) {
          reportsByCompany.set(report.companyId, []);
        }
        reportsByCompany.get(report.companyId).push(report);
      }
      
      // Send reminders
      for (const [companyId, companyReports] of reportsByCompany.entries()) {
        const company = await storage.getCompany(companyId);
        if (!company) continue;
        
        // Get company users
        const users = await storage.getUsersByRole(UserRole.MEMBER_UNIT);
        const companyUsers = users.filter(user => user.companyCode === company.code);
        
        for (const user of companyUsers) {
          // Create notifications
          for (const report of companyReports) {
            await storage.createNotification({
              userId: user.id,
              title: "Nhắc nhở báo cáo",
              message: `Báo cáo "${report.companyName}" cho kỳ ${report.period} sắp đến hạn nộp (${new Date(report.dueDate).toLocaleDateString("vi-VN")})`,
              type: "reminder",
              reportId: report.id,
              read: false
            });
            
            // Send email in a real implementation
            await sendReminderEmail(user.email, report);
          }
        }
      }
      
      return res.status(200).json({ message: "Đã gửi nhắc nhở" });
    } catch (error) {
      return res.status(500).json({ message: "Lỗi server" });
    }
  });

  return httpServer;
}
