"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, ArrowUpRight, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/useTranslations";

export default function UpgradePage() {
    const { user } = useAuth();
    const router = useRouter();
    const { t } = useTranslations();

    const plans = [
        {
            key: "free",
            icon: Sparkles,
            highlight: false,
        },
        {
            key: "pro",
            icon: Zap,
            highlight: true,
        },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden font-sans pb-20">
            <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-12 relative z-10">
                {/* Top Bar */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-20 gap-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-slate-900 transition-colors bg-white">
                            <ArrowUpRight className="h-4 w-4 rotate-[225deg]" />
                        </div>
                        <span className="font-medium text-sm">{t("common.back")}</span>
                    </Button>

                    <div className="hidden lg:block">
                        <h1 className="text-4xl font-medium tracking-tight text-slate-900">
                            {t("upgrade.title")}
                        </h1>
                        <p className="text-slate-500 mt-2">
                            {t("upgrade.subtitle")}
                        </p>
                    </div>
                    <div className="w-10" /> {/* Spacer for centering if needed */}
                </div>

                {/* Mobile Title (visible only on small screens) */}
                <div className="lg:hidden mb-12">
                    <h1 className="text-3xl font-medium tracking-tight text-slate-900">
                        {t("upgrade.title")}
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {t("upgrade.subtitle")}
                    </p>
                </div>

                {/* Pricing Grid */}
                <div className="grid lg:grid-cols-2 gap-6 items-stretch max-w-5xl mx-auto">
                    {plans.map((plan) => (
                        <div
                            key={plan.key}
                            className={cn(
                                "relative rounded-3xl p-8 flex flex-col transition-all duration-300",
                                plan.highlight
                                    ? "bg-slate-900 text-white shadow-2xl ring-1 ring-slate-900"
                                    : "bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-md"
                            )}
                        >
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-6">
                                    <plan.icon className={cn(
                                        "h-8 w-8",
                                        plan.highlight ? "text-emerald-400" : "text-emerald-600"
                                    )} />
                                    {plan.highlight && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30">
                                            Recommended
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-2xl font-medium mb-2">
                                    {t(`upgrade.plans.${plan.key}.name`)}
                                </h3>
                                <p className={cn(
                                    "text-sm leading-relaxed mb-8 h-10",
                                    plan.highlight ? "text-slate-400" : "text-slate-500"
                                )}>
                                    {t(`upgrade.plans.${plan.key}.description`)}
                                </p>

                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-medium">
                                        {t(`upgrade.plans.${plan.key}.price`)}
                                    </span>
                                    <span className={cn(
                                        "text-sm",
                                        plan.highlight ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        {t(`upgrade.plans.${plan.key}.period`)}
                                    </span>
                                </div>

                                <Button
                                    className={cn(
                                        "w-full h-12 rounded-full font-medium text-sm transition-all duration-300",
                                        plan.highlight
                                            ? "bg-emerald-500 hover:bg-emerald-400 text-slate-900 border-0"
                                            : "bg-slate-100 hover:bg-slate-200 text-slate-900 border-0",
                                    )}
                                >
                                    {t(`upgrade.plans.${plan.key}.button`)}
                                </Button>
                            </div>

                            <div className={cn(
                                "border-t pt-8 flex-1",
                                plan.highlight ? "border-slate-800" : "border-slate-100"
                            )}>
                                <div className="space-y-4">
                                    {Object.entries(t<Record<string, string>>(`upgrade.plans.${plan.key}.features`, { returnObjects: true })).map(([key, feature]) => (
                                        <div key={key} className="flex items-start gap-3">
                                            <Check className={cn(
                                                "h-5 w-5 shrink-0 mt-0.5",
                                                plan.highlight ? "text-emerald-400" : "text-emerald-600"
                                            )} />
                                            <span className={cn(
                                                "text-sm",
                                                plan.highlight ? "text-slate-300" : "text-slate-600"
                                            )}>
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAQ Link */}
                <div className="mt-20 text-center">
                    <Button variant="link" onClick={() => router.push("/help")} className="text-slate-500 hover:text-slate-900">
                        {t("upgrade.compare")} <MoveRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
