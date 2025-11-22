"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown } from "lucide-react";

export default function UpgradePage() {
    const { user } = useAuth();
    const router = useRouter();

    const plans = [
        {
            name: "Free",
            price: "¥0",
            period: "/月",
            description: "個人学習に最適",
            features: [
                "月5プロジェクトまで",
                "基本的なクイズ生成",
                "コミュニティサポート",
            ],
            current: true,
            icon: Sparkles,
            color: "emerald",
        },
        {
            name: "Pro",
            price: "¥980",
            period: "/月",
            description: "本格的な学習者向け",
            features: [
                "無制限プロジェクト",
                "高度なクイズ生成",
                "優先サポート",
                "学習分析ダッシュボード",
                "カスタムテーマ",
            ],
            popular: true,
            icon: Zap,
            color: "blue",
        },
        {
            name: "Enterprise",
            price: "お問い合わせ",
            period: "",
            description: "チーム・企業向け",
            features: [
                "Proの全機能",
                "チーム管理機能",
                "専任サポート",
                "カスタム統合",
                "SLA保証",
            ],
            icon: Crown,
            color: "purple",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        学習をさらに加速させよう
                    </h1>
                    <p className="text-lg text-slate-600">
                        あなたに最適なプランを選んで、学習体験をアップグレード
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-8">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={`relative ${plan.popular
                                    ? "border-2 border-emerald-500 shadow-xl scale-105"
                                    : "border-slate-200"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                        人気No.1
                                    </span>
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <plan.icon className={`h-6 w-6 text-${plan.color}-600`} />
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                </div>
                                <CardDescription>{plan.description}</CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold text-slate-900">
                                        {plan.price}
                                    </span>
                                    <span className="text-slate-600">{plan.period}</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                            <span className="text-slate-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className={`w-full ${plan.current
                                            ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                                            : plan.popular
                                                ? "bg-emerald-600 hover:bg-emerald-700"
                                                : "bg-slate-900 hover:bg-slate-800"
                                        }`}
                                    disabled={plan.current}
                                >
                                    {plan.current ? "現在のプラン" : "アップグレード"}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="border-slate-300"
                    >
                        戻る
                    </Button>
                </div>
            </div>
        </div>
    );
}
