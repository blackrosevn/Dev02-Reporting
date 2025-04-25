import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ReportTemplate, ReportPeriod } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Plus, CalendarIcon, CheckCircle, AlertCircle } from "lucide-react";
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
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, addMonths, addQuarters, addYears } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formatDate, formatPeriod } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Form schema for creating a new report period
const formSchema = z.object({
  templateId: z.coerce.number({
    required_error: "Vui lòng chọn mẫu báo cáo",
    invalid_type_error: "Vui lòng chọn mẫu báo cáo",
  }),
  period: z.string({
    required_error: "Vui lòng nhập kỳ báo cáo",
  }),
  dueDate: z.date({
    required_error: "Vui lòng chọn ngày hạn nộp",
  }),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReportPeriodsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch report templates
  const { data: templates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["/api/templates"],
    select: (data: ReportTemplate[]) => 
      data.filter(template => template.isActive)
  });

  // Fetch report periods
  const { data: periods, isLoading: isLoadingPeriods } = useQuery({
    queryKey: ["/api/periods"],
    select: (data: ReportPeriod[]) => data
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: 0,
      period: "",
      isActive: true,
    },
  });

  const selectedTemplateId = form.watch("templateId");
  const selectedTemplate = templates?.find(t => t.id === Number(selectedTemplateId));

  // Generate period suggestion based on template type
  const generatePeriodSuggestion = (templateType: string) => {
    const now = new Date();
    const year = now.getFullYear();
    
    switch (templateType) {
      case "annual":
        return `${year}`;
      case "quarterly":
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `Q${quarter}/${year}`;
      case "monthly":
        const month = now.getMonth() + 1;
        return `${month < 10 ? '0' + month : month}/${year}`;
      default:
        return "";
    }
  };

  // Generate due date suggestion based on template type
  const generateDueDateSuggestion = (templateType: string) => {
    const now = new Date();
    
    switch (templateType) {
      case "annual":
        return addDays(addYears(now, 1), 15);
      case "quarterly":
        return addDays(addQuarters(now, 1), 15);
      case "monthly":
        return addDays(addMonths(now, 1), 10);
      default:
        return addDays(now, 30);
    }
  };

  // Handle template selection
  const handleTemplateChange = (value: string) => {
    const templateId = parseInt(value);
    form.setValue("templateId", templateId);
    
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      form.setValue("period", generatePeriodSuggestion(template.periodType));
      form.setValue("dueDate", generateDueDateSuggestion(template.periodType));
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await apiRequest("POST", "/api/periods", values);
      
      toast({
        title: "Kỳ báo cáo đã được tạo",
        description: "Kỳ báo cáo mới đã được tạo thành công.",
      });
      
      form.reset({
        templateId: 0,
        period: "",
        isActive: true,
      });
      
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/periods"] });
    } catch (error) {
      console.error("Error creating report period:", error);
      toast({
        title: "Lỗi khi tạo kỳ báo cáo",
        description: "Đã xảy ra lỗi khi tạo kỳ báo cáo. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  // Group periods by template
  const periodsByTemplate = periods?.reduce((acc, period) => {
    if (!acc[period.templateId]) {
      acc[period.templateId] = [];
    }
    acc[period.templateId].push(period);
    return acc;
  }, {} as Record<number, ReportPeriod[]>) || {};

  const getPeriodStatus = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    return now > due ? "past" : "upcoming";
  };

  return (
    <MainLayout pageTitle="Quản lý kỳ báo cáo" backLink="/admin/settings">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý kỳ báo cáo</h1>
          <p className="text-muted-foreground">Tạo và quản lý các kỳ báo cáo cho từng mẫu báo cáo</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo kỳ báo cáo mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tạo kỳ báo cáo mới</DialogTitle>
              <DialogDescription>
                Tạo kỳ báo cáo cho mẫu báo cáo đã có. Kỳ báo cáo này sẽ tự động tạo báo cáo cho các đơn vị thành viên liên quan.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="templateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mẫu báo cáo</FormLabel>
                      <Select
                        onValueChange={handleTemplateChange}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn mẫu báo cáo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templates?.map((template) => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kỳ báo cáo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={selectedTemplate ? `Ví dụ: ${generatePeriodSuggestion(selectedTemplate.periodType)}` : "Nhập kỳ báo cáo"}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {selectedTemplate?.periodType === "quarterly" && "Định dạng: Qx/YYYY (Q1/2025)"}
                        {selectedTemplate?.periodType === "monthly" && "Định dạng: MM/YYYY (04/2025)"}
                        {selectedTemplate?.periodType === "annual" && "Định dạng: YYYY (2025)"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Ngày hạn nộp</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Chọn ngày</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Ngày cuối cùng để các đơn vị thành viên nộp báo cáo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit">Tạo kỳ báo cáo</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingTemplates || isLoadingPeriods ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : templates?.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">Chưa có mẫu báo cáo nào. Vui lòng tạo mẫu báo cáo trước.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {templates?.map(template => (
            <Card key={template.id} className="mb-6">
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {periodsByTemplate[template.id]?.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kỳ báo cáo</TableHead>
                        <TableHead>Ngày hạn nộp</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hoạt động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {periodsByTemplate[template.id]
                        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                        .map(period => (
                          <TableRow key={period.id}>
                            <TableCell className="font-medium">{formatPeriod(period.period)}</TableCell>
                            <TableCell>{formatDate(period.dueDate)}</TableCell>
                            <TableCell>
                              {getPeriodStatus(period.dueDate) === 'past' ? (
                                <Badge variant="outline" className="bg-neutral-100 text-neutral-700">
                                  <AlertCircle className="mr-1 h-3 w-3" /> Đã hết hạn
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  <CheckCircle className="mr-1 h-3 w-3" /> Đang diễn ra
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">Xem báo cáo</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">Chưa có kỳ báo cáo nào cho mẫu này</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </MainLayout>
  );
}