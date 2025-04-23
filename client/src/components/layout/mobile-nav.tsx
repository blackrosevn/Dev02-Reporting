import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { UserNav } from "@/components/layout/user-nav";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  Bell,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRole } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export function MobileNav() {
  const [open, setOpen] = useState(false);
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

  const closeMobileMenu = () => {
    setOpen(false);
  };

  return (
    <>
      <div className="md:hidden bg-white w-full border-b border-neutral-100 fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-primary">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SheetHeader className="border-b border-neutral-100 px-4 py-3 flex items-center justify-between">
                  <Logo className="h-8" />
                  <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </SheetHeader>
                <div className="py-4 px-3">
                  <div className="mb-2">
                    <p className="px-3 mb-2 text-xs font-medium uppercase text-neutral-400">
                      Tổng quan
                    </p>
                    <Link href="/dashboard">
                      <a className={navItemClass(isActive("/dashboard"))} onClick={closeMobileMenu}>
                        <Home className="mr-3 h-5 w-5" />
                        Trang chủ
                      </a>
                    </Link>
                    <Link href="/reports">
                      <a className={navItemClass(isActive("/reports"))} onClick={closeMobileMenu}>
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
                      <a className={navItemClass(isActive("/reports/financial"))} onClick={closeMobileMenu}>
                        <FileText className="mr-3 h-5 w-5" />
                        Báo cáo tài chính
                      </a>
                    </Link>
                    <Link href="/reports/create">
                      <a className={navItemClass(isActive("/reports/create"))} onClick={closeMobileMenu}>
                        <Upload className="mr-3 h-5 w-5" />
                        Tải lên báo cáo
                      </a>
                    </Link>
                    <Link href="/reports/export">
                      <a className={navItemClass(isActive("/reports/export"))} onClick={closeMobileMenu}>
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
                        <a className={navItemClass(isActive("/reports/templates"))} onClick={closeMobileMenu}>
                          <Sliders className="mr-3 h-5 w-5" />
                          Mẫu báo cáo
                        </a>
                      </Link>
                      <Link href="/admin/users">
                        <a className={navItemClass(isActive("/admin/users"))} onClick={closeMobileMenu}>
                          <Users className="mr-3 h-5 w-5" />
                          Quản lý người dùng
                        </a>
                      </Link>
                      <Link href="/admin/settings">
                        <a className={navItemClass(isActive("/admin/settings"))} onClick={closeMobileMenu}>
                          <Settings className="mr-3 h-5 w-5" />
                          Thiết lập hệ thống
                        </a>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            <Logo className="h-8 ml-3" />
          </div>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="text-neutral-600 hover:text-primary mr-4">
              <Bell className="h-6 w-6" />
            </Button>
            <UserNav />
          </div>
        </div>
      </div>
      <div className="md:hidden h-16" />
    </>
  );
}
