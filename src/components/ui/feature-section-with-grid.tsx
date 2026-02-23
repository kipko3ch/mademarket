import { Badge } from "@/components/ui/badge";

const featuresData = [
    {
        title: "Compare Prices",
        description: "See prices from multiple stores side by side. Find the best deal instantly.",
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
    },
    {
        title: "Smart Cart",
        description: "Add items and we calculate the cheapest store for your entire basket.",
        imageUrl: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&q=80&w=800",
    },
    {
        title: "Multiple Stores",
        description: "Browse products from all your favourite local grocery stores in one place.",
        imageUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800",
    },
    {
        title: "Price Tracking",
        description: "Track price history and get alerted when prices drop on items you love.",
        imageUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=800",
    },
    {
        title: "Verified Pricing",
        description: "Our data is accurate, frequently updated, and rigorously verified.",
        imageUrl: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&q=80&w=800",
    },
    {
        title: "Fast Savings",
        description: "No complex processes—just search, compare, and head to the store.",
        imageUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=800",
    },
];

export function Feature() {
    return (
        <div className="w-full py-16 lg:py-24 bg-white dark:bg-slate-950">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="flex flex-col gap-10">
                    <div className="flex gap-4 flex-col items-center md:items-start text-center md:text-left">
                        <span className="text-sm font-medium tracking-widest text-slate-500 uppercase">Platform Features</span>
                        <div className="flex gap-4 flex-col">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl tracking-tight max-w-2xl font-serif text-slate-900 dark:text-slate-50 leading-tight">
                                Everything you need <span className="italic text-slate-600 dark:text-slate-400">to shop smarter</span>
                            </h2>
                            <p className="text-lg leading-relaxed text-slate-500 dark:text-slate-400 max-w-xl font-sans">
                                Your smartest way to shop for groceries — compare, save, and never overpay again with our powerful toolset.
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mt-8">
                        {featuresData.map((feature, idx) => (
                            <div key={idx} className="flex flex-col gap-4 group">
                                <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl aspect-video overflow-hidden shadow-sm">
                                    <img src={feature.imageUrl} alt={feature.title} className="text-transparent w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                </div>
                                <div>
                                    <h3 className="text-xl tracking-tight font-serif font-medium text-slate-900 dark:text-slate-100 mb-2">{feature.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed font-sans">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
