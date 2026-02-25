import Link from "next/link";
import { Info, Target, ShieldCheck, ShoppingBag, ArrowRight, Heart, Map, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "About Us | MaDe Market Namibia",
    description: "Learn more about MaDe Market, Namibia's first real-time grocery price comparison platform. Our mission is to help Namibians save money on every shop.",
};

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* 🌟 HERO SECTION - More refined */}
            <section className="relative pt-24 pb-32 overflow-hidden bg-white">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[700px] h-[700px] bg-primary/[0.03] rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/[0.02] rounded-full blur-[100px] -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                        <img src="/icons/trending.png" alt="" className="h-3.5 w-3.5" />
                        <span>The Shopping Revolution</span>
                    </div>

                    <h1 className="font-heading text-4xl md:text-7xl text-slate-900 mb-8 leading-[1.1] md:-tracking-tight max-w-4xl mx-auto">
                        We help Namibians <span className="highlighter text-red-600">save</span> their hard-earned money.
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg text-slate-500 mb-12 leading-relaxed">
                        MaDe Market was born from a simple mission: to fight the rising cost of living by providing every Namibian household with the tools to find the best deals, instantly.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button asChild size="lg" className="rounded-2xl h-16 px-10 text-white bg-primary shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all font-bold">
                            <Link href="/products">
                                Start Comparing
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button variant="ghost" size="lg" className="rounded-2xl h-16 px-10 font-bold text-slate-600 hover:bg-slate-50">
                            <Link href="/contact">Support Center</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* 🛡️ CORE VALUES SECTION - Minimalist & Professional */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Our Mission */}
                        <div className="group relative pt-8 border-t-2 border-slate-100 hover:border-primary transition-colors duration-500">
                            <span className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] mb-4 block">01 / Mission</span>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Our Mission</h3>
                            <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                                We drive transparency in the Namibian retail market through real-time pricing data, empowering consumers to make informed purchasing decisions.
                            </p>
                        </div>

                        {/* 100% Independent */}
                        <div className="group relative pt-8 border-t-2 border-slate-100 hover:border-green-500 transition-colors duration-500">
                            <span className="text-[10px] font-black text-green-500/40 uppercase tracking-[0.3em] mb-4 block">02 / Integrity</span>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">100% Independent</h3>
                            <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                                We aren&apos;t owned by any retailer. Our data is unbiased, our comparisons are fair, and our loyalty remains solely with the consumer.
                            </p>
                        </div>

                        {/* Built for Namibia */}
                        <div className="group relative pt-8 border-t-2 border-slate-100 hover:border-red-500 transition-colors duration-500">
                            <span className="text-[10px] font-black text-red-500/40 uppercase tracking-[0.2em] mb-4 block">03 / Community</span>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">Built for Namibian Market</h3>
                            <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                                Built for the Namibian market to compare retailers prices and ensure you get the best value for your money.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ✨ WHY TRUST US SECTION */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/2 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                                Verified Data
                            </div>
                            <h2 className="font-heading text-3xl md:text-5xl text-slate-900 leading-[1.1]">
                                Accuracy you can <span className="text-primary italic">trust</span>.
                            </h2>
                            <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
                                We combine automated verification with a dedicated data team to ensure every price shown is as accurate as what you see on the shelf.
                            </p>

                            <ul className="space-y-4 pt-4">
                                {[
                                    "Daily price verification across 10+ regions",
                                    "Real-time alerts for price drops & specials",
                                    "No hidden fees or sponsored price manipulation",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700 font-bold">
                                        <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                                            <img src="/icons/compare.png" alt="" className="h-3 w-3 brightness-[10] invert" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="lg:w-1/2 relative">
                            <div className="aspect-square bg-slate-900 rounded-[4rem] relative overflow-hidden shadow-2xl">
                                <img
                                    src="/images/namibia.svg"
                                    alt="Namibia"
                                    className="w-full h-full object-cover opacity-20 scale-110"
                                />
                                <div className="absolute inset-0 flex items-center justify-center p-12 text-center">
                                    <div className="space-y-6">
                                        <div className="w-20 h-20 bg-primary/20 rounded-3xl mx-auto flex items-center justify-center shadow-2xl overflow-hidden p-4 group">
                                            <img src="/icons/productplaceholder.png" alt="" className="h-full w-full object-contain opacity-60 group-hover:scale-110 transition-transform" />
                                        </div>
                                        <p className="text-primary font-black text-5xl tracking-tighter shrink-0">10,000+</p>
                                        <p className="text-white/60 text-sm font-bold uppercase tracking-[0.2em]">Products Tracked Daily</p>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary rounded-full blur-3xl opacity-20" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 🚀 CALL TO ACTION */}
            <section className="py-24 px-4 sm:px-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
                    <div className="bg-slate-900 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden ring-1 ring-white/10">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50" />

                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="font-heading text-4xl md:text-6xl mb-8 leading-tight">Join the smart shopping movement.</h2>
                            <p className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed">
                                Join thousands of Namibians who are already saving hundreds of dollars every week. It takes less than 60 seconds to set up.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button asChild size="lg" className="rounded-2xl h-16 px-12 bg-white text-slate-900 hover:bg-slate-100 font-black shadow-2xl">
                                    <Link href="/register">Create Free Account</Link>
                                </Button>
                                <Button asChild variant="ghost" size="lg" className="rounded-2xl h-16 px-10 text-white hover:bg-white/10 font-bold border border-white/10">
                                    <Link href="/products">Browse Deals First</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
