import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Mail, Database, ShareIcon } from "lucide-react";

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Cài đặt đã được lưu",
        description: "Cài đặt hệ thống đã được cập nhật thành công.",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Lỗi khi lưu cài đặt",
        description: "Đã xảy ra lỗi khi lưu cài đặt. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout pageTitle="Thiết lập hệ thống">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Thiết lập hệ thống</h1>
        <Button className="flex items-center" onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Lưu cài đặt
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">Cài đặt chung</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="storage">Lưu trữ</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt chung</CardTitle>
              <CardDescription>
                Cấu hình các thiết lập chung của hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="system-name">Tên hệ thống</Label>
                  <Input id="system-name" defaultValue="Vinatex Report Portal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email quản trị</Label>
                  <Input id="admin-email" defaultValue="admin@vinatex.com.vn" />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="site-url">URL hệ thống</Label>
                <Input id="site-url" defaultValue="https://reports.vinatex.com.vn" />
                <p className="text-sm text-muted-foreground mt-1">
                  URL này sẽ được sử dụng trong các email và thông báo
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block mb-1">Bảo trì hệ thống</Label>
                    <p className="text-sm text-muted-foreground">
                      Khi bật, hệ thống sẽ ở chế độ bảo trì và người dùng không thể đăng nhập
                    </p>
                  </div>
                  <Switch id="maintenance-mode" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block mb-1">Chế độ gỡ lỗi</Label>
                    <p className="text-sm text-muted-foreground">
                      Ghi lại các thông tin chi tiết để gỡ lỗi hệ thống
                    </p>
                  </div>
                  <Switch id="debug-mode" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt Email</CardTitle>
              <CardDescription>
                Cấu hình máy chủ email để gửi thông báo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Máy chủ SMTP</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">SMTP Host</Label>
                  <Input id="smtp-host" defaultValue="smtp.vinatex.com.vn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input id="smtp-port" defaultValue="587" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smtp-user">SMTP Username</Label>
                  <Input id="smtp-user" defaultValue="notifications@vinatex.com.vn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">SMTP Password</Label>
                  <Input type="password" id="smtp-password" defaultValue="********" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-email">Email người gửi</Label>
                <Input id="from-email" defaultValue="reports@vinatex.com.vn" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="block mb-1">Bật gửi email thông báo</Label>
                  <p className="text-sm text-muted-foreground">
                    Gửi email thông báo cho người dùng về báo cáo sắp đến hạn
                  </p>
                </div>
                <Switch id="enable-emails" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="ml-auto">
                Kiểm tra kết nối
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt lưu trữ</CardTitle>
              <CardDescription>
                Cấu hình vị trí lưu trữ báo cáo và tệp đính kèm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <ShareIcon className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">SharePoint</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sharepoint-url">URL SharePoint</Label>
                <Input id="sharepoint-url" defaultValue="https://vinatex.sharepoint.com/sites/reports" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sharepoint-user">Tên người dùng</Label>
                  <Input id="sharepoint-user" defaultValue="reports@vinatex.com.vn" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sharepoint-password">Mật khẩu</Label>
                  <Input type="password" id="sharepoint-password" defaultValue="********" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reports-folder">Thư mục báo cáo</Label>
                <Input id="reports-folder" defaultValue="/Documents/Reports" />
                <p className="text-sm text-muted-foreground mt-1">
                  Đường dẫn thư mục trên SharePoint để lưu báo cáo
                </p>
              </div>

              <Separator />

              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Lưu trữ cơ sở dữ liệu</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-schedule">Lịch sao lưu dữ liệu</Label>
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="daily" name="backup-schedule" defaultChecked />
                    <Label htmlFor="daily">Hàng ngày</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="weekly" name="backup-schedule" />
                    <Label htmlFor="weekly">Hàng tuần</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="monthly" name="backup-schedule" />
                    <Label htmlFor="monthly">Hàng tháng</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="never" name="backup-schedule" />
                    <Label htmlFor="never">Không bao giờ</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="ml-auto">
                Kiểm tra kết nối
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt thông báo</CardTitle>
              <CardDescription>
                Cấu hình các cài đặt thông báo trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block mb-1">Thông báo nộp báo cáo</Label>
                    <p className="text-sm text-muted-foreground">
                      Gửi thông báo khi có báo cáo mới được nộp
                    </p>
                  </div>
                  <Switch id="submission-notification" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block mb-1">Thông báo nộp muộn</Label>
                    <p className="text-sm text-muted-foreground">
                      Gửi thông báo khi có báo cáo được nộp muộn
                    </p>
                  </div>
                  <Switch id="late-notification" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block mb-1">Thông báo nhắc nhở</Label>
                    <p className="text-sm text-muted-foreground">
                      Gửi thông báo nhắc nhở khi sắp đến hạn nộp báo cáo
                    </p>
                  </div>
                  <Switch id="reminder-notification" defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="reminder-days">Số ngày nhắc trước hạn (mặc định)</Label>
                <Input
                  id="reminder-days"
                  type="number"
                  min="1"
                  max="30"
                  defaultValue="7"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Số ngày gửi thông báo nhắc nhở trước khi đến hạn nộp báo cáo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-email-template">Mẫu email thông báo</Label>
                <textarea
                  id="notification-email-template"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={`Kính gửi [Tên đơn vị],

Hệ thống báo cáo Vinatex thông báo kỳ báo cáo [Tên báo cáo] sẽ đến hạn vào ngày [Ngày đến hạn].

Vui lòng truy cập hệ thống và nộp báo cáo đúng thời hạn.

Trân trọng,
Ban quản trị Vinatex`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
