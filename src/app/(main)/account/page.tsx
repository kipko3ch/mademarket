"use client";

import { useSession, signOut } from "next-auth/react";
import {
    User,
    ShoppingBag,
    Heart,
    MapPin,
    Bell,
    Shield,
    LogOut,
    Store,
    ChevronRight,
    HelpCircle,
    CreditCard,
    ArrowLeft,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function AccountPage() {
    const { data: session, status } = useSession();

    if (status === "unauthenticated") {
        redirect("/login");
    }

    if (status === "loading") {
        return (
            <div className="max-w-3xl mx-auto px-4 py-16">
                <div className="animate-pulse space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-muted rounded-full" />
                        <div className="space-y-2">
                            <div className="h-5 w-32 bg-muted rounded" />
                            <div className="h-4 w-48 bg-muted rounded" />
                        </div>
                    </div>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-14 bg-muted rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    const sections = [
        {
            title: "My Activity",
            items: [
                { label: "My Orders", icon: ShoppingBag, href: "/orders", desc: "View purchase history & redirects" },
                { label: "Saved Items", icon: Heart, href: "/saved", desc: "Your wishlist" },
                { label: "Price Alerts", icon: Bell, href: "/alerts", desc: "Get notified on price drops" },
            ]
        },
        {
            title: "Settings & Privacy",
            items: [
                { label: "Profile Information", icon: User, href: "/account/profile", desc: "Name, email, and photo" },
                { label: "Shipping Addresses", icon: MapPin, href: "/account/addresses", desc: "Delivery locations" },
                { label: "Security", icon: Shield, href: "/account/security", desc: "Password & 2FA" },
            ]
        },
        {
            title: "Merchant Options",
            items: [
                { label: "Seller Dashboard", icon: Store, href: "/dashboard", desc: "Manage your store" },
                { label: "Subscription", icon: CreditCard, href: "/account/billing", desc: "Plans & payments" },
            ]
        }
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 md:py-12">
            {/* Back */}
            <Link
                href="/"
                className="group inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-8 transition-all"
            >
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowLeft className="h-4 w-4" />
                </div>
                <span className="font-medium">Home</span>
            </Link>

            {/* Profile Header */}
            <div className="flex items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                        <AvatarImage src={session?.user?.image || ""} />
                        <AvatarFallback className="text-lg bg-primary text-primary-foreground font-bold">
                            {session?.user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">{session?.user?.name}</h1>
                        <p className="text-sm text-slate-500">{session?.user?.email}</p>
                        <span className="inline-block mt-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                            {session?.user?.role || "Shopper"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Sections as list */}
            <div className="space-y-8">
                {sections.map((section) => (
                    <div key={section.title}>
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                            {section.title}
                        </h2>
                        <div className="bg-white border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden">
                            {section.items.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 transition-colors group"
                                >
                                    <div className="h-9 w-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <item.icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 group-hover:text-primary transition-colors">
                                            {item.label}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sign Out */}
            <div className="mt-10">
                <button
                    onClick={() => signOut({ callbackUrl: window.location.origin + "/" })}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-5">
                    <Link href="/terms" className="text-xs text-slate-400 hover:text-primary transition-colors">Terms</Link>
                    <Link href="/privacy" className="text-xs text-slate-400 hover:text-primary transition-colors">Privacy</Link>
                    <Link href="/help" className="text-xs text-slate-400 hover:text-primary transition-colors flex items-center gap-1">
                        <HelpCircle className="h-3 w-3" />
                        Support
                    </Link>
                </div>
                <p className="text-[10px] text-slate-300">MaDe Market v1.0</p>
            </div>
        </div>
    );
}
