"use client";

import { useState } from "react";
import { RoadmapResponse, Step } from "@/src/roadmap";
import { QuizCard } from "@/components/QuizCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface PlanStep {
  step: number;
  title: string;
}

interface ProposeResponse {
  complexity: string;
  stack: string;
  reason: string;
  steps: PlanStep[];
}

export default function Home() {
  const [goal, setGoal] = useState("");
  const [stack, setStack] = useState("");
  const [level, setLevel] = useState("beginner");
  const [proposedPlan, setProposedPlan] = useState<ProposeResponse | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePropose = async () => {
    if (!goal.trim()) {
      setError("作りたいものを入力してください");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/propose-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          stack: stack.trim() || undefined,
          level,
        }),
      });

      if (!response.ok) {
        throw new Error("プラン提案に失敗しました");
      }

      const data: ProposeResponse = await response.json();
      setProposedPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!proposedPlan) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-roadmap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          stack: proposedPlan.stack,
          level,
          plan_steps: proposedPlan.steps,
        }),
      });

      if (!response.ok) {
        throw new Error("ロードマップ生成に失敗しました");
      }

      const data: RoadmapResponse = await response.json();
      setRoadmap(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">学習ロードマップ生成</h1>
          <p className="text-slate-600">AIがあなたのプロジェクトに最適な学習プランを提案します</p>
        </div>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>プロジェクト情報</CardTitle>
            <CardDescription>作りたいものと技術スタックを入力してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="goal">作りたいもの *</Label>
              <Textarea
                id="goal"
                placeholder="例: タスク管理アプリ、ECサイト、チャットアプリなど"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stack">技術スタック（任意）</Label>
              <Input
                id="stack"
                placeholder="例: React, Node.js, PostgreSQL"
                value={stack}
                onChange={(e) => setStack(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>現在のレベル</Label>
              <RadioGroup value={level} onValueChange={setLevel}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner" className="font-normal cursor-pointer">
                    初心者
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate" className="font-normal cursor-pointer">
                    中級者
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced" className="font-normal cursor-pointer">
                    上級者
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={handlePropose} disabled={loading || !goal.trim()} className="w-full">
              {loading ? "生成中..." : "プランを提案"}
            </Button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proposed Plan */}
        {proposedPlan && (
          <Card>
            <CardHeader>
              <CardTitle>提案されたプラン</CardTitle>
              <CardDescription>
                複雑度: {proposedPlan.complexity} | 技術スタック: {proposedPlan.stack}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {proposedPlan.reason && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-900 font-medium mb-1">選定理由</p>
                  <p className="text-sm text-blue-800">{proposedPlan.reason}</p>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="font-semibold text-slate-800">学習ステップ</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                  {proposedPlan.steps.map((step) => (
                    <li key={step.step} className="pl-2">
                      {step.title}
                    </li>
                  ))}
                </ol>
              </div>

              <Button onClick={handleGenerate} disabled={loading} className="w-full">
                {loading ? "生成中..." : "詳細なロードマップを生成"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Roadmap */}
        {roadmap && (
          <Card>
            <CardHeader>
              <CardTitle>学習ロードマップ</CardTitle>
              <CardDescription>各ステップをクリックして詳細とクイズを確認</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {roadmap.roadmap.map((step: Step) => (
                  <AccordionItem key={step.step} value={`step-${step.step}`}>
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-3">
                        <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded">
                          Step {step.step}
                        </span>
                        <span className="font-semibold">{step.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-slate-700 leading-relaxed">{step.description}</p>
                      </div>
                      <QuizCard quiz={step.quiz} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
