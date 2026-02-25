import Link from "next/link";
import { Info, Target, ShieldCheck, ShoppingBag, ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "About Us | MaDe Market Namibia",
    description: "Learn more about MaDe Market, Namibia's first real-time grocery price comparison platform. Our mission is to help Namibians save money on every shop.",
};

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden bg-white">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
                <div className="container px-4 mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-8">
                        <Info className="h-4 w-4" />
                        <span>Our Journey</span>
                    </div>
                    <h1 className="font-heading text-4xl md:text-6xl text-slate-900 mb-6 leading-tight">
                        Saving Namibians <span className="highlighter">Money</span> <br />
                        Every Single Day
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10">
                        MaDe Market was born from a simple observation: grocery prices in Namibia vary significantly between stores, and families were spending more than they needed to.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button asChild size="lg" className="rounded-2xl h-14 px-8 text-white">
                            <Link href="/products">
                                Start Saving Now
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-2xl h-14 px-8">
                            <Link href="/contact">Contact Support</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-24 bg-slate-50">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <Target className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Our Mission</h3>
                            <p className="text-slate-500 leading-relaxed">
                                To provide transparency in the Namibian retail market, empowering consumers with real-time price data to make smarter purchasing decisions.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">100% Independent</h3>
                            <p className="text-slate-500 leading-relaxed">
                                We are not owned by any retailer. Our comparisons are fair, unbiased, and focused solely on providing the best value for you.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                                <Heart className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Built for Namibia</h3>
                            <p className="text-slate-500 leading-relaxed">
                                From Windhoek to Walvis Bay, we track the stores you shop at every day: Shoprite, Checkers, SPAR, OK Foods, and more.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-24 bg-white">
                <div className="container px-4 mx-auto">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="font-heading text-3xl md:text-5xl text-slate-900 mb-6">Why Trust Us?</h2>
                        <p className="text-slate-500 text-lg">
                            We use advanced data collection technology to verify thousands of prices daily across multiple Namibian towns.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex gap-6 p-8 bg-slate-50 rounded-3xl">
                            <div className="shrink-0 w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-2">Verified Prices</h4>
                                <p className="text-slate-500 text-sm">
                                    Our team and automated systems double-check price entries to ensure the data you see is accurate and up-to-date.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6 p-8 bg-slate-50 rounded-3xl">
                            <div className="shrink-0 w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 mb-2">Consumer Advocacy</h4>
                                <p className="text-slate-500 text-sm">
                                    We believe that price transparency leads to healthier competition and lower prices for all Namibians.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="container px-4 mx-auto">
                    <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="relative z-10">
                            <h2 className="font-heading text-3xl md:text-5xl mb-8">Ready to join the smart shopping movement?</h2>
                            <p className="text-primary-foreground/80 text-lg mb-12 max-w-2xl mx-auto">
                                Create a free account to track prices, receive alerts for specials, and save your shopping lists.
                            </p>
                            <Button asChild size="lg" variant="secondary" className="rounded-2xl h-16 px-10 text-primary font-bold shadow-xl">
                                <Link href="/auth/register">Create Free Account</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
