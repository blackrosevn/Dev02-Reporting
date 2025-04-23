import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ReportPeriod, ReportTemplate } from "@shared/schema";
import { ReportCard } from "@/components/dashboard/report-card";

interface UpcomingReport {
  id: number;
  name: string;
  description: string;
  period: string;
  dueDate: string;
  totalUnits: number;
  submittedUnits: number;
  department: string;
}

export function UpcomingReports() {
  const [upcomingReports, setUpcomingReports] = useState<UpcomingReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingReports = async () => {
      setLoading(true);
      try {
        // Get active report periods
        const periodsRes = await apiRequest("GET", "/api/periods?active=true");
        const periods: ReportPeriod[] = await periodsRes.json();

        // Get active report templates
        const templatesRes = await apiRequest("GET", "/api/templates?active=true");
        const templates: ReportTemplate[] = await templatesRes.json();

        // Get all reports
        const reportsRes = await apiRequest("GET", "/api/reports");
        const reports = await reportsRes.json();

        // Combine data to create upcoming reports
        const upcoming: UpcomingReport[] = periods
          .filter(period => new Date(period.dueDate) > new Date())
          .map(period => {
            const template = templates.find(t => t.id === period.templateId);
            if (!template) return null;

            const relevantReports = reports.filter(
              (r: any) => r.templateId === template.id && r.period === period.period
            );

            const submittedReports = relevantReports.filter(
              (r: any) => r.status === "submitted" || r.status === "late"
            );

            return {
              id: period.id,
              name: template.name,
              description: template.description || `${template.name} cho kỳ ${period.period}`,
              period: period.period,
              dueDate: period.dueDate,
              totalUnits: template.requiredUnits.length,
              submittedUnits: submittedReports.length,
              department: template.department,
            };
          })
          .filter(Boolean)
          .sort((a, b) => new Date(a!.dueDate).getTime() - new Date(b!.dueDate).getTime());

        setUpcomingReports(upcoming as UpcomingReport[]);
      } catch (error) {
        console.error("Failed to fetch upcoming reports:", error);
        // Fallback data in case the API fails
        setUpcomingReports([
          {
            id: 1,
            name: "Báo cáo tài chính Quý 3",
            description: "Báo cáo tài chính quý 3 năm 2023 của các đơn vị thành viên",
            period: "2023-Q3",
            dueDate: "2023-10-15",
            totalUnits: 20,
            submittedUnits: 0,
            department: "TCKT",
          },
          {
            id: 2,
            name: "Báo cáo nhân sự Quý 3",
            description: "Báo cáo tình hình nhân sự quý 3 năm 2023",
            period: "2023-Q3",
            dueDate: "2023-09-30",
            totalUnits: 15,
            submittedUnits: 2,
            department: "Ban NNLĐ",
          },
          {
            id: 3,
            name: "Báo cáo sản xuất Q3",
            description: "Báo cáo tình hình sản xuất quý 3 năm 2023",
            period: "2023-Q3",
            dueDate: "2023-10-10",
            totalUnits: 18,
            submittedUnits: 0,
            department: "Ban QLSX",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingReports();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-neutral-800">Báo cáo sắp đến hạn</h2>
        <Button variant="link" className="flex items-center text-primary">
          Xem tất cả
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingReports.slice(0, 3).map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
}
