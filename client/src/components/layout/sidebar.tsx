import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { UserNav } from "@/components/layout/user-nav";
import { Link, useLocation } from "wouter";
import {
  Home,
  BarChart,
  FileText,
  Upload,
  Download,
  Sliders,
  Users,
  Settings,
} from "lucide-react";
import { UserRole } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItemClass = (active: boolean) =>
    cn(
      "flex items-center text-sm py-2 px-3 rounded-md font-medium",
      active
        ? "bg-secondary bg-opacity-15 text-primary border-l-3 border-secondary"
        : "text-neutral-600 hover:text-primary hover:bg-neutral-50"
    );

  return (
    <div
      className={cn(
        "bg-white border-r border-neutral-100 w-64 flex-shrink-0 hidden md:flex md:flex-col h-screen",
        className
      )}
    >
      <div className="flex h-16 items-center justify-center border-b border-neutral-100 px-4">
        <Logo className="h-10" />
      </div>

      <div className="flex-1 overflow-auto px-3 py-4">
        <div className="mb-2">
          <p className="px-3 mb-2 text-xs font-medium uppercase text-neutral-400">
            Tổng quan
          </p>
          <Link href="/dashboard">
            <a className={navItemClass(isActive("/dashboard"))}>
              <Home className="mr-3 h-5 w-5" />
              Trang chủ
            </a>
          </Link>
          <Link href="/reports">
            <a className={navItemClass(isActive("/reports"))}>
              <BarChart className="mr-3 h-5 w-5" />
              Báo cáo phân tích
            </a>
          </Link>
        </div>

        <div className="mb-2">
          <p className="px-3 mb-2 text-xs font-medium uppercase text-neutral-400">
            Quản lý báo cáo
          </p>
          <Link href="/reports/financial">
            <a className={navItemClass(isActive("/reports/financial"))}>
              <FileText className="mr-3 h-5 w-5" />
              Báo cáo tài chính
            </a>
          </Link>
          <Link href="/reports/create">
            <a className={navItemClass(isActive("/reports/create"))}>
              <Upload className="mr-3 h-5 w-5" />
              Tải lên báo cáo
            </a>
          </Link>
          <Link href="/reports/export">
            <a className={navItemClass(isActive("/reports/export"))}>
              <Download className="mr-3 h-5 w-5" />
              Xuất báo cáo
            </a>
          </Link>
        </div>

        {user?.role === UserRole.ADMIN && (
          <div className="mb-2">
            <p className="px-3 mb-2 text-xs font-medium uppercase text-neutral-400">
              Cấu hình
            </p>
            <Link href="/reports/templates">
              <a className={navItemClass(isActive("/reports/templates"))}>
                <Sliders className="mr-3 h-5 w-5" />
                Mẫu báo cáo
              </a>
            </Link>
            <Link href="/admin/users">
              <a className={navItemClass(isActive("/admin/users"))}>
                <Users className="mr-3 h-5 w-5" />
                Quản lý người dùng
              </a>
            </Link>
            <Link href="/admin/settings">
              <a className={navItemClass(isActive("/admin/settings"))}>
                <Settings className="mr-3 h-5 w-5" />
                Thiết lập hệ thống
              </a>
            </Link>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-100 px-4 py-3">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-neutral-800">{user?.name}</p>
            <p className="text-xs text-neutral-500">
              {user?.role === UserRole.ADMIN
                ? "Quản trị viên"
                : user?.role === UserRole.DEPARTMENT
                ? "Quản lý phòng ban"
                : "Đơn vị thành viên"}
            </p>
          </div>
          <div className="ml-auto">
            <UserNav />
          </div>
        </div>
      </div>
    </div>
  );
}

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
