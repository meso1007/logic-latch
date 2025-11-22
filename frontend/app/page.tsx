"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/context/AuthContext";
import { RoadmapResponse, Step } from "@/src/roadmap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [editingPlan, setEditingPlan] = useState<ProposeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const { t, locale } = useTranslations();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProject = async () => {
      const isNew = searchParams.get("new") === "true";
      const editId = searchParams.get("edit_id");

      if (isNew) {
        // Clear form and roadmap
        setGoal("");
        setStack("");
        setLevel("beginner");
        setRoadmap(null);
        setProposedPlan(null); // Clear proposed plan as well
        setEditingPlan(null);
        return;
      }

      if (editId) {
        // Fetch specific project to edit
        try {
          const response = await fetch(`${API_BASE_URL}/api/projects/${editId}`, {
            headers: { Authorization: `Bearer ${token} ` },
          });
          if (response.ok) {
            const data = await response.json();
            setGoal(data.goal);
            setStack(data.stack);
            setLevel(data.level);
            // Don't set roadmap, so user sees the form to regenerate
            setRoadmap(null);
            setProposedPlan(null); // Clear proposed plan
            setEditingPlan(null); // Clear editing plan
          }
        } catch (error) {
          console.error("Failed to fetch project for editing:", error);
        }
        return;
      }

      // Default: fetch latest project
      try {
        const response = await fetch(`${API_BASE_URL}/api/projects/latest?locale=${locale}`, {
          headers: { Authorization: `Bearer ${token} ` },
        });
        if (response.ok) {
          const data = await response.json();
          setRoadmap(data);
          // Also set form values just in case they want to edit latest
          setGoal(data.goal);
          setStack(data.stack);
          setLevel(data.level);
          setProposedPlan(null); // Clear proposed plan
          setEditingPlan(null); // Clear editing plan
        }
      } catch (error) {
        console.error("Failed to fetch latest project:", error);
      }
    };

    fetchProject();
  }, [token, searchParams, router, locale]);

  const handlePropose = async () => {
    if (!goal.trim()) {
      setError(t('Home.errorGoal'));
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
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error(t('Home.errorMessage'));
      }

      const data: ProposeResponse = await response.json();
      setProposedPlan(data);
      setEditingPlan({ ...data }); // 編集用のコピーを作成
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };


  const handleGenerate = async () => {
    if (!editingPlan || !token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-roadmap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token} `,
        },
        body: JSON.stringify({
          goal,
          stack: editingPlan.stack,
          level,
          plan_steps: editingPlan.steps,
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error(t('Home.errorMessage'));
      }

      const data: RoadmapResponse = await response.json();
      setRoadmap(data);
      // No need to save to localStorage anymore
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleStepTitleChange = (stepNumber: number, newTitle: string) => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      steps: editingPlan.steps.map((step) =>
        step.step === stepNumber ? { ...step, title: newTitle } : step
      ),
    });
  };

  const handleStackChange = (newStack: string) => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      stack: newStack,
    });
  };

  const handleAddStep = () => {
    if (!editingPlan || editingPlan.steps.length >= 10) return;
    const newStepNumber = editingPlan.steps.length + 1;
    setEditingPlan({
      ...editingPlan,
      steps: [
        ...editingPlan.steps,
        { step: newStepNumber, title: "" }
      ],
    });
  };

  const handleDeleteStep = (stepNumber: number) => {
    if (!editingPlan || editingPlan.steps.length <= 1) return;
    // ステップを削除して、番号を振り直す
    const newSteps = editingPlan.steps
      .filter((step) => step.step !== stepNumber)
      .map((step, index) => ({ ...step, step: index + 1 }));
    setEditingPlan({
      ...editingPlan,
      steps: newSteps,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">{t('Home.title')}</h1>
          <p className="text-slate-600">{t('Home.subtitle')}</p>
        </div>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Home.projectInfo')}</CardTitle>
            <CardDescription>{t('Home.projectInfoDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="goal">{t('Home.goalLabel')}</Label>
              <Textarea
                id="goal"
                placeholder={t('Home.goalPlaceholder')}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stack">{t('Home.stackLabel')}</Label>
              <Input
                id="stack"
                placeholder={t('Home.stackPlaceholder')}
                value={stack}
                onChange={(e) => setStack(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('Home.levelLabel')}</Label>
              <RadioGroup value={level} onValueChange={setLevel}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner" className="font-normal cursor-pointer">
                    {t('Home.levelBeginner')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate" className="font-normal cursor-pointer">
                    {t('Home.levelIntermediate')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced" className="font-normal cursor-pointer">
                    {t('levelAdvanced')}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={handlePropose} disabled={loading || !goal.trim()} className="w-full">
              {loading ? t('Home.loading') : t('Home.proposeButton')}
            </Button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proposed Plan - Confirmation & Editing */}
        {proposedPlan && editingPlan && (
          <Card>
            <CardHeader>
              <CardTitle>{t('Home.confirmPlanTitle')}</CardTitle>
              <CardDescription>
                {t('Home.confirmPlanDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {proposedPlan.reason && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-900 font-medium mb-1">{t('Home.reasonLabel')}</p>
                  <p className="text-sm text-blue-800">{proposedPlan.reason}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="confirm-stack">{t('Home.confirmStack')}</Label>
                <Input
                  id="confirm-stack"
                  value={editingPlan.stack}
                  onChange={(e) => handleStackChange(e.target.value)}
                  placeholder={t('Home.stackExample')}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {editingPlan.stack.split(',').map((tech, index) => {
                    const trimmedTech = tech.trim();
                    if (!trimmedTech) return null;

                    // 技術名と用途を分離
                    const match = trimmedTech.match(/^([^(]+)(?:\(([^)]+)\))?$/);
                    const techName = match ? match[1].trim() : trimmedTech;
                    const usage = match && match[2] ? match[2].trim() : '';

                    return (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-800 rounded-full text-sm"
                      >
                        <span className="font-semibold">{techName}</span>
                        {usage && (
                          <span className="text-slate-600">({usage})</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500">
                  {t('Home.complexityLabel')}: <span className="font-semibold">{proposedPlan.complexity}</span>
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t('Home.stepsLabel')}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddStep}
                    disabled={editingPlan.steps.length >= 10}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    {t('Home.addStep')}
                  </Button>
                </div>
                <div className="space-y-3">
                  {editingPlan.steps.map((step) => (
                    <div key={step.step} className="flex items-start gap-2">
                      <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1.5 rounded mt-1 min-w-[3rem] text-center">
                        Step {step.step}
                      </span>
                      <Input
                        value={step.title}
                        onChange={(e) => handleStepTitleChange(step.step, e.target.value)}
                        className="flex-1"
                        placeholder={t('Home.stepTitlePlaceholder')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStep(step.step)}
                        disabled={editingPlan.steps.length <= 1}
                        className="mt-1 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        title={t('Home.deleteStepTitle')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {editingPlan.steps.length < 10 && (
                  <p className="text-xs text-slate-500">
                    {t('Home.maxStepsInfo')}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t space-y-3">
                <p className="text-sm font-medium text-slate-700">
                  {t('Home.proceedPrompt')}
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex-1 bg-slate-900 hover:bg-slate-800"
                  >
                    {loading ? t('Home.loading') : t('Home.generateButton')}
                  </Button>
                  <Button
                    onClick={() => {
                      setProposedPlan(null);
                      setEditingPlan(null);
                    }}
                    variant="outline"
                    disabled={loading}
                  >
                    {t('Home.retryButton')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roadmap */}
        {roadmap && (
          <Card>
            <CardHeader>
              <CardTitle>{t('Home.roadmapTitle')}</CardTitle>
              <CardDescription>{t('Home.quizPrompt')}</CardDescription>

              {/* Technology Stack Display */}
              <div className="mt-4 space-y-3 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">{t('Home.usedTech')}</p>
                  <div className="flex flex-wrap gap-2">
                    {editingPlan?.stack.split(',').map((tech, index) => {
                      const trimmedTech = tech.trim();
                      if (!trimmedTech) return null;

                      const match = trimmedTech.match(/^([^(]+)(?:\(([^)]+)\))?$/);
                      const techName = match ? match[1].trim() : trimmedTech;
                      const usage = match && match[2] ? match[2].trim() : '';

                      return (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white rounded-full text-sm"
                        >
                          <span className="font-semibold">{techName}</span>
                          {usage && (
                            <span className="text-slate-300">({usage})</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-600">
                    {t('Home.complexityLabel')}: <span className="font-semibold text-slate-900">{roadmap.complexity || "Medium"}</span>
                  </span>
                  <span className="text-slate-600">
                    {t('Home.stepCount')}: <span className="font-semibold text-slate-900">{(roadmap.roadmap || []).length}</span>
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(roadmap.roadmap || []).map((step: Step) => (
                  <Card key={step.step} className="border-2 hover:border-slate-300 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded">
                              Step {step.step}
                            </span>
                            <h3 className="font-semibold text-lg">{step.title}</h3>
                          </div>
                          <p className="text-slate-700 leading-relaxed mb-4">{step.description}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="bg-slate-100 px-3 py-1 rounded-full">
                              📝 {step.quizzes?.length || 10}{t('Home.quizCountSuffix')}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => router.push(`/quiz/${step.step}`)}
                          className="bg-slate-900 hover:bg-slate-800 whitespace-nowrap"
                        >
                          {t('Home.startQuiz')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
