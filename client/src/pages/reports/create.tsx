import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { ReportForm } from "@/components/reports/report-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { ReportField, ReportTemplate, ReportPeriod } from "@shared/schema";

interface TemplateWithPeriods extends ReportTemplate {
  periods: ReportPeriod[];
}

export default function CreateReport() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [reportId, setReportId] = useState<number | null>(null);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Fetch templates and periods
  const { data: templates, isLoading } = useQuery({
    queryKey: ["/api/templates"],
    select: (data: ReportTemplate[]) => data,
  });

  const { data: templatesWithPeriods, isLoading: isLoadingPeriods } = useQuery({
    queryKey: ["/api/periods"],
    select: (periods: ReportPeriod[]) => {
      if (!templates) return [];
      
      return templates.map(template => {
        const templatePeriods = periods.filter(p => p.templateId === template.id);
        return {
          ...template,
          periods: templatePeriods
        };
      }).filter(t => t.periods.length > 0); // Only show templates with active periods
    },
    enabled: !!templates
  });

  const selectedTemplate = templatesWithPeriods?.find(t => t.id.toString() === selectedTemplateId);
  const selectedPeriod = selectedTemplate?.periods.find(p => p.id.toString() === selectedPeriodId);

  const { data: reports, isLoading: isLoadingReports } = useQuery({
    queryKey: ["/api/reports"],
    enabled: !!selectedTemplate && !!selectedPeriod,
  });

  // When template and period are selected, find the corresponding report
  useEffect(() => {
    if (selectedTemplate && selectedPeriod && reports) {
      const report = reports.find((r: any) => 
        r.templateId === selectedTemplate.id && 
        r.period === selectedPeriod.period
      );
      
      if (report) {
        setReportId(report.id);
      } else {
        setReportId(null);
        toast({
          title: "Không tìm thấy báo cáo",
          description: "Không tìm thấy báo cáo tương ứng cho mẫu và kỳ bạn đã chọn.",
          variant: "destructive",
        });
      }
    }
  }, [selectedTemplate, selectedPeriod, reports, toast]);

  const handleSubmitSuccess = () => {
    toast({
      title: "Báo cáo đã được gửi thành công",
      description: "Cảm ơn bạn đã nộp báo cáo.",
    });
    setLocation("/reports");
  };

  if (isLoading || isLoadingPeriods) {
    return (
      <MainLayout pageTitle="Tạo báo cáo mới" backLink="/reports">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="Tạo báo cáo mới" backLink="/reports">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Chọn mẫu báo cáo và kỳ báo cáo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Mẫu báo cáo</label>
              <Select
                value={selectedTemplateId}
                onValueChange={(value) => {
                  setSelectedTemplateId(value);
                  setSelectedPeriodId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mẫu báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  {templatesWithPeriods?.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Kỳ báo cáo</label>
              <Select
                value={selectedPeriodId}
                onValueChange={setSelectedPeriodId}
                disabled={!selectedTemplateId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn kỳ báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTemplate?.periods.map((period) => (
                    <SelectItem key={period.id} value={period.id.toString()}>
                      {period.period} (Hạn: {new Date(period.dueDate).toLocaleDateString("vi-VN")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {selectedTemplate && selectedPeriod && reportId ? (
        <ReportForm
          reportId={reportId}
          templateId={selectedTemplate.id}
          templateName={selectedTemplate.name}
          fields={selectedTemplate.fields as ReportField[]}
          period={selectedPeriod.period}
          dueDate={selectedPeriod.dueDate}
          onSubmitSuccess={handleSubmitSuccess}
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-lg text-neutral-600">
            {selectedTemplateId 
              ? (selectedPeriodId 
                ? "Đang tải báo cáo..." 
                : "Vui lòng chọn kỳ báo cáo") 
              : "Vui lòng chọn mẫu báo cáo và kỳ báo cáo để bắt đầu"}
          </p>
        </div>
      )}
    </MainLayout>
  );
}
