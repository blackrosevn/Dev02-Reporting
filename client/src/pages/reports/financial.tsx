import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DownloadCloud, 
  Eye, 
  FileSpreadsheet, 
  Filter, 
  Loader2 
} from "lucide-react";
import { Link } from "wouter";
import { REPORT_PERIODS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Report, ReportStatus, UserRole } from "@shared/schema";

export default function FinancialReports() {
  const [period, setPeriod] = useState<string>("2023-Q2");
  const { user } = useAuth();
  const { toast } = useToast();

  // Get financial reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/reports", { templateName: "Báo cáo tài chính" }],
    select: (data: Report[]) => {
      // Filter financial reports
      return data.filter(report => 
        report.period === period && 
        report.templateId === 1 // Assuming ID 1 is for financial reports
      );
    }
  });

  // Get templates
  const { data: templates } = useQuery({
    queryKey: ["/api/templates"],
  });

  const handleDownload = (report: Report) => {
    if (!report.fileUrl) {
      toast({
        title: "Không thể tải xuống báo cáo",
        description: "File báo cáo không có sẵn.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, this would download the file from SharePoint
    window.open(report.fileUrl, "_blank");
  };

  return (
    <MainLayout pageTitle="Báo cáo tài chính" backLink="/reports">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Báo cáo tài chính</h1>
        <div className="flex items-center space-x-3">
          <Select
            value={period}
            onValueChange={setPeriod}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Chọn kỳ báo cáo" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_PERIODS.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {user?.role === UserRole.ADMIN && (
            <Link href="/reports/templates">
              <Button variant="outline" className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Quản lý mẫu báo cáo
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">
            Báo cáo tài chính {period.includes("Q") ? `Quý ${period.split("Q")[1]}` : ""} {period.split("-")[0] || period}
          </CardTitle>
          <Button variant="ghost" size="sm" className="gap-1">
            <Filter className="h-4 w-4" />
            Lọc
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reports && reports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Kỳ báo cáo</TableHead>
                  <TableHead>Ngày hạn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày nộp</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.companyName}</TableCell>
                    <TableCell>{report.period}</TableCell>
                    <TableCell>{formatDate(report.dueDate)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        report.status === ReportStatus.SUBMITTED ? "default" :
                        report.status === ReportStatus.PENDING ? "secondary" :
                        "destructive"
                      }>
                        {report.status === ReportStatus.PENDING ? "Chưa nộp" : 
                         report.status === ReportStatus.SUBMITTED ? "Đã nộp" : 
                         report.status === ReportStatus.LATE ? "Nộp muộn" : "Quá hạn"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {report.submittedAt ? formatDate(report.submittedAt) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/reports/${report.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Xem</span>
                          </Button>
                        </Link>
                        {report.submittedAt && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownload(report)}
                          >
                            <DownloadCloud className="h-4 w-4" />
                            <span className="sr-only">Tải xuống</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <FileSpreadsheet className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600">Không có báo cáo tài chính nào cho kỳ này</p>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}