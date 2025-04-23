import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, PlusCircle } from "lucide-react";
import { COMPANY_LIST, VINATEX_DEPARTMENTS, FIELD_TYPES } from "@/lib/constants";
import { ReportField } from "@shared/schema";

interface ReportTemplateFormProps {
  onSubmitSuccess?: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Tên mẫu báo cáo là bắt buộc"),
  description: z.string().optional(),
  department: z.string().min(1, "Phòng ban quản lý là bắt buộc"),
  periodType: z.enum(["annual", "quarterly", "monthly"], {
    required_error: "Chọn loại kỳ báo cáo",
  }),
  daysBeforeReminder: z.coerce.number().min(1, "Số ngày nhắc trước hạn phải lớn hơn 0").default(7),
  sharePointPath: z.string().optional(),
  requiredUnits: z.array(z.string()).min(1, "Chọn ít nhất một đơn vị thành viên"),
  fields: z.array(
    z.object({
      id: z.string(),
      label: z.string().min(1, "Tên trường là bắt buộc"),
      type: z.enum(["text", "number", "date", "select", "textarea"], {
        required_error: "Chọn loại dữ liệu",
      }),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
      sheet: z.string().optional(),
      excelColumn: z.string().optional(),
    })
  ).min(1, "Thêm ít nhất một trường dữ liệu"),
});

type FormValues = z.infer<typeof formSchema>;

export function ReportTemplateForm({ onSubmitSuccess }: ReportTemplateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      department: "",
      periodType: "quarterly",
      daysBeforeReminder: 7,
      sharePointPath: "",
      requiredUnits: [],
      fields: [
        {
          id: uuidv4(),
          label: "",
          type: "text",
          required: false,
        },
      ],
    },
  });

  const { fields, append, remove } = form.useFieldArray({
    name: "fields",
  });

  const addField = () => {
    append({
      id: uuidv4(),
      label: "",
      type: "text",
      required: false,
    });
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/templates", data);
      
      toast({
        title: "Mẫu báo cáo đã được tạo thành công",
        description: "Mẫu báo cáo đã được lưu và sẵn sàng sử dụng.",
      });
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Failed to create report template:", error);
      toast({
        title: "Lỗi khi tạo mẫu báo cáo",
        description: "Đã xảy ra lỗi khi tạo mẫu báo cáo. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchFieldTypes = form.watch("fields");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tạo mẫu báo cáo mới</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên mẫu báo cáo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên mẫu báo cáo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phòng ban quản lý</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phòng ban" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VINATEX_DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả cho mẫu báo cáo"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="periodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại kỳ báo cáo</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại kỳ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="annual">Theo năm</SelectItem>
                        <SelectItem value="quarterly">Theo quý</SelectItem>
                        <SelectItem value="monthly">Theo tháng</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="daysBeforeReminder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số ngày nhắc trước hạn</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sharePointPath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đường dẫn SharePoint (tùy chọn)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập đường dẫn SharePoint" {...field} />
                    </FormControl>
                    <FormDescription>
                      Đường dẫn thư mục để lưu file báo cáo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div>
              <FormLabel>Đơn vị thành viên bắt buộc nộp báo cáo</FormLabel>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                {COMPANY_LIST.map((company) => (
                  <FormField
                    key={company.code}
                    control={form.control}
                    name="requiredUnits"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={company.code}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(company.code)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, company.code])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== company.code
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {company.name} ({company.code})
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              {form.formState.errors.requiredUnits && (
                <FormMessage>{form.formState.errors.requiredUnits.message}</FormMessage>
              )}
            </div>

            <Separator />

            <div>
              <div className="flex justify-between items-center mb-4">
                <FormLabel>Các trường dữ liệu</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addField}
                >
                  <Plus className="h-4 w-4 mr-2" /> Thêm trường
                </Button>
              </div>

              {form.formState.errors.fields?.root && (
                <FormMessage>{form.formState.errors.fields.root.message}</FormMessage>
              )}

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start border p-4 rounded-md mb-4"
                >
                  <FormField
                    control={form.control}
                    name={`fields.${index}.label`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Tên trường</FormLabel>
                        <FormControl>
                          <Input placeholder="Tên trường" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`fields.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại dữ liệu</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {FIELD_TYPES.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.label}
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
                    name={`fields.${index}.sheet`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sheet Excel</FormLabel>
                        <FormControl>
                          <Input placeholder="Tên sheet" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`fields.${index}.excelColumn`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cột Excel</FormLabel>
                        <FormControl>
                          <Input placeholder="Ví dụ: A, B, C..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end space-x-2">
                    <FormField
                      control={form.control}
                      name={`fields.${index}.required`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-end space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm cursor-pointer">
                            Bắt buộc
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {watchFieldTypes[index]?.type === "select" && (
                    <FormField
                      control={form.control}
                      name={`fields.${index}.options`}
                      render={({ field }) => (
                        <FormItem className="col-span-6 mt-2">
                          <FormLabel>Tùy chọn</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập các tùy chọn, phân cách bằng dấu phẩy"
                              value={field.value?.join(", ") || ""}
                              onChange={(e) => {
                                const options = e.target.value
                                  .split(",")
                                  .map((option) => option.trim())
                                  .filter(Boolean);
                                field.onChange(options);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Nhập danh sách các tùy chọn, phân cách bằng dấu phẩy
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={addField}
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Thêm trường dữ liệu
              </Button>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  "Tạo mẫu báo cáo"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
