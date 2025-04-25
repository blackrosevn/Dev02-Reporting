import { storage } from "./storage";
import { UserRole } from "@shared/schema";
import { COMPANY_LIST } from "../client/src/lib/constants";
import bcrypt from "bcryptjs";

/**
 * Initialize seed data for development
 */
export async function initSeedData(storage: any) {
  // Check if admin user already exists to avoid duplicate initialization
  const adminUser = await storage.getUserByUsername("admin");
  if (adminUser) {
    console.log("Seed data already initialized.");
    return;
  }

  console.log("Initializing seed data...");

  // Create admin user with hashed password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("admin123", salt);
  await storage.createUser({
    username: "admin",
    password: hashedPassword,
    name: "Admin Vinatex",
    email: "admin@vinatex.com.vn",
    role: UserRole.ADMIN,
    company: "Vinatex",
    companyCode: "VTX",
    isActive: true
  });

  // Create department users for each department
  const departments = [
    { name: "Ban Tổng hợp Pháp chế", code: "THPC" },
    { name: "Ban Tài chính Kế toán", code: "TCKT" },
    { name: "Ban Công nghệ Thông tin và Chuyển đổi số", code: "CNTT" },
    { name: "Ban Nguồn nhân lực Đào tạo", code: "NNLDT" },
    { name: "Ban Quản lý Sản xuất", code: "QLSX" },
    { name: "Ban Đầu tư", code: "DT" }
  ];

  // Hash password for all users
  const defaultPassword = await bcrypt.hash("vinatex123", salt);
  
  for (const dept of departments) {
    await storage.createUser({
      username: dept.code.toLowerCase(),
      password: defaultPassword,
      name: `Quản lý ${dept.name}`,
      email: `${dept.code.toLowerCase()}@vinatex.com.vn`,
      role: UserRole.DEPARTMENT,
      company: "Vinatex",
      companyCode: "VTX",
      department: dept.name,
      isActive: true
    });
  }

  // Create leader user
  await storage.createUser({
    username: "lanhdao",
    password: defaultPassword,
    name: "Lãnh đạo Tập đoàn",
    email: "lanhdao@vinatex.com.vn",
    role: UserRole.ADMIN,
    company: "Vinatex",
    companyCode: "VTX",
    isActive: true
  });

  // Create member unit users
  for (const company of COMPANY_LIST) {
    await storage.createUser({
      username: company.code.toLowerCase(),
      password: defaultPassword,
      name: `Người dùng ${company.name}`,
      email: `${company.code.toLowerCase()}@vinatex.com.vn`,
      role: UserRole.MEMBER_UNIT,
      company: company.name,
      companyCode: company.code,
      isActive: true
    });

    // Create company in database
    await storage.createCompany({
      name: company.name,
      code: company.code,
      email: `${company.code.toLowerCase()}@vinatex.com.vn`,
      isActive: true
    });
  }

  // Create sample report templates
  const financialTemplate = await storage.createReportTemplate({
    name: "Báo cáo tài chính Quý",
    description: "Báo cáo tài chính hàng quý của đơn vị thành viên",
    fields: [
      {
        id: "revenue",
        label: "Doanh thu",
        type: "number",
        required: true,
        sheet: "Kết quả kinh doanh",
        excelColumn: "B"
      },
      {
        id: "cost",
        label: "Chi phí",
        type: "number",
        required: true,
        sheet: "Kết quả kinh doanh",
        excelColumn: "C"
      },
      {
        id: "profit",
        label: "Lợi nhuận",
        type: "number",
        required: true,
        sheet: "Kết quả kinh doanh",
        excelColumn: "D"
      },
      {
        id: "assets",
        label: "Tài sản",
        type: "number",
        required: true,
        sheet: "Bảng cân đối",
        excelColumn: "B"
      },
      {
        id: "liabilities",
        label: "Nợ phải trả",
        type: "number",
        required: true,
        sheet: "Bảng cân đối",
        excelColumn: "C"
      },
      {
        id: "equity",
        label: "Vốn chủ sở hữu",
        type: "number",
        required: true,
        sheet: "Bảng cân đối",
        excelColumn: "D"
      },
      {
        id: "notes",
        label: "Ghi chú",
        type: "textarea",
        required: false,
        sheet: "Thuyết minh"
      }
    ],
    department: "Ban Tài chính Kế toán",
    requiredUnits: COMPANY_LIST.map(c => c.code),
    periodType: "quarterly",
    daysBeforeReminder: 7,
    sharePointPath: "/Documents/Financial",
    isActive: true,
    createdBy: 1
  });

  const hrTemplate = await storage.createReportTemplate({
    name: "Báo cáo nhân sự Quý",
    description: "Báo cáo nhân sự hàng quý của đơn vị thành viên",
    fields: [
      {
        id: "totalEmployees",
        label: "Tổng số nhân viên",
        type: "number",
        required: true,
        sheet: "Tổng quan",
        excelColumn: "B"
      },
      {
        id: "newHires",
        label: "Số nhân viên mới",
        type: "number",
        required: true,
        sheet: "Tổng quan",
        excelColumn: "C"
      },
      {
        id: "terminations",
        label: "Số nhân viên nghỉ việc",
        type: "number",
        required: true,
        sheet: "Tổng quan",
        excelColumn: "D"
      },
      {
        id: "averageSalary",
        label: "Lương trung bình",
        type: "number",
        required: true,
        sheet: "Lương & Phúc lợi",
        excelColumn: "B"
      },
      {
        id: "trainingHours",
        label: "Số giờ đào tạo",
        type: "number",
        required: true,
        sheet: "Đào tạo",
        excelColumn: "B"
      },
      {
        id: "notes",
        label: "Ghi chú",
        type: "textarea",
        required: false,
        sheet: "Ghi chú"
      }
    ],
    department: "Ban Nguồn nhân lực Đào tạo",
    requiredUnits: COMPANY_LIST.map(c => c.code),
    periodType: "quarterly",
    daysBeforeReminder: 7,
    sharePointPath: "/Documents/HR",
    isActive: true,
    createdBy: 1
  });

  // Create report periods
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  let currentQuarter = Math.ceil(currentMonth / 3);

  // Q2 2023 (for historical data)
  const q2DueDate = new Date(2023, 6, 15); // July 15, 2023
  const q2Period = await storage.createReportPeriod({
    templateId: financialTemplate.id,
    period: "2023-Q2",
    dueDate: q2DueDate,
    isActive: false
  });

  // Current quarter
  const currentQuarterDueDate = new Date(currentYear, currentQuarter * 3, 15);
  const currentPeriod = await storage.createReportPeriod({
    templateId: financialTemplate.id,
    period: `${currentYear}-Q${currentQuarter}`,
    dueDate: currentQuarterDueDate,
    isActive: true
  });

  // HR report for current quarter
  await storage.createReportPeriod({
    templateId: hrTemplate.id,
    period: `${currentYear}-Q${currentQuarter}`,
    dueDate: new Date(currentYear, currentQuarter * 3 - 1, 30), // End of last month of quarter
    isActive: true
  });

  // Next quarter
  const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1;
  const nextQuarterYear = currentQuarter === 4 ? currentYear + 1 : currentYear;
  const nextQuarterDueDate = new Date(nextQuarterYear, nextQuarter * 3, 15);
  await storage.createReportPeriod({
    templateId: financialTemplate.id,
    period: `${nextQuarterYear}-Q${nextQuarter}`,
    dueDate: nextQuarterDueDate,
    isActive: true
  });

  // Create sample reports for Q2 2023 (some submitted, some not)
  for (let i = 0; i < COMPANY_LIST.length; i++) {
    const company = COMPANY_LIST[i];
    const companyEntity = await storage.getCompanyByCode(company.code);
    
    if (!companyEntity) continue;

    // Q2 2023 financial report
    const status = i < 8 ? "submitted" : (i < 10 ? "late" : "pending");
    const submittedAt = status !== "pending" ? new Date(2023, 6, i < 8 ? 12 : 18) : null;
    
    const reportData = {
      templateId: financialTemplate.id,
      companyId: companyEntity.id,
      companyName: company.name,
      companyCode: company.code,
      period: "2023-Q2",
      dueDate: q2DueDate,
      data: {
        revenue: Math.floor(Math.random() * 1000000000) + 500000000,
        cost: Math.floor(Math.random() * 800000000) + 300000000,
        profit: Math.floor(Math.random() * 200000000) + 50000000,
        assets: Math.floor(Math.random() * 5000000000) + 1000000000,
        liabilities: Math.floor(Math.random() * 3000000000) + 500000000,
        equity: Math.floor(Math.random() * 2000000000) + 500000000,
        notes: "Báo cáo tài chính quý 2 năm 2023"
      }
    };

    const report = await storage.createReport(reportData);
    
    if (status !== "pending") {
      await storage.submitReport(
        report.id, 
        i + 3, // User ID (assuming first users are admin and department users)
        reportData.data, 
        `https://vinatex.sharepoint.com/sites/reports/Documents/Financial/${company.code}_2023-Q2.xlsx`
      );
      
      if (status === "late") {
        await storage.updateReportStatus(report.id, "late");
      }
    }

    // Current quarter report (all pending)
    await storage.createReport({
      templateId: financialTemplate.id,
      companyId: companyEntity.id,
      companyName: company.name,
      companyCode: company.code,
      period: `${currentYear}-Q${currentQuarter}`,
      dueDate: currentQuarterDueDate,
      data: {}
    });
  }

  console.log("Seed data initialized successfully!");
}
