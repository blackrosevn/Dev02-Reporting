import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, CheckCircle, Clock, FileText } from "lucide-react";

export interface StatsCardProps {
  title: string;
  value: number;
  percentChange?: number;
  percentValue?: number;
  status?: "success" | "warning" | "error";
  type?: "total" | "submitted" | "pending" | "late";
  className?: string;
}

export function StatsCard({
  title,
  value,
  percentChange,
  percentValue,
  status = "success",
  type = "total",
  className,
}: StatsCardProps) {
  const statusColors = {
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
  };

  const statusBgColors = {
    success: "bg-success bg-opacity-10",
    warning: "bg-warning bg-opacity-10",
    error: "bg-error bg-opacity-10",
  };

  const icons = {
    total: FileText,
    submitted: CheckCircle,
    pending: Clock,
    late: Clock,
  };

  const IconComponent = icons[type];

  return (
    <Card className={cn("border border-neutral-100", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            <p
              className={cn(
                "text-2xl font-bold mt-1",
                type === "total" ? "text-neutral-800" : statusColors[status]
              )}
            >
              {value}
            </p>
          </div>
          <div
            className={cn(
              "h-12 w-12 rounded-lg flex items-center justify-center",
              type === "total"
                ? "bg-primary bg-opacity-10 text-primary"
                : `${statusBgColors[status]} ${statusColors[status]}`
            )}
          >
            <IconComponent className="h-6 w-6" />
          </div>
        </div>
        {(percentChange !== undefined || percentValue !== undefined) && (
          <div className="mt-4 flex items-center">
            {percentChange !== undefined && (
              <span
                className={cn(
                  "text-xs font-medium flex items-center",
                  percentChange >= 0 ? "text-success" : "text-error"
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={
                      percentChange >= 0
                        ? "M5 10l7-7m0 0l7 7m-7-7v18"
                        : "M19 14l-7 7m0 0l-7-7m7 7V3"
                    }
                  />
                </svg>
                {Math.abs(percentChange)}%
              </span>
            )}
            {percentChange !== undefined && (
              <span className="text-xs text-neutral-500 ml-2">
                so với kỳ trước
              </span>
            )}
            {percentValue !== undefined && (
              <>
                <div className="w-full bg-neutral-100 rounded-full h-2">
                  <div
                    className={cn(
                      "rounded-full h-2",
                      type === "submitted"
                        ? "bg-success"
                        : type === "pending"
                        ? "bg-error"
                        : "bg-warning"
                    )}
                    style={{ width: `${percentValue}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-neutral-600 ml-2">
                  {percentValue}%
                </span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
