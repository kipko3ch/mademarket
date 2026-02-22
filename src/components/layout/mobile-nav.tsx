"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Heart, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function MobileNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const itemCount = useCart((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  const navItems = [
    { href: "/", label: "Home", icon: "lucide", LucideIcon: Home },
    { href: "/saved", label: "Saved", icon: "lucide", LucideIcon: Heart },
    { href: "/cart", label: "Cart", icon: "custom", src: "/icons/cart.png" },
    { href: session ? "/account" : "/login", label: "Profile", icon: "lucide", LucideIcon: User },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
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
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                {item.icon === "custom" ? (
                  <Image
                    src={item.src}
                    alt={item.label}
                    width={20}
                    height={20}
                    className={cn(
                      "object-contain",
                      isActive ? "opacity-100" : "opacity-50"
                    )}
                  />
                ) : (
                  <item.LucideIcon
                    className={cn("h-5 w-5", isActive && "stroke-[2.5px]")}
                  />
                )}
                {isCart && itemCount > 0 && (
                  <Badge className="absolute -top-1.5 -right-2 h-4 min-w-4 p-0 flex items-center justify-center text-[9px] font-bold bg-primary text-primary-foreground">
                    {itemCount}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
