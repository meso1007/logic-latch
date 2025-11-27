"use client";

import React, { useState } from 'react';
import { ArrowLeft, Check, Loader2, Lock } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from '@/hooks/useTranslations';
import Image from 'next/image';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// --- Animation Variants ---

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 80,
            damping: 15
        }
    }
};

const cardVariants: Variants = {
    hidden: { scale: 0.95, opacity: 0, x: -20 },
    visible: {
        scale: 1,
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1]
        }
    }
};

// --- Components ---

const Logo = () => (
    <motion.div
        className="flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
    >
        <div className="relative w-10 h-10">
            <Image src="/logo.png" alt="LogicLatch AI" fill className="object-contain" />
        </div>
    </motion.div>
);

const NavHeader = () => {
    const { t } = useTranslations("common");
    return (
        <motion.nav
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 w-full max-w-[1920px] mx-auto"
        >
            <div className="flex items-center gap-3">
                <Logo />
                <span className="font-bold text-xl tracking-tight text-slate-900">LogicLatch AI</span>
            </div>

            <div className="flex items-center gap-4">
                <LanguageSwitcher />

            </div>
        </motion.nav>
    );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}

const InputField = ({ label, id, ...props }: InputProps) => (
    <motion.div variants={itemVariants} className="space-y-2 group">
        <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase tracking-wider block transition-colors group-focus-within:text-[#10b981]">
            {label}
        </label>
        <motion.div
            className="relative"
            whileHover={{ scale: 1.01 }}
        >
            <input
                id={id}
                className="w-full bg-white border-2 border-slate-100 rounded-lg px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] focus:outline-none transition-all duration-300 shadow-sm"
                {...props}
            />
            {/* Decorative focus glow line */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-[#10b981] w-0 group-focus-within:w-full transition-all duration-500 rounded-b-lg"></div>
        </motion.div>
    </motion.div>
);

// --- Main Page ---

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { login } = useAuth();
    const router = useRouter();
    const { t } = useTranslations("auth");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }

            const data = await response.json();
            login(data.token, data.user);
        } catch (err) {
            setError("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative overflow-hidden">
            <NavHeader />

            <div className="flex-1 flex items-center justify-center p-4 pt-20 md:p-8 md:pt-24 lg:p-12">
                <div className="w-full max-w-[1600px] grid lg:grid-cols-2 gap-8 lg:gap-20 items-stretch">

                    {/* Left Column: Image Card */}
                    <motion.div
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        className="hidden lg:flex relative rounded-[2.5rem] overflow-hidden min-h-[600px] bg-[#0f172a] shadow-2xl shadow-emerald-900/10"
                    >
                        {/* Image Layer with Duotone Effect */}
                        <motion.img
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 2.5, ease: "easeOut" }}
                            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop"
                            alt="Coding"
                            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
                        />

                        {/* Halftone texture overlay simulation */}
                        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] pointer-events-none"></div>

                        {/* Gradient for text legibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>

                        {/* Content Overlay */}
                        <div className="relative z-10 p-12 flex flex-col justify-end h-full w-full">
                            <motion.h1
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                                className="font-display font-black text-5xl xl:text-7xl leading-[1.1] text-white drop-shadow-lg"
                            >
                                {String(t("masterLogic"))}<br />
                                <span className="text-[#10b981]">{String(t("buildFuture"))}</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                                className="mt-6 text-slate-300 text-lg max-w-md"
                            >
                                {t("loginHeroText")}
                            </motion.p>
                        </div>
                    </motion.div>

                    {/* Right Column: Form */}
                    <div className="flex flex-col justify-center max-w-xl w-full mx-auto lg:mx-0">

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Back Nav / Review Pill */}
                            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
                                <motion.button
                                    onClick={() => router.push("/")}
                                    whileHover={{ scale: 1.1, rotate: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                >
                                    <ArrowLeft size={20} strokeWidth={3} />
                                </motion.button>
                                <div className="px-5 py-2 rounded-full bg-white text-slate-600 text-xs font-bold tracking-wide uppercase border border-slate-200 shadow-sm">
                                    {t("welcomeBack")}
                                </div>
                            </motion.div>

                            {/* Headers */}
                            <motion.div variants={itemVariants} className="mb-8">
                                <h2 className="font-display font-black text-4xl md:text-5xl text-slate-900 mb-3 tracking-wide">
                                    {t("loginTitle")}<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">LogicLatch</span>
                                </h2>
                                <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                                    {t("loginSubtitle")}
                                </p>
                                <div className="mt-4 text-sm text-slate-500">
                                    {t("noAccount")} <a href="/signup" className="text-[#10b981] hover:underline font-bold transition-all hover:text-[#34d399]">{t("signupButton")}</a>
                                </div>
                            </motion.div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">

                                <InputField
                                    label={t("email")}
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder={t("emailPlaceholder")}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                <InputField
                                    label={t("password")}
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder={t("passwordPlaceholder")}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {/* Submit Button */}
                                <motion.button
                                    variants={itemVariants}
                                    type="submit"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full relative overflow-hidden bg-[#10b981] text-white font-bold py-4 rounded-full uppercase tracking-wide text-sm flex items-center justify-center gap-2 mt-4 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all duration-300"
                                >
                                    {/* Subtle shimmer effect */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent z-0"></div>

                                    <div className="relative z-10 flex items-center gap-2">
                                        {loading && <Loader2 className="animate-spin" size={20} />}
                                        {loading ? t("loginLoading") : t("loginButton")}
                                    </div>
                                </motion.button>

                                <motion.div variants={itemVariants} className="text-center mt-8 pb-4">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
                                        {t("copyright")}
                                    </p>
                                </motion.div>

                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
