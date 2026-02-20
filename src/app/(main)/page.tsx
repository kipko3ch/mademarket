import Link from "next/link";
import { ShoppingCart, ArrowRight, TrendingDown, Store, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: TrendingDown,
    title: "Compare Prices",
    description: "See prices from multiple stores side by side. Find the best deal instantly.",
  },
  {
    icon: ShoppingCart,
    title: "Smart Cart",
    description: "Add items and we calculate the cheapest store for your entire basket.",
  },
  {
    icon: Store,
    title: "Multiple Stores",
    description: "Browse products from all your favourite local grocery stores in one place.",
  },
  {
    icon: BarChart3,
    title: "Price Tracking",
    description: "Track price history and get alerted when prices drop on items you love.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="container mx-auto max-w-7xl px-4 py-20 md:py-32">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <TrendingDown className="h-4 w-4" />
              Save up to 30% on groceries
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Compare grocery prices.{" "}
              <span className="text-primary">Save every time.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              MaDe Market compares prices across multiple grocery stores so you
              always get the best deal. Build your cart and see exactly how much
              you save.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Comparing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Register Your Store
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How MaDe Market Works</h2>
          <p className="text-muted-foreground mt-2">
            Your smartest way to shop for groceries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="border-0 shadow-sm bg-muted/30">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to save on groceries?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of smart shoppers comparing prices every day.
          </p>
          <Link href="/products">
            <Button size="lg">
              Browse Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
