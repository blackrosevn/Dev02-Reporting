import { pgTable, text, serial, integer, boolean, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles
export enum UserRole {
  ADMIN = "admin",
  DEPARTMENT = "department",
  MEMBER_UNIT = "member_unit",
}

// Report status
export enum ReportStatus {
  PENDING = "pending",
  SUBMITTED = "submitted",
  LATE = "late",
  OVERDUE = "overdue",
}

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").$type<UserRole>().notNull().default(UserRole.MEMBER_UNIT),
  company: text("company").notNull(),
  companyCode: text("company_code"),
  department: text("department"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Report templates table
export const reportTemplates = pgTable("report_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  fields: json("fields").$type<ReportField[]>().notNull(),
  department: text("department").notNull(),
  requiredUnits: json("required_units").$type<string[]>().notNull(),
  periodType: text("period_type").notNull(), // annual, quarterly, monthly
  daysBeforeReminder: integer("days_before_reminder").notNull().default(7),
  sharePointPath: text("sharepoint_path"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertReportTemplateSchema = createInsertSchema(reportTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Reports table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull(),
  companyId: integer("company_id").notNull(),
  companyName: text("company_name").notNull(),
  companyCode: text("company_code").notNull(),
  period: text("period").notNull(), // Q1-2023, 2023, etc.
  dueDate: timestamp("due_date").notNull(),
  submittedAt: timestamp("submitted_at"),
  submittedBy: integer("submitted_by"),
  status: text("status").$type<ReportStatus>().notNull().default(ReportStatus.PENDING),
  data: json("data").notNull(),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true,
  submittedBy: true,
  status: true,
});

// Report periods
export const reportPeriods = pgTable("report_periods", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull(),
  period: text("period").notNull(), // Q1-2023, 2023, etc.
  dueDate: timestamp("due_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReportPeriodSchema = createInsertSchema(reportPeriods).omit({
  id: true,
  createdAt: true,
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // reminder, submission, late
  read: boolean("read").notNull().default(false),
  reportId: integer("report_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Companies table (member units)
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  address: text("address"),
  email: text("email"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

// Report field type for form generation
export interface ReportField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
  sheet?: string;
  excelColumn?: string;
}

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type ReportPeriod = typeof reportPeriods.$inferSelect;
export type InsertReportPeriod = z.infer<typeof insertReportPeriodSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
