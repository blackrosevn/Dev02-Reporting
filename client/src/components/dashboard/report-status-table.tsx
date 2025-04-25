import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DownloadCloud, 
  FileDown, 
  FilterX, 
  Search 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { ReportStatus } from "@shared/schema";

interface Report {
  id: number;
  companyName: string;
  companyCode: string;
  period: string;
  templateId: number;
  dueDate: string;
  submittedAt: string | null;
  status: ReportStatus;
}

export function ReportStatusTable() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const reportsPerPage = 5;

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await apiRequest("GET", "/api/reports");
        const data = await res.json();
        setReports(data);
        setTotalPages(Math.ceil(data.length / reportsPerPage));
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.SUBMITTED:
        return (
          <Badge variant="outline" className="bg-success bg-opacity-10 text-success border-0">
            Đã nộp
          </Badge>
        );
      case ReportStatus.LATE:
        return (
          <Badge variant="outline" className="bg-warning bg-opacity-10 text-warning border-0">
            Nộp muộn
          </Badge>
        );
      case ReportStatus.PENDING:
      case ReportStatus.OVERDUE:
      default:
        return (
          <Badge variant="outline" className="bg-error bg-opacity-10 text-error border-0">
            Chưa nộp
          </Badge>
        );
    }
  };

  const getReportType = (period: string) => {
    if (period.includes("Q")) {
      return `Báo cáo tài chính Quý ${period.split("Q")[1]}`;
    }
    return "Báo cáo tài chính";
  };

  const getReportYear = (period: string) => {
    if (period.includes("-")) {
      return period.split("-")[0];
    }
    return period;
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.companyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.period.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-neutral-800">Tình trạng nộp báo cáo</h2>
        <div className="flex space-x-3 mt-3 sm:mt-0">
          <Button variant="outline" className="flex items-center text-primary bg-primary/5">
            <FileDown className="h-4 w-4 mr-1" />
            Xuất báo cáo
          </Button>
          <Button className="flex items-center">
            <span className="sr-only sm:not-sr-only sm:mr-1">Thêm mẫu báo cáo</span>
            <span className="sm:hidden">+</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 p-4">
          <div className="flex items-center flex-wrap gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value={ReportStatus.SUBMITTED}>Đã nộp</SelectItem>
                <SelectItem value={ReportStatus.PENDING}>Chưa nộp</SelectItem>
                <SelectItem value={ReportStatus.LATE}>Nộp muộn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 sm:mt-0 flex items-center">
            <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-primary">
              <FilterX className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-primary">
              <DownloadCloud className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Đơn vị thành viên
              </TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Loại báo cáo
              </TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Hạn nộp
              </TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Ngày nộp
              </TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Trạng thái
              </TableHead>
              <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-neutral-100">
            {paginatedReports.length > 0 ? (
              paginatedReports.map((report) => (
                <TableRow key={report.id} className="hover:bg-neutral-50">
                  <TableCell className="py-4">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 rounded-full mr-4">
                        <AvatarFallback className="bg-primary text-white">
                          {report.companyName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {report.companyName}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {report.companyCode}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-neutral-900">
                      {getReportType(report.period)}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {getReportYear(report.period)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-neutral-900">
                    {new Date(report.dueDate).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-900">
                    {report.submittedAt
                      ? new Date(report.submittedAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    <Button variant="link" className="text-secondary hover:text-secondary-dark mr-3">
                      {report.status === ReportStatus.PENDING ? "Nhắc nhở" : "Xem"}
                    </Button>
                    <Button variant="link" className="text-secondary hover:text-secondary-dark">
                      {report.status === ReportStatus.PENDING ? "Chi tiết" : "Tải xuống"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-neutral-500">
                  Không tìm thấy báo cáo nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="px-4 py-3 flex items-center justify-between border-t border-neutral-100">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-700">
                Hiển thị{" "}
                <span className="font-medium">
                  {(currentPage - 1) * reportsPerPage + 1}
                </span>{" "}
                đến{" "}
                <span className="font-medium">
                  {Math.min(currentPage * reportsPerPage, filteredReports.length)}
                </span>{" "}
                của <span className="font-medium">{filteredReports.length}</span> kết quả
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-l-md"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">Trước</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <Button
                      key={i}
                      variant={pageNumber === currentPage ? "secondary" : "outline"}
                      size="sm"
                      className="border-x-0"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <Button variant="outline" size="sm" className="border-x-0" disabled>
                    ...
                  </Button>
                )}
                {totalPages > 5 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-x-0"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-r-md"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span className="sr-only">Sau</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
