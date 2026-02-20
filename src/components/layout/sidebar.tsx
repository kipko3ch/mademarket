"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Upload,
  BarChart3,
  Megaphone,
  Store,
  Tags,
  Shield,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

const vendorLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/upload", label: "Bulk Upload", icon: Upload },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/sponsored", label: "Sponsored Ads", icon: Megaphone },
];

const adminLinks: SidebarLink[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/stores", label: "Manage Stores", icon: Store },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/sponsored", label: "Sponsored", icon: Megaphone },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = pathname.startsWith("/admin");
  const links = isAdmin ? adminLinks : vendorLinks;

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r bg-muted/30 min-h-[calc(100vh-4rem)]">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">
            {isAdmin ? "Admin Panel" : "Vendor Dashboard"}
          </span>
        </div>
        {session?.user && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {session.user.email}
          </p>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            link.href === "/dashboard" || link.href === "/admin"
              ? pathname === link.href
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
