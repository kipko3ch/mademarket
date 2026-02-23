/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import {
    FileText,
    Scale,
    ShoppingBag,
    AlertTriangle,
    Ban,
    Gavel,
    RefreshCw,
    Mail,
    ArrowRight,
    ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Terms of Service — MaDe Market",
    description:
        "Read our Terms of Service to understand the rules and guidelines for using MaDe Market's grocery price comparison platform.",
};

const sections = [
    {
        icon: FileText,
        title: "Acceptance of Terms",
        number: "01",
        content: [
            {
                subtitle: "Agreement",
                text: 'By accessing or using MaDe Market ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access or use our services. These terms apply to all visitors, users, vendors, and others who use the Platform.',
            },
            {
                subtitle: "Eligibility",
                text: "You must be at least 18 years of age to use MaDe Market. By using our services, you represent and warrant that you are of legal age and have the legal capacity to enter into a binding agreement.",
            },
            {
                subtitle: "Modifications",
                text: "We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the Platform after changes constitutes acceptance of the revised terms.",
            },
        ],
    },
    {
        icon: ShoppingBag,
        title: "Use of Services",
        number: "02",
        content: [
            {
                subtitle: "Account Registration",
                text: "To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
            },
            {
                subtitle: "Price Comparison",
                text: "MaDe Market provides grocery price comparison tools to help you find the best deals. While we strive for accuracy, prices are sourced from participating vendors and may change without notice.",
            },
            {
                subtitle: "Smart Cart",
                text: "Our smart cart feature helps you organize and optimize your shopping list. Items added to your cart are based on the latest available pricing data. Final prices may vary at the point of purchase.",
            },
        ],
    },
    {
        icon: Scale,
        title: "Vendor Terms",
        number: "03",
        content: [
            {
                subtitle: "Vendor Registration",
                text: "Vendors who register on MaDe Market agree to provide accurate product information, pricing, and availability data. Vendors are responsible for keeping their listings up-to-date and ensuring compliance with all applicable laws.",
            },
            {
                subtitle: "Product Listings",
                text: "Vendors must ensure that all product descriptions, images, and prices are truthful and not misleading. MaDe Market reserves the right to remove or modify any listing that violates our policies.",
            },
            {
                subtitle: "Responsibilities",
                text: "Vendors are solely responsible for the fulfillment of orders, product quality, and customer service related to their products. MaDe Market acts as a comparison platform and is not a party to transactions between users and vendors.",
            },
        ],
    },
    {
        icon: Ban,
        title: "Prohibited Conduct",
        number: "04",
        content: [
            {
                subtitle: "Misuse",
                text: "You agree not to use MaDe Market to engage in any illegal activity, violate intellectual property rights, transmit malware or harmful code, or interfere with the proper functioning of the Platform.",
            },
            {
                subtitle: "Data Scraping",
                text: "Automated scraping, crawling, or data extraction from MaDe Market is strictly prohibited without prior written consent. This includes using bots, scripts, or any automated means to access our services.",
            },
            {
                subtitle: "Manipulation",
                text: "Any attempt to manipulate prices, reviews, ratings, or comparison results is prohibited. Vendors found engaging in price manipulation or deceptive practices will have their accounts terminated immediately.",
            },
        ],
    },
    {
        icon: AlertTriangle,
        title: "Limitation of Liability",
        number: "05",
        content: [
            {
                subtitle: "Disclaimer",
                text: 'MaDe Market is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the reliability, accuracy, or availability of our services.',
            },
            {
                subtitle: "Limitation",
                text: "To the maximum extent permitted by law, MaDe Market shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use our services.",
            },
            {
                subtitle: "Indemnification",
                text: "You agree to indemnify, defend, and hold harmless MaDe Market, its officers, directors, employees, and agents from any claims, liabilities, damages, losses, or expenses arising from your use of the Platform.",
            },
        ],
    },
    {
        icon: RefreshCw,
        title: "Termination & Changes",
        number: "06",
        content: [
            {
                subtitle: "Termination",
                text: "We may terminate or suspend your access to MaDe Market immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Platform will cease immediately.",
            },
            {
                subtitle: "Data After Termination",
                text: "Upon account termination, we may retain certain information as required by law or for legitimate business purposes. You may request deletion of your personal data in accordance with our Privacy Policy.",
            },
        ],
    },
    {
        icon: Gavel,
        title: "Governing Law & Disputes",
        number: "07",
        content: [
            {
                subtitle: "Governing Law",
                text: "These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which MaDe Market operates, without regard to conflict of law principles.",
            },
            {
                subtitle: "Dispute Resolution",
                text: "Any disputes arising from these Terms or your use of MaDe Market shall first be attempted to be resolved through informal negotiation. If informal resolution is not possible, disputes will be submitted to binding arbitration.",
            },
            {
                subtitle: "Contact for Legal Matters",
                text: "For any legal inquiries or concerns regarding these Terms of Service, please contact us at legal@mademarket.com. We will make every effort to address your concerns promptly and fairly.",
            },
        ],
    },
];

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-white dark:bg-background">
            {/* Breadcrumb */}
            <div className="border-b">
                <div className="container mx-auto max-w-6xl px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-foreground font-medium">Terms of Service</span>
                    </div>
                </div>
            </div>

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-blue-50/40 to-transparent dark:from-blue-950/30 dark:via-blue-950/10 dark:to-transparent" />
                <div className="container relative mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/40 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-6 uppercase tracking-wider">
                            <Gavel className="h-3.5 w-3.5" />
                            Legal Agreement
                        </div>
                        <h1 className="text-4xl md:text-[3.25rem] lg:text-[3.75rem] font-bold tracking-tight leading-[1.1] text-foreground mb-5">
                            Terms of{" "}
                            <span className="text-blue-600 dark:text-blue-400">Service</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                            Please read these terms carefully before using MaDe Market. By using our platform, you agree to comply with and be bound by these conditions.
                        </p>
                        <p className="mt-6 text-sm text-muted-foreground/70">
                            Effective — February 20, 2026
                        </p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="container mx-auto max-w-6xl px-4 pb-20 md:pb-28">
                <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12 lg:gap-16">
                    {/* Sidebar navigation — desktop */}
                    <aside className="hidden lg:block">
                        <nav className="sticky top-24 space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">On this page</p>
                            {sections.map((section) => (
                                <a
                                    key={section.number}
                                    href={`#section-${section.number}`}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
                                >
                                    <span className="text-xs font-mono text-blue-500/60">{section.number}</span>
                                    {section.title}
                                </a>
                            ))}
                        </nav>
                    </aside>

                    {/* Main content */}
                    <div className="space-y-0">
                        {sections.map((section, idx) => (
                            <div
                                key={section.number}
                                id={`section-${section.number}`}
                                className={`scroll-mt-24 py-10 md:py-14 ${idx !== sections.length - 1 ? "border-b border-border/50" : ""}`}
                            >
                                {/* Section Header */}
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                                        <section.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono text-blue-500 mb-0.5">{section.number}</p>
                                        <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                                            {section.title}
                                        </h2>
                                    </div>
                                </div>

                                {/* Subsections */}
                                <div className="grid gap-6 md:gap-8">
                                    {section.content.map((item) => (
                                        <div key={item.subtitle} className="group pl-0 md:pl-[3.75rem]">
                                            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                                <span className="inline-block h-1 w-1 rounded-full bg-blue-500" />
                                                {item.subtitle}
                                            </h3>
                                            <p className="text-[15px] leading-relaxed text-muted-foreground">
                                                {item.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 md:mt-24 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 md:p-12 lg:p-16">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="text-white">
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">Need clarification?</h2>
                            <p className="text-blue-100 text-base md:text-lg">
                                If you have questions about our terms, our team is ready to assist you.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                            >
                                <Mail className="h-4 w-4" />
                                Contact Us
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/privacy"
                                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:-translate-y-0.5"
                            >
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
