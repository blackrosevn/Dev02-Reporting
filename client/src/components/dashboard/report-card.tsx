import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, Users } from "lucide-react";
import { Link } from "wouter";

interface ReportCardProps {
  report: {
    id: number;
    name: string;
    description: string;
    period: string;
    dueDate: string;
    totalUnits: number;
    submittedUnits: number;
    department: string;
  };
}

export function ReportCard({ report }: ReportCardProps) {
  const { id, name, description, period, dueDate, totalUnits, submittedUnits, department } = report;
  
  const formattedDueDate = new Date(dueDate).toLocaleDateString("vi-VN");
  const periodDisplay = period.includes("Q") 
    ? `Quý ${period.split("Q")[1]}, ${period.split("-")[0]}`
    : period;
  
  const getDepartmentIcon = (dept: string) => {
    switch (dept) {
      case "TCKT":
        return <FileText className="h-4 w-4 mr-1" />;
      case "Ban NNLĐ":
        return <Users className="h-4 w-4 mr-1" />;
      default:
        return <FileText className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-neutral-100 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="bg-info bg-opacity-10 text-info border-0">
            Hạn {formattedDueDate}
          </Badge>
          <span className="text-xs font-medium text-neutral-500">
            {totalUnits} đơn vị
          </span>
        </div>
        <h3 className="text-lg font-semibold text-neutral-800 mb-1">{name}</h3>
        <p className="text-sm text-neutral-600 mb-4">{description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center text-neutral-500">
            <Calendar className="h-4 w-4 mr-1" />
            {periodDisplay}
          </span>
          <span className="flex items-center text-neutral-500">
            {getDepartmentIcon(department)}
            {department}
          </span>
        </div>
      </CardContent>
      <CardFooter className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex justify-between">
        <div className="text-sm">
          <span className="text-neutral-500">Đã nộp:</span>
          <span className="font-medium text-neutral-900">
            {submittedUnits}/{totalUnits}
          </span>
        </div>
        <Link href={`/reports/${id}`}>
          <Button variant="link" className="text-sm font-medium text-secondary hover:text-secondary-dark p-0">
            Xem chi tiết
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
