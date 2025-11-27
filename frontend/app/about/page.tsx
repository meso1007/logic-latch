"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, TrendingUp, CheckCircle2, AlertCircle, Map, Target, Layers, HelpCircle, ChevronRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function LandingPage() {
    const router = useRouter();
    const { t } = useTranslations();
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    // Brand Colors: White & Deep Green
    const gradientText = "bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600";
    const glassCard = "bg-white/60 backdrop-blur-xl border border-emerald-100/50 hover:border-emerald-200/80 transition-all duration-500 shadow-sm hover:shadow-md";

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-50 text-emerald-950 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden font-sans">
            {/* Dynamic Background Mesh (Light Version) */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-emerald-100/40 rounded-full blur-[120px] opacity-60 animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-teal-100/40 rounded-full blur-[120px] opacity-60 animate-pulse delay-1000" />
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-white/80 rounded-full blur-[100px] opacity-50" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center backdrop-blur-md bg-white/50 border-b border-emerald-100/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-950 flex items-center justify-center shadow-lg shadow-emerald-900/10">
                        <span className="text-white font-bold text-lg">R</span>
                    </div>
                    <span className="font-medium tracking-wide text-emerald-950">Reverse Learn</span>
                </div>
                <div className="flex items-center gap-6">
                    <Button variant="ghost" className="hidden md:flex text-slate-500 hover:text-emerald-950 transition-colors hover:bg-emerald-50">
                        {t("menu.help")}
                    </Button>
                    <Button
                        onClick={() => router.push("/login")}
                        className="bg-emerald-950 text-white hover:bg-emerald-900 rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/20"
                    >
                        Login
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col justify-center items-center px-6 pt-20 z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-6xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-100 bg-white/50 backdrop-blur-md shadow-sm"
                    >
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span className="text-xs font-medium tracking-wider uppercase text-emerald-800">Next Gen Learning</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight mb-8 text-emerald-950 leading-[1.1]">
                        {t("landing.hero.title1")} <br className="hidden md:block" />
                        <span className={gradientText}>
                            {t("landing.hero.title2")}
                        </span>
                    </h1>

                    <p className="text-lg md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                        {t("landing.hero.subtitle")}
                    </p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col md:flex-row items-center justify-center gap-6"
                    >
                        <Button
                            onClick={() => router.push("/generate")}
                            className="h-14 px-8 bg-emerald-950 text-white rounded-full text-base font-medium transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-900/20 group border-0"
                        >
                            {t("landing.hero.cta")}
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-14 px-8 border-emerald-200 text-emerald-900 hover:bg-emerald-50 rounded-full text-base font-medium backdrop-blur-sm transition-all duration-300"
                        >
                            {t("landing.hero.secondaryCta")}
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Floating UI Elements (Abstract) */}
                <motion.div
                    style={{ y }}
                    className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-slate-50 to-transparent z-20"
                />
            </section>

            {/* Problem Section (The Trap) */}
            <section className="py-32 relative z-10">
                <div className="max-w-[1200px] mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6 text-emerald-950">
                            {t("landing.problem.title")}
                        </h2>
                        <div className="w-px h-24 bg-gradient-to-b from-emerald-500 to-transparent mx-auto" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: t("landing.problem.p1Title"), desc: t("landing.problem.p1Desc"), icon: AlertCircle },
                            { title: t("landing.problem.p2Title"), desc: t("landing.problem.p2Desc"), icon: Layers },
                            { title: t("landing.problem.p3Title"), desc: t("landing.problem.p3Desc"), icon: HelpCircle }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className={`${glassCard} p-8 rounded-3xl group bg-white`}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-red-50 transition-colors">
                                    <item.icon className="w-6 h-6 text-emerald-600 group-hover:text-red-500 transition-colors" />
                                </div>
                                <h3 className="text-xl font-medium mb-3 text-emerald-950">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Solution Section (The Method) */}
            <section className="py-32 px-6 relative z-10 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-emerald-100/50 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

                <div className="max-w-[1200px] mx-auto">
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div className="space-y-12">
                            <div>
                                <span className="text-emerald-600 font-medium tracking-wider uppercase text-sm mb-4 block">The Solution</span>
                                <h2 className="text-4xl md:text-6xl font-medium text-emerald-950 mb-6 leading-tight">
                                    {t("landing.solution.title")}
                                </h2>
                                <p className="text-xl text-slate-500 font-light leading-relaxed">
                                    {t("landing.solution.subtitle")}
                                </p>
                            </div>

                            <div className="space-y-8">
                                {[
                                    { title: t("landing.solution.s1Title"), desc: t("landing.solution.s1Desc"), icon: Target },
                                    { title: t("landing.solution.s2Title"), desc: t("landing.solution.s2Desc"), icon: Layers },
                                    { title: t("landing.solution.s3Title"), desc: t("landing.solution.s3Desc"), icon: Map }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex gap-6 group"
                                    >
                                        <div className="w-12 h-12 rounded-full border border-emerald-100 flex items-center justify-center shrink-0 group-hover:border-emerald-500/50 transition-colors bg-white">
                                            <item.icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-emerald-950 mb-2">{item.title}</h3>
                                            <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-200/40 to-teal-200/40 rounded-[2rem] blur-2xl" />
                            <div className={`${glassCard} p-8 rounded-[2rem] relative overflow-hidden bg-white/80`}>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
                                {/* Mock UI */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="h-2 w-12 bg-slate-200 rounded-full" />
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600" />
                                    </div>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((_, i) => (
                                            <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-xs font-mono text-emerald-600 shadow-sm">
                                                    0{i + 1}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-2 w-2/3 bg-slate-200 rounded-full" />
                                                    <div className="h-2 w-1/2 bg-slate-100 rounded-full" />
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-300" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                                        <div className="text-xs text-slate-400 font-mono">AI GENERATED ROADMAP</div>
                                        <div className="text-xs text-emerald-600 font-mono">100% PERSONALIZED</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features (Horizontal) */}
            <section className="py-32 bg-emerald-950 relative overflow-hidden text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 via-emerald-950 to-emerald-950" />

                <div className="max-w-[1400px] mx-auto px-6 relative z-10">
                    <div className="mb-24 text-center">
                        <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 text-white">
                            {t("landing.features.title")}
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: "01", title: t("landing.features.step1"), desc: t("landing.features.step1Desc") },
                            { step: "02", title: t("landing.features.step2"), desc: t("landing.features.step2Desc") },
                            { step: "03", title: t("landing.features.step3"), desc: t("landing.features.step3Desc") }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2 }}
                                viewport={{ once: true }}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl" />
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl h-full relative hover:bg-white/10 transition-colors">
                                    <span className="text-6xl font-bold text-white/5 absolute top-6 right-8">{item.step}</span>
                                    <div className="w-12 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 mb-8" />
                                    <h3 className="text-2xl font-medium text-white mb-4">{item.title}</h3>
                                    <p className="text-emerald-100/70 leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-32 px-6 relative z-10">
                <div className="max-w-[1200px] mx-auto">
                    <h2 className="text-3xl font-medium text-center mb-16 text-emerald-950">{t("landing.useCases.title")}</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: t("landing.useCases.c1"), desc: t("landing.useCases.c1Desc") },
                            { title: t("landing.useCases.c2"), desc: t("landing.useCases.c2Desc") },
                            { title: t("landing.useCases.c3"), desc: t("landing.useCases.c3Desc") }
                        ].map((item, i) => (
                            <div key={i} className={`${glassCard} p-8 rounded-2xl text-center hover:-translate-y-1 bg-white`}>
                                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-6" />
                                <h3 className="text-lg font-medium mb-3 text-emerald-950">{item.title}</h3>
                                <p className="text-slate-500 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-32 px-6 relative z-10 bg-slate-50">
                <div className="max-w-[800px] mx-auto">
                    <h2 className="text-3xl font-medium text-center mb-16 text-emerald-950">{t("landing.faq.title")}</h2>
                    <div className="space-y-4">
                        {[
                            { q: t("landing.faq.q1"), a: t("landing.faq.a1") },
                            { q: t("landing.faq.q2"), a: t("landing.faq.a2") },
                            { q: t("landing.faq.q3"), a: t("landing.faq.a3") }
                        ].map((item, i) => (
                            <div key={i} className={`${glassCard} p-6 rounded-xl bg-white`}>
                                <h3 className="text-lg font-medium mb-3 text-emerald-900">{item.q}</h3>
                                <p className="text-slate-500 font-light leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <section className="py-24 px-6 border-t border-emerald-100 relative z-10 bg-white">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-xs font-medium tracking-[0.2em] uppercase text-slate-400 mb-12">
                        {t("landing.socialProof.trustedBy")}
                    </p>
                    <div className="flex justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                        {/* Placeholder Logos */}
                        <div className="h-8 w-24 bg-slate-200 rounded" />
                        <div className="h-8 w-24 bg-slate-200 rounded" />
                        <div className="h-8 w-24 bg-slate-200 rounded" />
                        <div className="h-8 w-24 bg-slate-200 rounded" />
                    </div>
                </div>

                <div className="mt-32 flex flex-col md:flex-row justify-between items-center max-w-[1400px] mx-auto pt-8 border-t border-slate-100">
                    <div className="text-sm text-slate-500">
                        © 2024 Reverse Learn. All rights reserved.
                    </div>
                    <div className="flex gap-8 text-sm text-slate-500 mt-4 md:mt-0">
                        <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
                        <a href="#" className="hover:text-emerald-600 transition-colors">Twitter</a>
                    </div>
                </div>
            </section>
        </div>
    );
}
