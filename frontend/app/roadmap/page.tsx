"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, ArrowLeft } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function RoadmapPage() {
    const [roadmap, setRoadmap] = useState<any[]>([]);
    const [stepScores, setStepScores] = useState<Record<number, any>>({});
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const projectId = searchParams.get("id");
    const { token } = useAuth();

    useEffect(() => {
        const fetchRoadmap = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Determine endpoint based on projectId presence
                const endpoint = projectId
                    ? `${API_BASE_URL}/api/projects/${projectId}` // We need to implement this or reuse latest logic? 
                    // Actually, we don't have /api/projects/:id yet. We only have /api/projects/latest.
                    // Wait, the plan said "Update RoadmapPage to check for a projectId query parameter".
                    // But we didn't add GET /api/projects/:id in backend yet.
                    // Let's use the existing /api/projects/latest for now if no ID, 
                    // BUT we need GET /api/projects/:id for specific history items.
                    // I missed adding GET /api/projects/:id in the backend plan step.
                    // I should add it now.
                    : `${API_BASE_URL}/api/projects/latest`;

                // Wait, I can't call a non-existent endpoint. 
                // I need to add GET /api/projects/:id to backend first.
                // For now, let's assume I will add it next.

                // Actually, I should pause this edit and add the backend endpoint first.
                // But I can write the frontend code assuming the endpoint will exist.

                const response = await fetch(endpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    const roadmapData = data.roadmap || [];
                    setRoadmap(roadmapData);

                    // Map scores
                    const scores: any = {};
                    roadmapData.forEach((s: any) => {
                        if (s.score) {
                            scores[s.step] = s.score;
                        }
                    });
                    setStepScores(scores);
                } else {
                    setRoadmap([]);
                    setStepScores({});
                }
            } catch (error) {
                console.error("Failed to fetch roadmap:", error);
                setRoadmap([]);
                setStepScores({});
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchRoadmap();
        } else {
            setLoading(false);
        }
    }, [token, projectId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">ロードマップを読み込み中...</p>
            </div>
        );
    }

    if (!roadmap || roadmap.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-600">ロードマップがありません。ホームで作成してください。</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl">学習ロードマップ</CardTitle>
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/?edit_id=${projectId || ""}`)}
                    >
                        設定を編集して再生成
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {roadmap.map((step: any) => (
                        <div key={step.step} className="flex items-center justify-between p-3 border rounded-lg">
                            <Link href={`/quiz/${step.step}`} className="flex-1 font-medium">
                                Step {step.step}: {step.title}
                            </Link>
                            {stepScores[step.step] && (
                                <div className="flex items-center gap-1 text-sm text-green-600">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {stepScores[step.step].score}/{stepScores[step.step].total} ({stepScores[step.step].percentage}%)
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
