/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  ArrowRight,
  TrendingDown,
  Store,
  BarChart3,
  ShoppingCart,
  Search,
  Zap,
  Shield,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Feature } from "@/components/ui/feature-section-with-grid";
import { GetStartedButton } from "@/components/ui/get-started-button";
import { Hero } from "@/components/ui/hero-with-group-of-images-text-and-two-buttons";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const stats = [
  { value: "50+", label: "Stores listed" },
  { value: "10K+", label: "Products indexed" },
  { value: "30%", label: "Average savings" },
];

const features = [
  {
    icon: TrendingDown,
    title: "Compare Prices",
    description:
      "See prices from multiple stores side by side. Find the best deal instantly.",
  },
  {
    icon: ShoppingCart,
    title: "Smart Cart",
    description:
      "Add items and we calculate the cheapest store for your entire basket.",
  },
  {
    icon: Store,
    title: "Multiple Stores",
    description:
      "Browse products from all your favourite local grocery stores in one place.",
  },
  {
    icon: BarChart3,
    title: "Price Tracking",
    description:
      "Track price history and get alerted when prices drop on items you love.",
  },
];

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Search for products",
    description:
      "Browse our extensive catalog or search for the grocery items you need.",
  },
  {
    icon: TrendingDown,
    number: "02",
    title: "Compare prices instantly",
    description:
      "See real-time prices from multiple stores side by side in one view.",
  },
  {
    icon: ShoppingCart,
    number: "03",
    title: "Build your smart cart",
    description:
      "Add items and we auto-optimize your basket for the lowest total spend.",
  },
];

const trustPoints = [
  { icon: Shield, text: "Verified store pricing" },
  { icon: Zap, text: "Real-time price updates" },
  { icon: Users, text: "Trusted by smart shoppers" },
  { icon: CheckCircle2, text: "Free to use — always" },
];

/* ------------------------------------------------------------------ */
/*  PAGE                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <Hero />
      <section className="bg-gradient-to-t from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 pb-16 md:pb-24 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Stats Bar */}
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-8 shadow-sm text-center">
                  <p className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-slate-100">{s.value}</p>
                  <p className="mt-3 text-sm font-medium text-slate-500 uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TRUST BAR                                                   */}
      {/* ============================================================ */}
      <section className="border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50 py-10">
        <div className="container mx-auto max-w-7xl px-4">
          <p className="text-center text-sm font-medium text-slate-500 mb-8 uppercase tracking-[0.2em] font-sans">Trusted for everyday savings</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {trustPoints.map((tp) => {
              const Icon = tp.icon;
              return (
                <div key={tp.text} className="flex items-center gap-3 text-sm md:text-base font-medium text-slate-700 dark:text-slate-300 font-sans">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  {tp.text}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES (Using imported component)                           */}
      {/* ============================================================ */}
      <Feature />

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                */}
      {/* ============================================================ */}
      <section className="bg-slate-50 dark:bg-slate-900/40 border-y border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto max-w-7xl px-4 py-20 sm:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <h2 className="text-sm font-medium tracking-widest text-slate-500 uppercase">How it works</h2>
              <p className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-serif leading-tight">
                Three simple steps <span className="italic text-slate-600 dark:text-slate-400">to lower your bill</span>
              </p>
              <p className="mt-6 text-lg xl:text-xl leading-relaxed text-slate-500 dark:text-slate-400 font-sans">
                We&apos;ve made it ridiculously easy to find the best prices.
                No signup required to start comparing across dozens of stores instantly.
              </p>
              <Link href="/products" className="mt-10 inline-flex">
                <GetStartedButton className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 shadow-md h-12 text-sm px-8" label="Try it now" />
              </Link>
            </div>

            <div className="flex flex-col gap-6">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="flex gap-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wider">STEP {step.number}</span>
                        <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100 font-serif">{step.title}</h3>
                      </div>
                      <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed font-sans mt-2">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOR STORE OWNERS                                            */}
      {/* ============================================================ */}
      <section className="container mx-auto max-w-7xl px-4 py-20 sm:py-32">
        <div className="rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 relative z-10">
            <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
              <h2 className="text-sm font-medium tracking-widest text-slate-500 uppercase">For Store Owners</h2>
              <p className="mt-4 text-4xl md:text-5xl font-serif tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                Reach more customers,<br /><span className="italic text-slate-600 dark:text-slate-400">grow your sales</span>
              </p>
              <p className="mt-6 text-lg leading-relaxed text-slate-500 dark:text-slate-400 font-sans">
                List your products on MaDe Market and get discovered by thousands
                of price-conscious shoppers actively looking for deals.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Free store listing & merchant dashboard",
                  "Bulk product upload via Excel/CSV",
                  "Real-time analytics & pricing insights",
                  "Sponsored product placements",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-base text-slate-600 dark:text-slate-400">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link href="/register">
                  <Button variant="outline" className="rounded-full px-8 h-12 text-sm border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-none font-medium">
                    Register Your Store
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:flex items-center justify-center p-8 lg:p-16 bg-slate-50 dark:bg-slate-900/50 border-l border-slate-200/50 dark:border-slate-800/50">
              <div className="relative w-full max-w-sm aspect-square bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col p-8">
                <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-500" />
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="h-24 w-24 rounded-3xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <Store className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-serif font-medium text-slate-900 dark:text-slate-100 mb-3">Merchant Dashboard</h3>
                  <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">Manage inventory, track sales, and optimize pricing in real-time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA                                                         */}
      {/* ============================================================ */}
      <section className="bg-slate-900 dark:bg-slate-950 py-24 sm:py-32 border-t border-slate-800">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight text-white leading-tight">
            Ready to <span className="italic text-slate-400">save on groceries?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 font-sans">
            Join thousands of smart shoppers comparing prices every day.
            It&apos;s free, fast, and incredibly easy to start saving.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products">
              <GetStartedButton className="bg-white hover:bg-slate-100 text-slate-900 shadow-none h-14 px-8 border-none text-sm font-medium" label="Browse Products" />
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-sm font-medium border-slate-800 text-white bg-slate-800/50 hover:bg-slate-800 transition-none shadow-none hover:text-white">
                Register Store
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
