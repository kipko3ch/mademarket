import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function Hero() {
    return (
        <div className="w-full py-10 md:py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="grid grid-cols-1 gap-12 items-center md:grid-cols-2 lg:gap-16">
                    <div className="flex gap-6 flex-col">
                        <div className="flex gap-4 flex-col">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl max-w-lg tracking-tight text-left font-serif text-slate-900 dark:text-slate-50 leading-tight">
                                Compare grocery prices.<br />
                                <span className="text-blue-600 font-serif italic block mt-1">Save every time.</span>
                            </h1>
                            <p className="text-lg md:text-xl leading-relaxed tracking-normal text-slate-500 dark:text-slate-400 max-w-md text-left font-sans">
                                MaDe Market compares prices across multiple grocery stores so you
                                always get the best deal. Build your cart and see exactly how much
                                you save.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                            <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-sm bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 text-white shadow-md font-medium rounded-full transition-all">
                                Get Started <MoveRight className="w-4 h-4 ml-2" />
                            </Button>
                            <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-sm shadow-none border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-full transition-all" variant="outline">
                                Register Store
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 lg:gap-5">
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl aspect-square overflow-hidden border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800" alt="Groceries layout" className="text-transparent w-full h-full object-cover" />
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl row-span-2 overflow-hidden border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                            <img src="https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&q=80&w=800" alt="Person shopping" className="text-transparent w-full h-full object-cover" />
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-3xl aspect-square overflow-hidden border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                            <img src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=800" alt="Fresh produce" className="text-transparent w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { Hero };
