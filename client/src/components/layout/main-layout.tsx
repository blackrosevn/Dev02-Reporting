import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import { useLocation, Link } from "wouter";
import { ChevronLeft, HelpCircle, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  backLink?: string;
}

export function MainLayout({ children, pageTitle, backLink }: MainLayoutProps) {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  // If not authenticated, don't render the layout
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <Sidebar />
      <MobileNav />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-neutral-100 h-16 flex-shrink-0 hidden md:flex items-center px-6">
          <div className="flex-1 flex">
            {backLink && (
              <Link href={backLink}>
                <Button variant="ghost" className="flex items-center text-neutral-500 hover:text-primary mr-6">
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Quay lại</span>
                </Button>
              </Link>
            )}
            <h1 className="text-lg font-semibold text-neutral-800">
              {pageTitle || "Vinatex Report Portal"}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative text-neutral-500 hover:text-primary">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-error"></span>
              </Button>
            </div>
            <div className="border-l border-neutral-200 h-6"></div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center">
                  <span className="text-sm font-medium text-neutral-600 mr-2">VI</span>
                  <ChevronLeft className="h-4 w-4 text-neutral-400 rotate-270" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Tiếng Việt</DropdownMenuItem>
                <DropdownMenuItem>English</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="border-l border-neutral-200 h-6"></div>
            <div className="relative">
              <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-primary">
                <HelpCircle className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
