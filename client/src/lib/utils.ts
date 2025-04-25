import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("vi-VN");
}

export function formatDatetime(date: string | Date) {
  return new Date(date).toLocaleString("vi-VN");
}

export function formatPeriod(period: string) {
  if (period.includes("Q")) {
    const [year, quarter] = period.split("-Q");
    return `Quý ${quarter}, ${year}`;
  }
  return period;
}

export function getReportStatusText(status: string) {
  switch (status) {
    case "submitted":
      return "Đã nộp";
    case "pending":
      return "Chưa nộp";
    case "late":
      return "Nộp muộn";
    case "overdue":
      return "Quá hạn";
    default:
      return status;
  }
}

export function getReportStatusColor(status: string) {
  switch (status) {
    case "submitted":
      return "success";
    case "pending":
      return "error";
    case "late":
      return "warning";
    case "overdue":
      return "error";
    default:
      return "neutral";
  }
}

export function getRoleText(role: string) {
  switch (role) {
    case "admin":
      return "Quản trị viên";
    case "department":
      return "Quản lý phòng ban";
    case "member_unit":
      return "Đơn vị thành viên";
    default:
      return role;
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
