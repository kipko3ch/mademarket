"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, LayoutDashboard, Shield } from "lucide-react";
/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/products", label: "Browse" },
    { href: "/compare", label: "Compare" },
    { href: "/cart", label: "Cart" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40 transition-all duration-300">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo.png" alt="MaDe Market" className="h-8 w-auto dark:brightness-0 dark:invert" />
        </Link>

        {/* Desktop Nav — center */}
        <nav className="hidden md:flex items-center gap-1 ml-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm font-medium text-muted-foreground rounded-full transition-colors hover:text-foreground hover:bg-muted/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-1 ring-border/50 hover:ring-border transition-all">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-xl border-border/50 p-2">
                <div className="px-2 py-2 mb-1">
                  <p className="text-sm font-semibold text-foreground">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />
                {(session.user.role === "vendor" || session.user.role === "admin") && (
                  <DropdownMenuItem asChild className="rounded-xl mt-1">
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                {session.user.role === "admin" && (
                  <DropdownMenuItem asChild className="rounded-xl">
                    <Link href="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem onClick={() => signOut()} className="rounded-xl text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-sm font-medium rounded-full px-5 h-10 hover:bg-muted/50">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-full px-6 h-10 text-sm font-semibold shadow-sm shadow-primary/20 hover:shadow-md transition-all">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden rounded-full h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm rounded-l-3xl border-l-0 p-6">
              <div className="mt-2 mb-10">
                <img src="/logo.png" alt="MaDe Market" className="h-8 w-auto dark:brightness-0 dark:invert" />
              </div>
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-base font-medium rounded-2xl hover:bg-muted/50 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              {!session?.user && (
                <div className="flex flex-col gap-3 mt-10 pt-8 border-t border-border/50">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full h-12 text-base border-border">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full rounded-full h-12 text-base shadow-lg shadow-primary/20">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
