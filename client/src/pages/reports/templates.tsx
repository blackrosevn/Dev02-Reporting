import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { ReportTemplateForm } from "@/components/reports/report-template-form";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Plus, FileText, Edit, Trash2, Copy } from "lucide-react";
import { ReportTemplate, ReportPeriod } from "@shared/schema";

export default function ReportTemplates() {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ["/api/templates"],
    select: (data: ReportTemplate[]) => data,
  });

  const { data: periods } = useQuery({
    queryKey: ["/api/periods"],
    select: (data: ReportPeriod[]) => data,
  });

  const handleCreateSuccess = () => {
    setIsCreating(false);
    refetch();
    toast({
      title: "Mẫu báo cáo được tạo thành công",
      description: "Mẫu báo cáo mới đã được tạo và sẵn sàng sử dụng.",
    });
  };

  const getTemplatePeriodsCount = (templateId: number) => {
    if (!periods) return 0;
    return periods.filter(p => p.templateId === templateId).length;
  };

  return (
    <MainLayout pageTitle="Quản lý mẫu báo cáo">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mẫu báo cáo</h1>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Tạo mẫu báo cáo mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo mẫu báo cáo mới</DialogTitle>
              <DialogDescription>
                Điền thông tin để tạo mẫu báo cáo mới cho các đơn vị thành viên
              </DialogDescription>
            </DialogHeader>
            <ReportTemplateForm onSubmitSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Đang sử dụng</TabsTrigger>
          <TabsTrigger value="all">Tất cả mẫu</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <p>Đang tải...</p>
            ) : (
              templates
                ?.filter(template => template.isActive)
                .map(template => (
                  <Card key={template.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-0">
                          {template.department}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="mt-2">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <FileText className="h-4 w-4 mr-2 text-neutral-500" />
                          <span>{template.fields.length} trường dữ liệu</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-neutral-500" />
                          <span>
                            {getTemplatePeriodsCount(template.id)} kỳ báo cáo
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button variant="outline" className="w-full">
                        Xem chi tiết
                      </Button>
                    </CardFooter>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách mẫu báo cáo</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên mẫu báo cáo</TableHead>
                    <TableHead>Phòng ban</TableHead>
                    <TableHead>Loại kỳ</TableHead>
                    <TableHead>Số trường</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Đang tải...
                      </TableCell>
                    </TableRow>
                  ) : (
                    templates?.map(template => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{template.department}</TableCell>
                        <TableCell>
                          {template.periodType === "annual"
                            ? "Theo năm"
                            : template.periodType === "quarterly"
                            ? "Theo quý"
                            : "Theo tháng"}
                        </TableCell>
                        <TableCell>{template.fields.length}</TableCell>
                        <TableCell>
                          {template.isActive ? (
                            <Badge variant="outline" className="bg-success/10 text-success border-0">
                              Đang sử dụng
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-neutral-200 text-neutral-700 border-0">
                              Không sử dụng
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              Sửa
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
