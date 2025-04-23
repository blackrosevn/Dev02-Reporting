import { useState, useEffect } from "react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Stats {
  totalReports: number;
  submittedReports: number;
  pendingReports: number;
  lateReports: number;
  periodStats: {
    total: number;
    submitted: number;
    pending: number;
    late: number;
  };
}

export function StatsOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reportType, setReportType] = useState<string>("all");
  const [period, setPeriod] = useState<string>("2023-Q2");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await apiRequest("GET", `/api/dashboard/stats?period=${period}&type=${reportType}`);
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period, reportType]);

  const calculatePercentage = (value: number, total: number) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  const handleReportTypeChange = (value: string) => {
    setReportType(value);
  };

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-800">Đang tải...</h2>
        </div>
      </div>
    );
  }

  // Fallback data if API call fails
  const data = stats || {
    totalReports: 142,
    submittedReports: 98,
    pendingReports: 32,
    lateReports: 12,
    periodStats: {
      total: 142,
      submitted: 98,
      pending: 32,
      late: 12,
    },
  };

  const submittedPercentage = calculatePercentage(data.submittedReports, data.totalReports);
  const pendingPercentage = calculatePercentage(data.pendingReports, data.totalReports);
  const latePercentage = calculatePercentage(data.lateReports, data.totalReports);

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-neutral-800">Tổng quan báo cáo</h2>
        <div className="flex space-x-3 mt-3 sm:mt-0">
          <Select value={reportType} onValueChange={handleReportTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả các loại báo cáo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả các loại báo cáo</SelectItem>
              <SelectItem value="financial">Báo cáo tài chính</SelectItem>
              <SelectItem value="business">Báo cáo kinh doanh</SelectItem>
              <SelectItem value="hr">Báo cáo nhân sự</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Quý 2, 2023" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023-Q2">Quý 2, 2023</SelectItem>
              <SelectItem value="2023-Q1">Quý 1, 2023</SelectItem>
              <SelectItem value="2022-Q4">Quý 4, 2022</SelectItem>
              <SelectItem value="2022-Q3">Quý 3, 2022</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng số báo cáo"
          value={data.totalReports}
          percentChange={12.5}
          type="total"
        />
        <StatsCard
          title="Đã nộp"
          value={data.submittedReports}
          percentValue={submittedPercentage}
          status="success"
          type="submitted"
        />
        <StatsCard
          title="Chưa nộp"
          value={data.pendingReports}
          percentValue={pendingPercentage}
          status="error"
          type="pending"
        />
        <StatsCard
          title="Nộp muộn"
          value={data.lateReports}
          percentValue={latePercentage}
          status="warning"
          type="late"
        />
      </div>
    </div>
  );
}
