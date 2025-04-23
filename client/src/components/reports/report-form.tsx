import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReportField } from "@shared/schema";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, Upload } from "lucide-react";

interface ReportFormProps {
  reportId: number;
  templateId: number;
  templateName: string;
  fields: ReportField[];
  period: string;
  dueDate: string;
  onSubmitSuccess?: () => void;
}

export function ReportForm({
  reportId,
  templateId,
  templateName,
  fields,
  period,
  dueDate,
  onSubmitSuccess,
}: ReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Create a dynamic form schema based on the fields
  const formSchema = z.object(
    fields.reduce((schema, field) => {
      if (field.required) {
        switch (field.type) {
          case "number":
            schema[field.id] = z.coerce.number({
              required_error: `${field.label} là bắt buộc`,
              invalid_type_error: `${field.label} phải là số`,
            });
            break;
          case "date":
            schema[field.id] = z.string({
              required_error: `${field.label} là bắt buộc`,
            }).regex(/^\d{4}-\d{2}-\d{2}$/, {
              message: `${field.label} phải có định dạng YYYY-MM-DD`,
            });
            break;
          default:
            schema[field.id] = z.string({
              required_error: `${field.label} là bắt buộc`,
            }).min(1, `${field.label} là bắt buộc`);
        }
      } else {
        switch (field.type) {
          case "number":
            schema[field.id] = z.coerce.number().optional();
            break;
          default:
            schema[field.id] = z.string().optional();
        }
      }
      return schema;
    }, {} as Record<string, z.ZodType>)
  );

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: fields.reduce((values, field) => {
      values[field.id] = "";
      return values;
    }, {} as Record<string, any>),
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", `/api/reports/${reportId}/submit`, {
        data,
      });
      
      toast({
        title: "Báo cáo đã được gửi thành công",
        description: "Cảm ơn bạn đã nộp báo cáo đúng hạn.",
      });
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Failed to submit report:", error);
      toast({
        title: "Lỗi khi gửi báo cáo",
        description: "Đã xảy ra lỗi khi gửi báo cáo. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // In a real implementation, you would upload the file to the server
      // and parse it to populate the form fields
      
      // Create a FormData object
      const formData = new FormData();
      formData.append("file", file);
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Tệp đã được tải lên",
        description: "Dữ liệu từ tệp Excel đã được điền vào form.",
      });
      
      // For this example, we're just going to populate the form with mock data
      const mockData = fields.reduce((data, field) => {
        if (field.type === "number") {
          data[field.id] = Math.floor(Math.random() * 1000);
        } else if (field.type === "date") {
          const date = new Date();
          data[field.id] = date.toISOString().split("T")[0];
        } else if (field.type === "select" && field.options?.length) {
          data[field.id] = field.options[0];
        } else {
          data[field.id] = `Sample ${field.label}`;
        }
        return data;
      }, {} as Record<string, any>);
      
      form.reset(mockData);
    } catch (error) {
      console.error("Failed to upload Excel file:", error);
      toast({
        title: "Lỗi khi tải lên tệp Excel",
        description: "Đã xảy ra lỗi khi tải lên tệp. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      event.target.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{templateName}</CardTitle>
        <div className="flex items-center text-sm text-muted-foreground">
          <span>Kỳ: {period}</span>
          <span className="mx-2">•</span>
          <span>Hạn nộp: {new Date(dueDate).toLocaleDateString("vi-VN")}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Nhập dữ liệu báo cáo</h3>
            <div className="relative">
              <Input
                type="file"
                accept=".xlsx,.xls"
                id="excel-upload"
                className="hidden"
                onChange={handleUploadExcel}
                disabled={isUploading}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("excel-upload")?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Tải lên từ Excel
                  </>
                )}
              </Button>
            </div>
          </div>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lưu ý</AlertTitle>
            <AlertDescription>
              Vui lòng nhập đầy đủ thông tin cho tất cả các trường bắt buộc. Bạn có thể nhập trực tiếp hoặc tải lên từ file Excel.
            </AlertDescription>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {fields.reduce((sections, field, index) => {
                const sheet = field.sheet || "Chung";
                if (!sections[sheet]) {
                  sections[sheet] = [];
                }
                sections[sheet].push(
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={field.id}
                    render={({ field: formField }) => (
                      <FormItem>
                        <FormLabel>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </FormLabel>
                        <FormControl>
                          {field.type === "textarea" ? (
                            <Textarea
                              placeholder={`Nhập ${field.label.toLowerCase()}`}
                              className="resize-none"
                              {...formField}
                            />
                          ) : field.type === "select" ? (
                            <Select
                              value={formField.value}
                              onValueChange={formField.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={`Chọn ${field.label.toLowerCase()}`} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.options?.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                              placeholder={`Nhập ${field.label.toLowerCase()}`}
                              {...formField}
                            />
                          )}
                        </FormControl>
                        {field.excelColumn && (
                          <FormDescription>
                            Cột Excel: {field.excelColumn}
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
                return sections;
              }, {} as Record<string, JSX.Element[]>)}
              
              {Object.entries(
                fields.reduce((sections, field) => {
                  const sheet = field.sheet || "Chung";
                  if (!sections[sheet]) {
                    sections[sheet] = [];
                  }
                  sections[sheet].push(field);
                  return sections;
                }, {} as Record<string, ReportField[]>)
              ).map(([sheet, _], index, arr) => (
                <div key={sheet}>
                  <h3 className="text-lg font-semibold mb-4">{sheet}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sections[sheet]}
                  </div>
                  {index < arr.length - 1 && <Separator className="my-6" />}
                </div>
              ))}
              
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Lưu nháp
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi báo cáo"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
