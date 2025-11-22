"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    BookOpen,
    MessageCircle,
    Mail,
    FileText,
    HelpCircle,
    Search,
    ExternalLink
} from "lucide-react";
import { useState } from "react";

export default function HelpPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const faqs = [
        {
            question: "プロジェクトの作成方法は？",
            answer: "ホームページで学習目標、技術スタック、レベルを入力し、「生成」ボタンをクリックしてください。",
        },
        {
            question: "クイズの難易度を変更できますか？",
            answer: "はい、プロジェクト作成時にレベル（初級・中級・上級）を選択することで、クイズの難易度が調整されます。",
        },
        {
            question: "過去のプロジェクトを確認するには？",
            answer: "サイドバーの「History」セクションから過去のプロジェクトにアクセスできます。",
        },
        {
            question: "プロジェクトを編集できますか？",
            answer: "はい、ロードマップページの「設定を編集して再生成」ボタンから編集できます。",
        },
        {
            question: "無料プランの制限は？",
            answer: "無料プランでは月5プロジェクトまで作成できます。無制限に利用したい場合はProプランへのアップグレードをご検討ください。",
        },
    ];

    const resources = [
        {
            title: "ドキュメント",
            description: "詳細な使い方ガイド",
            icon: BookOpen,
            link: "#",
        },
        {
            title: "コミュニティ",
            description: "他のユーザーと交流",
            icon: MessageCircle,
            link: "#",
        },
        {
            title: "お問い合わせ",
            description: "サポートチームに連絡",
            icon: Mail,
            link: "#",
        },
        {
            title: "ブログ",
            description: "最新情報とヒント",
            icon: FileText,
            link: "#",
        },
    ];

    const filteredFaqs = faqs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
                            <HelpCircle className="h-8 w-8 text-emerald-600" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        ヘルプセンター
                    </h1>
                    <p className="text-lg text-slate-600">
                        よくある質問やサポートリソースをご覧ください
                    </p>
                </div>

                {/* Search */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder="質問を検索..."
                            className="pl-10 h-12 text-lg focus-visible:ring-emerald-600"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* FAQs */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                        よくある質問
                    </h2>
                    <div className="space-y-4">
                        {filteredFaqs.map((faq, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600">{faq.answer}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {filteredFaqs.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-slate-500">該当する質問が見つかりませんでした</p>
                        </div>
                    )}
                </div>

                {/* Resources */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                        サポートリソース
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {resources.map((resource, index) => (
                            <Card
                                key={index}
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <resource.icon className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {resource.title}
                                                <ExternalLink className="h-4 w-4 text-slate-400" />
                                            </CardTitle>
                                            <CardDescription>{resource.description}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Contact Support */}
                <Card className="bg-emerald-50 border-emerald-200">
                    <CardHeader>
                        <CardTitle>まだ解決しませんか？</CardTitle>
                        <CardDescription>
                            サポートチームが24時間以内に返信いたします
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                            <Mail className="mr-2 h-4 w-4" />
                            サポートに連絡
                        </Button>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center">
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
