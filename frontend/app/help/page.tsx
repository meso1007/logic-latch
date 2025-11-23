"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    BookOpen,
    MessageCircle,
    Mail,
    FileText,
    Search,
    Video,
    Zap,
    Users,
    TrendingUp,
    ArrowUpRight,
    Play,
    Sparkles,
    Command,
    MoveRight,
    Crown
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function HelpPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    const categories = [
        { id: "all", name: "All", icon: Sparkles },
        { id: "getting-started", name: "Start", icon: Zap },
        { id: "projects", name: "Projects", icon: FileText },
        { id: "quizzes", name: "Quiz", icon: BookOpen },
        { id: "account", name: "Account", icon: Users },
    ];

    const faqs = [
        {
            category: "getting-started",
            question: "Reverse Learnとは何ですか？",
            answer: "Reverse Learnは、AIを活用してあなたの学習目標に合わせたカスタマイズされた学習ロードマップを生成するプラットフォームです。プロジェクトベースの学習を通じて、効率的にスキルを習得できます。",
        },
        {
            category: "getting-started",
            question: "どのように始めればいいですか？",
            answer: "まずアカウントを作成し、ホームページで「作りたいもの」を入力してください。AIが最適な技術スタックと学習ステップを提案します。その後、各ステップのクイズに挑戦しながら学習を進めていきます。",
        },
        {
            category: "projects",
            question: "プロジェクトの作成方法は？",
            answer: "ホームページで学習目標、技術スタック（任意）、現在のレベルを入力し、「プランを提案」ボタンをクリックしてください。AIが提案したプランを確認・編集した後、「このプランで進める」をクリックすると詳細なロードマップが生成されます。",
        },
        {
            category: "projects",
            question: "プロジェクトを編集できますか？",
            answer: "はい、ロードマップページの「設定を編集して再生成」ボタンから編集できます。技術スタックや学習ステップを変更して、あなたのニーズに合わせてカスタマイズできます。",
        },
        {
            category: "projects",
            question: "過去のプロジェクトを確認するには？",
            answer: "サイドバーの「History」セクションから過去のプロジェクトにアクセスできます。検索機能を使って特定のプロジェクトを素早く見つけることもできます。",
        },
        {
            category: "quizzes",
            question: "クイズの難易度を変更できますか？",
            answer: "はい、プロジェクト作成時にレベル（初心者・中級者・上級者）を選択することで、クイズの難易度が自動的に調整されます。初心者向けは基本的な概念、上級者向けはパフォーマンス最適化やセキュリティなど高度な内容が含まれます。",
        },
        {
            category: "quizzes",
            question: "クイズの結果はどこで確認できますか？",
            answer: "各ステップのクイズを完了すると、スコアと正解率が表示されます。ロードマップページでは各ステップの完了状況とスコアを一覧で確認できます。",
        },
        {
            category: "quizzes",
            question: "クイズは何問ありますか？",
            answer: "各ステップには10問の4択クイズが用意されています。問題は段階的に難易度が上がり、基礎から応用まで幅広くカバーしています。",
        },
        {
            category: "account",
            question: "無料プランの制限は？",
            answer: "無料プランでは月5プロジェクトまで作成できます。無制限に利用したい場合や、優先サポート、高度な分析機能をご希望の場合は、Proプランへのアップグレードをご検討ください。",
        },
        {
            category: "account",
            question: "プロフィール情報を変更するには？",
            answer: "設定ページからユーザー名、プロフィール画像を変更できます。サイドバーのユーザーメニューから「設定」を選択してください。",
        },
        {
            category: "account",
            question: "言語設定を変更できますか？",
            answer: "はい、サイドバーの上部にある言語切り替えボタンから、日本語と英語を切り替えることができます。設定は自動的に保存されます。",
        },
    ];

    const tutorials = [
        {
            title: "Quick Start",
            description: "5分で始める Reverse Learn",
            duration: "5:23",
            image: "bg-[#F5F5F0]",
            icon: Zap
        },
        {
            title: "Projects",
            description: "最適な学習プランを作成するコツ",
            duration: "8:15",
            image: "bg-[#F0F2F5]",
            icon: FileText
        },
        {
            title: "Mastery",
            description: "学習効果を最大化する方法",
            duration: "6:42",
            image: "bg-[#F0F5F2]",
            icon: TrendingUp
        },
    ];

    const filteredFaqs = faqs.filter((faq) => {
        const matchesSearch =
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-50 text-emerald-950 selection:bg-[#D4AF37] selection:text-white overflow-x-hidden font-sans">
            {/* Ultra-Fine Grain Texture */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-multiply"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* Sophisticated Ambient Light - Emerald Tinted */}
            <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-emerald-50/80 to-teal-50/50 rounded-full blur-[120px] opacity-60 pointer-events-none" />
            <div className="fixed bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-slate-100 to-emerald-50/50 rounded-full blur-[100px] opacity-60 pointer-events-none" />

            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12 relative z-10">

                {/* Header */}
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
                        <div className="text-xs font-medium text-slate-400 tracking-widest uppercase rotate-90 origin-right translate-x-4">Support</div>
                        <div className="h-20 w-[0.5px] bg-emerald-200/60" />
                        <div className="text-xs font-medium text-emerald-950 tracking-widest uppercase">Concierge</div>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="relative mb-48">
                    <div className="grid lg:grid-cols-12 gap-8 items-end">
                        <div className="lg:col-span-8 relative z-10">
                            <h1 className="text-[5rem] lg:text-[7.5rem] leading-[0.9] font-medium tracking-tighter mb-16 text-emerald-950 lg:ml-24">
                                We are here <br />
                                <span className="font-serif italic font-light text-slate-500 pr-4">
                                    to assist
                                </span>
                                you.
                            </h1>

                            {/* Refined Search Bar */}
                            <div className="relative max-w-2xl lg:ml-24 lg:-mt-12 group">
                                <div className="absolute -inset-2 bg-gradient-to-r from-[#D4AF37]/10 to-emerald-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <div className="relative bg-white rounded-full shadow-[0_2px_40px_rgba(0,0,0,0.04)] border-[0.5px] border-emerald-100 p-2 pl-8 flex items-center transition-all duration-700 group-hover:shadow-[0_4px_60px_rgba(0,0,0,0.06)] group-hover:border-emerald-200">
                                    <Search className="h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search for assistance..."
                                        className="border-0 shadow-none focus-visible:ring-0 text-base h-12 bg-transparent placeholder:text-slate-400 font-light tracking-wide text-emerald-950"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button className="h-10 w-10 bg-emerald-950 rounded-full flex items-center justify-center text-white hover:bg-[#D4AF37] transition-colors duration-500">
                                        <MoveRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Element - Minimalist */}
                        <div className="lg:col-span-4 hidden lg:block relative">
                            <div className="absolute -top-32 -right-16 w-64 h-64 border-[0.5px] border-emerald-100 rounded-full animate-[spin_80s_linear_infinite]" />
                            <div className="absolute -top-16 -right-32 w-48 h-48 border-[0.5px] border-emerald-100 rounded-full animate-[spin_60s_linear_infinite_reverse]" />

                            <div className="text-right relative z-10">
                                <div className="text-5xl font-light tracking-tighter mb-3 font-serif italic text-emerald-950">98<span className="text-2xl not-italic ml-1">%</span></div>
                                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] border-t-[0.5px] border-emerald-200 pt-4 inline-block min-w-[100px]">Satisfaction</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Layout */}
                <div className="flex flex-col lg:flex-row gap-24 mb-32">

                    {/* Navigation */}
                    <div className="lg:w-1/4">
                        <div className="sticky top-12 space-y-10">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Categories</h3>
                            <div className="flex flex-col items-start gap-5">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={cn(
                                            "group flex items-center gap-4 text-lg transition-all duration-500",
                                            selectedCategory === category.id
                                                ? "text-emerald-950 font-medium translate-x-4"
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <span className={cn(
                                            "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                            selectedCategory === category.id ? "bg-[#D4AF37] scale-125" : "bg-emerald-200 group-hover:bg-emerald-400"
                                        )} />
                                        <span className="tracking-tight">{category.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Premium Card */}
                            <div className="mt-24 p-8 bg-emerald-950 text-white rounded-none relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-700">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-emerald-900 opacity-0 group-hover:opacity-20 transition-opacity duration-700" />
                                <div className="relative z-10">
                                    <Crown className="h-5 w-5 text-[#D4AF37] mb-4" />
                                    <div className="text-[10px] font-medium text-emerald-200 tracking-[0.2em] uppercase mb-3">Premium</div>
                                    <div className="text-xl font-light leading-snug mb-6 font-serif italic">Unlock your full potential.</div>
                                    <ArrowUpRight className="h-4 w-4 text-[#D4AF37]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lg:w-3/4">
                        {/* FAQ Section */}
                        <div className="mb-40">
                            {filteredFaqs.length > 0 ? (
                                <div className="space-y-0">
                                    {filteredFaqs.map((faq, index) => (
                                        <Accordion key={index} type="single" collapsible>
                                            <AccordionItem value={`item-${index}`} className="border-b-[0.5px] border-emerald-100 last:border-0">
                                                <AccordionTrigger className="hover:no-underline py-8 group">
                                                    <div className="flex items-baseline gap-12 w-full pr-8">
                                                        <span className="text-[10px] font-medium text-emerald-200 tracking-widest font-mono">{(index + 1).toString().padStart(2, '0')}</span>
                                                        <span className="text-xl lg:text-2xl font-light text-emerald-950 group-hover:translate-x-2 transition-transform duration-700 text-left leading-tight tracking-tight">
                                                            {faq.question}
                                                        </span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="text-slate-600 text-sm leading-loose pb-12 pl-16 lg:pl-20 max-w-2xl font-light">
                                                    {faq.answer}
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center lg:text-left">
                                    <p className="text-xl text-slate-400 font-light italic font-serif">No results found.</p>
                                </div>
                            )}
                        </div>

                        {/* Tutorials Section */}
                        <div className="relative w-[100vw] lg:w-auto left-[50%] right-[50%] mx-[-50vw] lg:mx-0 lg:left-0 lg:right-0 px-6 lg:px-0 mb-40">
                            <div className="flex justify-between items-end mb-16 lg:px-0 max-w-[1600px] mx-auto border-b-[0.5px] border-emerald-100 pb-6">
                                <h2 className="text-3xl font-light tracking-tight text-emerald-950">Video Guides</h2>
                                <Button variant="link" className="text-emerald-950 hover:text-[#D4AF37] transition-colors font-light tracking-wide">View all</Button>
                            </div>

                            <div className="flex gap-10 overflow-x-auto pb-12 snap-x lg:px-0 max-w-[1600px] mx-auto no-scrollbar">
                                {tutorials.map((tutorial, index) => (
                                    <div
                                        key={index}
                                        className="min-w-[280px] lg:min-w-[360px] snap-start group cursor-pointer"
                                    >
                                        <div className={cn("aspect-[16/10] mb-6 relative overflow-hidden transition-all duration-1000", tutorial.image)}>
                                            <div className="absolute inset-0 bg-emerald-950/0 group-hover:bg-emerald-950/5 transition-colors duration-700" />
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-emerald-950 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-700">
                                                <Play className="h-3 w-3 text-emerald-950 fill-emerald-950 ml-0.5" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-medium mb-2 text-emerald-950 group-hover:text-[#D4AF37] transition-colors duration-500">{tutorial.title}</h3>
                                                <p className="text-xs text-slate-500 tracking-wide">{tutorial.description}</p>
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-400 border border-emerald-100 px-2 py-1 rounded-full">{tutorial.duration}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer / Contact */}
                        <div className="border-t-[0.5px] border-emerald-100 pt-24 pb-12">
                            <div className="grid lg:grid-cols-2 gap-16">
                                <div>
                                    <h2 className="text-2xl font-light mb-8 text-emerald-950">Still need assistance?</h2>
                                    <p className="text-slate-600 mb-10 max-w-md text-sm leading-relaxed font-light">
                                        Our concierge team is available 24/7 to ensure your experience is flawless.
                                    </p>
                                    <Button className="bg-emerald-950 text-white hover:bg-emerald-900 rounded-none px-10 py-6 text-sm tracking-widest uppercase transition-colors duration-500">
                                        Contact Concierge
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-12 text-xs text-slate-500">
                                    <div className="space-y-6">
                                        <div className="font-bold text-emerald-950 uppercase tracking-[0.2em] mb-8">Legal</div>
                                        <a href="#" className="block hover:text-emerald-950 transition-colors duration-300">Privacy Policy</a>
                                        <a href="#" className="block hover:text-emerald-950 transition-colors duration-300">Terms of Service</a>
                                        <a href="#" className="block hover:text-emerald-950 transition-colors duration-300">Cookie Policy</a>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="font-bold text-emerald-950 uppercase tracking-[0.2em] mb-8">Social</div>
                                        <a href="#" className="block hover:text-emerald-950 transition-colors duration-300">Twitter</a>
                                        <a href="#" className="block hover:text-emerald-950 transition-colors duration-300">GitHub</a>
                                        <a href="#" className="block hover:text-emerald-950 transition-colors duration-300">Discord</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
