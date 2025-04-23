import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Plus, FileText, Filter } from "lucide-react";
import { ReportStatusTable } from "@/components/dashboard/report-status-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REPORT_PERIODS } from "@/lib/constants";
import { Link } from "wouter";

export default function Reports() {
  const [period, setPeriod] = useState<string>("2023-Q2");

  return (
    <MainLayout pageTitle="Báo cáo">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Báo cáo của bạn</h1>
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
          
          <Link href="/reports/create">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Tạo báo cáo mới
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Báo cáo của bạn trong {period.includes("Q") ? `Quý ${period.split("Q")[1]}` : ""} {period.split("-")[0] || period}
            </CardTitle>
            <Button variant="ghost" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              Lọc
            </Button>
          </CardHeader>
          <CardContent>
            <ReportStatusTable />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Báo cáo gần đây</h2>
        <Button variant="link" className="flex items-center text-primary">
          Xem tất cả
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/reports/financial">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Báo cáo tài chính</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-neutral-500 mr-2" />
                  <span className="text-sm text-neutral-600">Các báo cáo tài chính</span>
                </div>
                <Button variant="link" size="sm" className="text-secondary">
                  Xem chi tiết
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/reports/create">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Tạo báo cáo mới</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-neutral-500 mr-2" />
                  <span className="text-sm text-neutral-600">Tạo báo cáo kỳ mới</span>
                </div>
                <Button variant="link" size="sm" className="text-secondary">
                  Tạo báo cáo
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/reports/export">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Xuất báo cáo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-neutral-500 mr-2" />
                  <span className="text-sm text-neutral-600">Xuất báo cáo thành Excel/PDF</span>
                </div>
                <Button variant="link" size="sm" className="text-secondary">
                  Xuất báo cáo
                </Button>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </MainLayout>
  );
}
