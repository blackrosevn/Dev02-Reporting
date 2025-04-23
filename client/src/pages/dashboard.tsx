import { MainLayout } from "@/components/layout/main-layout";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { ReportStatusTable } from "@/components/dashboard/report-status-table";
import { UpcomingReports } from "@/components/dashboard/upcoming-reports";

export default function Dashboard() {
  return (
    <MainLayout pageTitle="Tổng quan hệ thống">
      <StatsOverview />
      <ReportStatusTable />
      <UpcomingReports />
    </MainLayout>
  );
}
