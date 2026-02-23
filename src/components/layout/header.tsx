/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, LogOut, LayoutDashboard, Shield, Heart, Menu, X, User, ChevronDown, ShoppingBag, Bell, Settings, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LocationSelector } from "@/components/location-selector";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useCart } from "@/hooks/use-cart";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Browse" },
  { href: "/compare", label: "Compare" },
];

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
      setMobileSearchOpen(false);
    }
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled
        ? "bg-white/90 backdrop-blur-md border-b border-primary/10 shadow-sm"
        : "bg-transparent md:bg-background border-b-0 shadow-none"
    )}>
      <div className="flex h-14 items-center justify-between gap-2 px-4 md:px-8 mx-auto w-full max-w-[1440px] relative overflow-x-hidden">
        {/* Mobile Search Overlay */}
        <div className={cn(
          "absolute inset-0 bg-background md:hidden items-center px-4 transition-all duration-300 z-[70] flex",
          mobileSearchOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        )}>
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 -ml-2 text-slate-400 hover:text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                autoFocus={mobileSearchOpen}
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </form>
        </div>

        {/* Logo */}
        <Link href="/" className={cn("flex items-center gap-2 shrink-0 transition-opacity", mobileSearchOpen && "opacity-0 invisible md:visible md:opacity-100")}>
          <img src="/logo.png" alt="MaDe Market" className="h-6 sm:h-7 md:h-8 w-auto" />
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-primary font-bold"
                  : "text-slate-600 hover:text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Search */}
        <form
          onSubmit={handleSearch}
          className={cn(
            "flex-1 hidden md:block transition-all duration-500 ease-in-out origin-center",
            scrolled ? "max-w-xl" : "max-w-md"
          )}
        >
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all outline-none"
            />
          </div>
        </form>

        {/* Right side actions */}
        <div className={cn("flex items-center gap-1 sm:gap-2 transition-opacity", mobileSearchOpen && "opacity-0 invisible md:visible md:opacity-100")}>
          {/* Mobile Search Button */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Location (desktop) */}
          <div className="hidden md:block">
            <LocationSelector />
          </div>

          {/* Saved (desktop) */}
          <Link href="/saved" className="hidden md:flex">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-600 hover:text-primary hover:bg-primary/5">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {/* Cart — links to cart page - hidden on mobile as it's inbottom nav */}
          <div className="hidden md:flex">
            <CartIconLink />
          </div>

          {/* Profile dropdown */}
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-primary/10 transition-colors p-0 overflow-hidden ring-2 ring-transparent hover:ring-primary/20">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground transition-transform">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-0">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-semibold text-slate-900">{session.user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
                </div>

                {/* My Activity */}
                <div className="px-2 pt-2 pb-1">
                  <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Activity</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center gap-3 px-4 py-2">
                    <ShoppingBag className="h-4 w-4 text-slate-400" />
                    <span className="text-sm">My Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/saved" className="flex items-center gap-3 px-4 py-2">
                    <Heart className="h-4 w-4 text-slate-400" />
                    <span className="text-sm">Saved Items</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/alerts" className="flex items-center gap-3 px-4 py-2">
                    <Bell className="h-4 w-4 text-slate-400" />
                    <span className="text-sm">Price Alerts</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Settings & Privacy */}
                <div className="px-2 pt-1 pb-1">
                  <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settings & Privacy</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/account/profile" className="flex items-center gap-3 px-4 py-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-sm">Profile Information</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/security" className="flex items-center gap-3 px-4 py-2">
                    <Shield className="h-4 w-4 text-slate-400" />
                    <span className="text-sm">Security</span>
                  </Link>
                </DropdownMenuItem>

                {/* Merchant Options */}
                {(session.user.role === "admin" || session.user.role === "vendor") && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 pt-1 pb-1">
                      <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Merchant Options</p>
                    </div>
                    {session.user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2">
                          <Settings className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {session.user.role === "vendor" && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2">
                          <Store className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">Seller Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 px-4 py-2.5"
                  onClick={() => signOut({ callbackUrl: window.location.origin + "/login" })}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  <span className="text-sm font-medium">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm font-medium text-slate-600 hover:text-primary">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary text-white rounded-full shadow-lg shadow-primary/20 hover:bg-primary/90 text-xs px-4">
                  Join now
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle — slides from right */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-all duration-300 z-[60]">
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-slate-700 animate-in spin-in-90 duration-300" />
                ) : (
                  <Menu className="h-5 w-5 text-slate-700 animate-in fade-in duration-300" />
                )}
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[350px] p-0 flex flex-col gap-0 border-l-0 shadow-2xl"
              showCloseButton={false}
            >
              <SheetHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
                <SheetClose asChild>
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                    <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
                  </Link>
                </SheetClose>
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                <SheetClose asChild>
                  <button className="p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </SheetClose>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
                {/* Mobile search */}
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all outline-none"
                  />
                </form>

                {/* Mobile nav */}
                <nav className="flex flex-col gap-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-3 mb-1">Navigation</p>
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "px-3 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between group",
                          pathname === link.href
                            ? "bg-primary text-white"
                            : "text-slate-600 hover:bg-primary/5 hover:text-primary"
                        )}
                      >
                        {link.label}
                        <ChevronDown className={cn("h-4 w-4 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity", pathname === link.href && "opacity-100 brightness-0 invert")} />
                      </Link>
                    </SheetClose>
                  ))}
                  <SheetClose asChild>
                    <Link
                      href="/saved"
                      className="px-3 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <Heart className="h-4 w-4" />
                      Saved Items
                    </Link>
                  </SheetClose>
                </nav>

                {/* Role-based quick links */}
                {session?.user && (session.user.role === "admin" || session.user.role === "vendor") && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-3 mb-1">Dashboard</p>
                    {session.user.role === "admin" && (
                      <SheetClose asChild>
                        <Link
                          href="/admin"
                          className="px-3 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <Shield className="h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </SheetClose>
                    )}
                    {session.user.role === "vendor" && (
                      <SheetClose asChild>
                        <Link
                          href="/dashboard"
                          className="px-3 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Vendor Dashboard
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                )}

                {/* Account / Support */}
                <div className="space-y-4">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-3">Preferences</p>
                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Location</span>
                    <LocationSelector className="bg-white shadow-sm border-slate-100" />
                  </div>
                </div>
              </div>

              {/* Mobile auth footer */}
              {session?.user ? (
                <div className="p-4 border-t bg-slate-50 mt-auto">
                  <button
                    onClick={() => signOut({ callbackUrl: window.location.origin + "/login" })}
                    className="w-full py-2.5 rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="p-4 border-t bg-slate-50 mt-auto">
                  <div className="flex gap-2">
                    <SheetClose asChild>
                      <Link href="/login" className="flex-1">
                        <button className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                          Sign in
                        </button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/register" className="flex-1">
                        <button className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                          Join now
                        </button>
                      </Link>
                    </SheetClose>
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

// ─── Cart icon that links to the cart page ───────────────────────────────────
function CartIconLink() {
  const itemCount = useCart((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  return (
    <Link href="/cart" className="relative flex items-center justify-center h-9 w-9 rounded-lg hover:bg-primary/5 transition-colors">
      <img
        src="/icons/cart.png"
        alt="Cart"
        className="h-5 w-5 object-contain"
      />
      {itemCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground">
          {itemCount}
        </Badge>
      )}
    </Link>
  );
}
