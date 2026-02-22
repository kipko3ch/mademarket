"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Heart, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const itemCount = useCart((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  const navItems = [
    { href: "/", label: "Home", Icon: Home },
    { href: "/saved", label: "Saved", Icon: Heart },
    { href: "/cart", label: "Cart", Icon: ShoppingCart },
    { href: session ? "/account" : "/login", label: "Profile", Icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="flex items-center justify-around h-14 w-full px-0">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const isCart = item.href === "/cart";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <div className="relative">
                <item.Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                {isCart && itemCount > 0 && (
                  <Badge className="absolute -top-1.5 -right-2.5 h-4 min-w-4 p-0 flex items-center justify-center text-[9px] font-bold bg-primary text-primary-foreground rounded-full">
                    {itemCount}
                  </Badge>
                )}
              </div>
              <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
