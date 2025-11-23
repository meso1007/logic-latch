"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown, ArrowUpRight, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UpgradePage() {
    const { user } = useAuth();
    const router = useRouter();

    const plans = [
        {
            name: "Free",
            price: "¥0",
            period: "/mo",
            description: "Perfect for getting started",
            features: [
                "Up to 5 projects",
                "Basic quiz generation",
                "Community support",
            ],
            current: true,
            icon: Sparkles,
            highlight: false,
        },
        {
            name: "Pro",
            price: "¥980",
            period: "/mo",
            description: "For serious learners",
            features: [
                "Unlimited projects",
                "Advanced AI analysis",
                "Priority support",
                "Learning analytics",
                "Custom themes",
            ],
            popular: true,
            icon: Zap,
            highlight: true, // The "Rule Breaker"
        },
        {
            name: "Enterprise",
            price: "Custom",
            period: "",
            description: "For teams & organizations",
            features: [
                "Everything in Pro",
                "Team management",
                "Dedicated concierge",
                "Custom integrations",
                "SLA guarantee",
            ],
            icon: Crown,
            highlight: false,
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-emerald-950 selection:bg-[#D4AF37] selection:text-white overflow-x-hidden font-sans pb-20">
            {/* Ultra-Fine Grain Texture */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-multiply"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* Ambient Light - Emerald Tinted */}
            <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-emerald-50/80 to-teal-50/50 rounded-full blur-[120px] opacity-60 pointer-events-none" />
            <div className="fixed bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-slate-100 to-emerald-50/50 rounded-full blur-[100px] opacity-60 pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 relative z-10">
                {/* Top Bar */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-32 gap-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="group flex items-center gap-3 hover:bg-transparent pl-0 text-slate-500 hover:text-emerald-950 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-full border-[0.5px] border-emerald-200/60 flex items-center justify-center group-hover:border-emerald-950 group-hover:rotate-45 transition-all duration-700 bg-white/50 backdrop-blur-sm">
                            <ArrowUpRight className="h-3.5 w-3.5 rotate-[225deg]" />
                        </div>
                        <span className="font-light tracking-wide text-sm uppercase">Back</span>
                    </Button>

                    <div className="hidden lg:flex items-center gap-8">
                        <div className="text-xs font-medium text-slate-400 tracking-widest uppercase rotate-90 origin-right translate-x-4">Plans</div>
                        <div className="h-20 w-[0.5px] bg-emerald-200/60" />
                        <div className="text-xs font-medium text-emerald-950 tracking-widest uppercase">Pricing</div>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="relative mb-24">
                    <div className="grid lg:grid-cols-12 gap-8 items-end">
                        <div className="lg:col-span-8 relative z-10">
                            <h1 className="text-[5rem] lg:text-[7.5rem] leading-[0.9] font-medium tracking-tighter text-emerald-950 lg:ml-24">
                                Unlock <br />
                                <span className="font-serif italic font-light text-slate-500 pr-4">
                                    your full
                                </span>
                                potential.
                            </h1>
                        </div>
                        <div className="lg:col-span-4 hidden lg:block text-right">
                            <p className="text-sm text-slate-600 font-light leading-relaxed mb-8">
                                Choose the plan that best fits your learning journey. Upgrade anytime as you grow.
                            </p>
                            <div className="flex items-center justify-end gap-2 text-xs uppercase tracking-widest font-medium text-emerald-950">
                                <span>Monthly</span>
                                <div className="w-8 h-4 bg-emerald-200/60 rounded-full relative mx-2">
                                    <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                                </div>
                                <span className="text-slate-400">Yearly (Soon)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Grid */}
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {plans.map((plan, index) => (
                        <div
                            key={plan.name}
                            className={cn(
                                "relative group transition-all duration-700",
                                plan.highlight ? "lg:-mt-12 z-20" : "z-10"
                            )}
                        >
                            <div className={cn(
                                "p-10 min-h-[600px] flex flex-col justify-between transition-all duration-700",
                                plan.highlight
                                    ? "bg-emerald-950 text-white shadow-[0_20px_80px_rgba(2,44,34,0.4)]"
                                    : "bg-white border-[0.5px] border-emerald-100 hover:border-emerald-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.04)]"
                            )}>
                                <div>
                                    <div className="flex justify-between items-start mb-8">
                                        <div className={cn(
                                            "w-12 h-12 flex items-center justify-center rounded-full border-[0.5px]",
                                            plan.highlight
                                                ? "border-emerald-800 bg-emerald-900 text-[#D4AF37]"
                                                : "border-emerald-100 bg-slate-50 text-emerald-950"
                                        )}>
                                            <plan.icon className="h-5 w-5" />
                                        </div>
                                        {plan.popular && (
                                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] border border-[#D4AF37]/30 px-3 py-1 rounded-full">
                                                Most Popular
                                            </span>
                                        )}
                                    </div>

                                    <h3 className={cn(
                                        "text-3xl font-light mb-2",
                                        plan.highlight ? "text-white" : "text-emerald-950"
                                    )}>
                                        {plan.name}
                                    </h3>
                                    <p className={cn(
                                        "text-sm mb-12 font-light",
                                        plan.highlight ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        {plan.description}
                                    </p>

                                    <div className="mb-12">
                                        <span className={cn(
                                            "text-5xl font-medium tracking-tight",
                                            plan.highlight ? "text-white" : "text-emerald-950"
                                        )}>
                                            {plan.price}
                                        </span>
                                        <span className={cn(
                                            "text-sm ml-2 font-light",
                                            plan.highlight ? "text-slate-400" : "text-slate-400"
                                        )}>
                                            {plan.period}
                                        </span>
                                    </div>

                                    <div className="space-y-4 mb-12">
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <Check className={cn(
                                                    "h-4 w-4 shrink-0",
                                                    plan.highlight ? "text-[#D4AF37]" : "text-emerald-950"
                                                )} />
                                                <span className={cn(
                                                    "text-sm font-light",
                                                    plan.highlight ? "text-slate-300" : "text-slate-600"
                                                )}>
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    className={cn(
                                        "w-full h-14 rounded-none text-xs tracking-widest uppercase transition-all duration-500",
                                        plan.highlight
                                            ? "bg-[#D4AF37] hover:bg-[#C5A028] text-white border-0"
                                            : "bg-transparent border-[0.5px] border-emerald-950 text-emerald-950 hover:bg-emerald-950 hover:text-white",
                                        plan.current && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-emerald-950"
                                    )}
                                    disabled={plan.current}
                                >
                                    {plan.current ? "Current Plan" : "Get Started"}
                                    {!plan.current && <MoveRight className="ml-2 h-3 w-3" />}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ / Additional Info */}
                <div className="mt-32 border-t-[0.5px] border-emerald-100 pt-16">
                    <div className="grid lg:grid-cols-2 gap-16">
                        <div>
                            <h2 className="text-2xl font-light text-emerald-950 mb-4">Enterprise Needs?</h2>
                            <p className="text-slate-600 font-light leading-relaxed max-w-md">
                                For large organizations requiring custom security, SLA, and dedicated support, our enterprise team is ready to assist.
                            </p>
                        </div>
                        <div className="flex items-center justify-start lg:justify-end">
                            <Button variant="link" className="text-emerald-950 hover:text-[#D4AF37] text-lg font-light p-0 h-auto">
                                Contact Sales <ArrowUpRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
