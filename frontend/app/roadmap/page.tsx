"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    const { token } = useAuth();

    useEffect(() => {
        const fetchRoadmap = async () => {
            if (!token) {
                setLoading(false); // Ensure loading is false if no token
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/projects/latest`, {
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
                    // Handle cases where response is not ok, e.g., no roadmap found
                    setRoadmap([]);
                    setStepScores({});
                }
            } catch (error) {
                console.error("Failed to fetch roadmap:", error);
                setRoadmap([]); // Set to empty array on error
                setStepScores({});
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchRoadmap();
        } else {
            setLoading(false); // If no token, stop loading
        }
    }, [token]);

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
                <CardHeader>
                    <CardTitle className="text-2xl">学習ロードマップ</CardTitle>
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
