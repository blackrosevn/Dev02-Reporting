import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { REPORT_PERIODS } from "@/lib/constants";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FileDown, FileSpreadsheet, FilePieChart, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Report, ReportTemplate } from "@shared/schema";

export default function ExportReports() {
  const [period, setPeriod] = useState<string>("2023-Q2");
  const [isExporting, setIsExporting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [exportType, setExportType] = useState<"excel" | "csv" | "pdf">("excel");
  const { toast } = useToast();

  // Get reports for the selected period
  const { data: reports, isLoading } = useQuery({
    queryKey: ["/api/reports", { period }],
    select: (data: Report[]) => {
      return data.filter(report => report.period === period && report.submittedAt !== null);
    }
  });

  // Get templates
  const { data: templates } = useQuery({
    queryKey: ["/api/templates"],
    select: (data: ReportTemplate[]) => data,
  });

  const handleExport = (type: "excel" | "csv" | "pdf") => {
    setExportType(type);
    setShowConfirmDialog(true);
  };

  const confirmExport = () => {
    setIsExporting(true);
    setShowConfirmDialog(false);

    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Xuất báo cáo thành công",
        description: `Báo cáo kỳ ${period} đã được xuất thành công dưới dạng ${
          exportType === "excel" ? "Excel" : exportType === "csv" ? "CSV" : "PDF"
        }.`,
      });

      // In a real implementation, this would trigger a download
      // or redirect to the generated file
    }, 2000);
  };

  return (
    <MainLayout pageTitle="Xuất báo cáo" backLink="/reports">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Xuất báo cáo</h1>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleExport("excel")}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <FileSpreadsheet className="h-12 w-12 text-emerald-500 mb-3" />
            <h3 className="font-medium text-lg mb-1">Xuất Excel</h3>
            <p className="text-sm text-neutral-500 text-center">
              Xuất báo cáo dưới dạng file Excel (.xlsx)
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleExport("csv")}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <FileDown className="h-12 w-12 text-blue-500 mb-3" />
            <h3 className="font-medium text-lg mb-1">Xuất CSV</h3>
            <p className="text-sm text-neutral-500 text-center">
              Xuất báo cáo dưới dạng file CSV (.csv)
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleExport("pdf")}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <FilePieChart className="h-12 w-12 text-red-500 mb-3" />
            <h3 className="font-medium text-lg mb-1">Xuất PDF</h3>
            <p className="text-sm text-neutral-500 text-center">
              Xuất báo cáo dưới dạng file PDF (.pdf)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Báo cáo có thể xuất</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="space-y-4">
              {templates?.map(template => {
                const templateReports = reports.filter(r => r.templateId === template.id);
                if (templateReports.length === 0) return null;
                
                return (
                  <div key={template.id} className="border rounded-md p-4">
                    <h3 className="font-medium text-lg mb-2">{template.name}</h3>
                    <div className="text-sm text-neutral-500 mb-3">
                      {templateReports.length} báo cáo đã nộp
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {templateReports.map(report => (
                        <div key={report.id} className="bg-neutral-100 px-3 py-1 rounded-full text-xs">
                          {report.companyName}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileSpreadsheet className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600">Không có báo cáo nào cho kỳ này có thể xuất</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export confirmation dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xuất báo cáo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xuất tất cả báo cáo kỳ {period} dưới dạng {
                exportType === "excel" ? "Excel" : exportType === "csv" ? "CSV" : "PDF"
              }?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xuất...
                </>
              ) : (
                "Xuất báo cáo"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}