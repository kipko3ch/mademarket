/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, Database, UserCheck, Mail, ArrowRight, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy — MaDe Market",
    description:
        "Learn how MaDe Market collects, uses, and protects your personal information. Your privacy matters to us.",
};

const sections = [
    {
        icon: Database,
        title: "Information We Collect",
        number: "01",
        content: [
            {
                subtitle: "Personal Information",
                text: "When you create an account, register a store, or use our services, we may collect your name, email address, phone number, and business details. This information is essential for providing you with our grocery price comparison and vendor management services.",
            },
            {
                subtitle: "Usage Data",
                text: "We automatically collect information about how you interact with MaDe Market, including pages visited, products searched, price comparisons made, items added to your smart cart, and time spent on our platform.",
            },
            {
                subtitle: "Device & Technical Data",
                text: "We collect device type, browser information, IP address, and operating system details to ensure our platform works optimally across all devices and to maintain security.",
            },
        ],
    },
    {
        icon: Eye,
        title: "How We Use Your Information",
        number: "02",
        content: [
            {
                subtitle: "Service Delivery",
                text: "We use your information to provide, maintain, and improve our grocery price comparison services, process your smart cart selections, and manage vendor accounts and product listings.",
            },
            {
                subtitle: "Personalization",
                text: "Your usage data helps us personalize product recommendations, display relevant price comparisons, and tailor the shopping experience to your preferences and location.",
            },
            {
                subtitle: "Communication",
                text: "We may send you service-related notifications, price alerts, promotional offers, and updates about new features. You can opt out of marketing communications at any time.",
            },
        ],
    },
    {
        icon: Lock,
        title: "Data Protection & Security",
        number: "03",
        content: [
            {
                subtitle: "Encryption",
                text: "All data transmitted between your device and our servers is encrypted using industry-standard TLS/SSL protocols. Sensitive information such as passwords is hashed and stored securely.",
            },
            {
                subtitle: "Access Controls",
                text: "We implement strict access controls to ensure that only authorized personnel can access personal data. Our systems are regularly audited and monitored for security vulnerabilities.",
            },
            {
                subtitle: "Data Retention",
                text: "We retain your personal information only for as long as necessary to provide our services and fulfill the purposes outlined in this policy. You may request deletion of your data at any time.",
            },
        ],
    },
    {
        icon: UserCheck,
        title: "Your Rights & Choices",
        number: "04",
        content: [
            {
                subtitle: "Access & Portability",
                text: "You have the right to access, download, and transfer your personal data. You can view and update your account information through your profile settings at any time.",
            },
            {
                subtitle: "Deletion & Correction",
                text: "You may request the deletion or correction of your personal information by contacting us. We will process such requests in accordance with applicable data protection laws.",
            },
            {
                subtitle: "Consent Withdrawal",
                text: "You can withdraw your consent for data processing at any time. Note that withdrawing consent may affect your ability to use certain features of MaDe Market.",
            },
        ],
    },
    {
        icon: Shield,
        title: "Third-Party Sharing",
        number: "05",
        content: [
            {
                subtitle: "Service Providers",
                text: "We may share data with trusted third-party service providers who assist us in operating our platform, processing payments, and analyzing usage patterns. These providers are bound by strict confidentiality agreements.",
            },
            {
                subtitle: "Store Partners",
                text: "When you interact with store listings, basic interaction data may be shared with the respective vendor to help them improve their offerings. We never sell your personal information to third parties.",
            },
            {
                subtitle: "Legal Requirements",
                text: "We may disclose your information if required by law, court order, or governmental authority, or when we believe disclosure is necessary to protect our rights, your safety, or the safety of others.",
            },
        ],
    },
    {
        icon: Mail,
        title: "Contact Us",
        number: "06",
        content: [
            {
                subtitle: "Questions or Concerns",
                text: "If you have any questions about this Privacy Policy or how we handle your data, please don't hesitate to reach out. We are committed to transparency and will respond to your inquiries promptly.",
            },
            {
                subtitle: "Data Protection Officer",
                text: "You can contact our data protection team at privacy@mademarket.com or through the contact form on our website. We aim to respond to all privacy-related requests within 30 days.",
            },
        ],
    },
];

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-background">
            {/* Breadcrumb */}
            <div className="border-b">
                <div className="container mx-auto max-w-6xl px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                        <ChevronRight className="h-3.5 w-3.5" />
                        <span className="text-foreground font-medium">Privacy Policy</span>
                    </div>
                </div>
            </div>

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-blue-50/40 to-transparent dark:from-blue-950/30 dark:via-blue-950/10 dark:to-transparent" />
                <div className="container relative mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/40 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-6 uppercase tracking-wider">
                            <Shield className="h-3.5 w-3.5" />
                            Privacy Policy
                        </div>
                        <h1 className="text-4xl md:text-[3.25rem] lg:text-[3.75rem] font-bold tracking-tight leading-[1.1] text-foreground mb-5">
                            Your privacy is{" "}
                            <span className="text-blue-600 dark:text-blue-400">our priority</span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                            At MaDe Market, we are committed to protecting your personal information and being transparent about how we use it.
                        </p>
                        <p className="mt-6 text-sm text-muted-foreground/70">
                            Last updated — February 20, 2026
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
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">Have questions about your data?</h2>
                            <p className="text-blue-100 text-base md:text-lg">
                                We believe in full transparency. Get in touch and we&apos;ll be happy to help.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                            >
                                Contact Us
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/terms"
                                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 hover:-translate-y-0.5"
                            >
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
