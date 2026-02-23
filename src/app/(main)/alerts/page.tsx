"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Heart,
  TrendingDown,
  Clock,
  Sparkles,
} from "lucide-react";

export default function AlertsPage() {
  const { status } = useSession();

  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
      <Link
        href="/account"
        className="group inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary mb-8 transition-all"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 group-hover:bg-primary group-hover:text-white transition-all">
          <ArrowLeft className="h-4 w-4" />
        </div>
        <span className="font-medium">Back to Account</span>
      </Link>

      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900">
          <span className="highlighter text-red-600">Price</span> Alerts
        </h1>
        <p className="text-slate-500 mt-2">
          Get notified when prices drop on items you care about.
        </p>
      </div>

      {/* Coming Soon Section */}
      <section className="mb-10">
        <div className="text-center py-16 rounded-xl border border-dashed border-slate-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Bell className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Coming Soon
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Price alert notifications are coming soon. In the meantime, save
            items to your wishlist to keep track of products you are interested
            in.
          </p>
          <Link
            href="/saved"
            className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Heart className="h-4 w-4" />
            Go to Saved Items
          </Link>
        </div>
      </section>

      {/* Planned Features */}
      <section>
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-6">
          Planned Features
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-100">
            <TrendingDown className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Price Drop Notifications
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Get notified instantly when a product you are watching drops in
                price at any store.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-100">
            <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Price History Tracking
              </p>
              <p className="text-xs text-slate-500 mt-1">
                See price trends over time to help you decide the best time to
                buy.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-100">
            <Sparkles className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Smart Recommendations
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Personalized deal alerts based on your shopping preferences and
                saved items.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
