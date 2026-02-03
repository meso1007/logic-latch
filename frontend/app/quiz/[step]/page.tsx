"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from "@/hooks/useTranslations";
import { Quiz } from "@/src/roadmap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, ArrowRight, Home, ArrowLeft, Lock as LockIcon } from "lucide-react";
import { pollJob } from "@/lib/api";

import { API_BASE_URL } from "@/config/api";

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const stepNumber = parseInt(params.step as string);
    const queryProjectId = searchParams.get("projectId");

    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [answeredQuizzes, setAnsweredQuizzes] = useState<boolean[]>([]);
    const [stepTitle, setStepTitle] = useState("");
    const [totalSteps, setTotalSteps] = useState(0);
    const [showFinalResult, setShowFinalResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stepDescription, setStepDescription] = useState("");
    const [allSteps, setAllSteps] = useState<any[]>([]);
    const [stepScores, setStepScores] = useState<any>({});
    const [error, setError] = useState<string | null>(null);

    const { t, locale, isLoaded } = useTranslations("Quiz");

    const { token, user, logout } = useAuth();
    const [projectId, setProjectId] = useState<number | null>(null);

    useEffect(() => {
        const fetchProjectAndStep = async () => {
            if (!token) return;

            try {
                let projectRes;
                if (queryProjectId) {
                    projectRes = await fetch(`${API_BASE_URL}/api/projects/${queryProjectId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                } else {
                    // Fallback to latest if no ID provided
                    projectRes = await fetch(`${API_BASE_URL}/api/projects/latest`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                }

                if (!projectRes.ok) throw new Error("Project not found");
                const projectData = await projectRes.json();
                setProjectId(projectData.id);

                const roadmapData = projectData.roadmap || [];
                setTotalSteps(roadmapData.length);
                setAllSteps(roadmapData);

                // Load step scores
                const scores: any = {};
                roadmapData.forEach((s: any) => {
                    if (s.score) {
                        scores[s.step] = s.score;
                    }
                });
                setStepScores(scores);

                // Now fetch specific step data
                const stepRes = await fetch(`${API_BASE_URL}/api/projects/${projectData.id}/steps/${stepNumber}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (stepRes.ok) {
                    const stepData = await stepRes.json();
                    setStepTitle(stepData.title);
                    setStepDescription(stepData.description);

                    if (stepData.quizzes && stepData.quizzes.length > 0) {
                        setQuizzes(stepData.quizzes);
                        setAnsweredQuizzes(new Array(stepData.quizzes.length).fill(false));
                    } else {
                        // If no quizzes, generate them (fallback or new logic)
                        generateQuizzes(projectData, stepData);
                    }
                } else {
                    // Step might not exist or error
                    console.error("Step fetch failed");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        const generateQuizzes = async (project: any, stepData: any) => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/api/generate-step-quiz`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        goal: project.goal,
                        stack: project.stack,
                        level: project.level,
                        step_number: stepData.step,
                        step_title: stepData.title,
                        step_desc: stepData.description,
                        locale,
                    }),
                });

                if (!response.ok) {
                    throw new Error("Failed to generate quiz");
                }

                const data = await response.json();

                let quizzesData;
                if (response.status === 202) {
                    const result = await pollJob(data.job_id, API_BASE_URL, token || "", logout);
                    quizzesData = result.quizzes;
                } else {
                    quizzesData = data.quizzes;
                }

                setQuizzes(quizzesData);
                setAnsweredQuizzes(new Array(quizzesData.length).fill(false));
            } catch (err) {
                console.error("Error generating quiz:", err);
                setError(t('errorGeneration'));
            } finally {
                setLoading(false);
            }
        };

        if (token && isLoaded) {
            fetchProjectAndStep();
        }
    }, [stepNumber, token, isLoaded, locale]);

    const currentQuiz = quizzes[currentQuizIndex];

    const handleAnswerSelect = (answerIndex: number) => {
        if (!showResult) {
            setSelectedAnswer(answerIndex);
        }
    };

    const handleSubmit = () => {
        if (selectedAnswer === null) return;

        setShowResult(true);
        const newAnsweredQuizzes = [...answeredQuizzes];
        newAnsweredQuizzes[currentQuizIndex] = true;
        setAnsweredQuizzes(newAnsweredQuizzes);

        if (selectedAnswer === currentQuiz.answer_index) {
            setScore(score + 1);
        }
    };

    const handleNext = async () => {
        if (currentQuizIndex < quizzes.length - 1) {
            setCurrentQuizIndex(currentQuizIndex + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            // 最後の問題の場合、結果画面を表示
            setShowFinalResult(true);

            // スコアをDBに保存
            if (token && projectId) {
                try {
                    await fetch(`${API_BASE_URL}/api/projects/${projectId}/steps/${stepNumber}/score`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            score: score,
                            total: quizzes.length,
                            percentage: Math.round((score / quizzes.length) * 100)
                        }),
                    });
                    // Update local state for sidebar
                    setStepScores((prev: any) => ({
                        ...prev,
                        [stepNumber]: {
                            score: score,
                            total: quizzes.length,
                            percentage: Math.round((score / quizzes.length) * 100)
                        }
                    }));
                } catch (error) {
                    console.error("Failed to save score:", error);
                }
            }
        }
    };

    const handlePrevious = () => {
        if (currentQuizIndex > 0) {
            setCurrentQuizIndex(currentQuizIndex - 1);
            setSelectedAnswer(null);
            setShowResult(false);
        }
    };

    const handleBackToRoadmap = () => {
        router.push("/");
    };

    const handleNextStep = () => {
        if (stepNumber < totalSteps) {
            const query = projectId ? `?projectId=${projectId}` : "";
            router.push(`/quiz/${stepNumber + 1}${query}`);
        } else {
            router.push("/");
        }
    };

    const isCorrect = selectedAnswer === currentQuiz?.answer_index;
    const allQuizzesCompleted = answeredQuizzes.every((answered) => answered);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 flex items-center justify-center">
                <Card>
                    <CardContent className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
                        <p className="text-lg font-semibold text-slate-900">{t("generating")}</p>
                        <p className="text-sm text-slate-600 mt-2">{t("waitMoment")}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const isPro = user?.subscription_plan === "pro";
    const isLocked = stepNumber >= 4 && !isPro;

    if (isLocked) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 flex items-center justify-center">
                <Card className="max-w-md w-full text-center p-8 shadow-2xl border-slate-200">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LockIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">
                        {t("paywall.title")}
                    </h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        {t("paywall.description")}
                    </p>
                    <Button
                        onClick={() => router.push("/upgrade")}
                        className="w-full h-12 text-base bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium transition-all shadow-lg hover:shadow-xl"
                    >
                        {t("paywall.button")}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleBackToRoadmap}
                        className="mt-4 text-slate-400 hover:text-slate-600"
                    >
                        {t("backToRoadmap")}
                    </Button>
                </Card>
            </div>
        );
    }

    if (!currentQuiz) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 flex items-center justify-center">
                <Card>
                    <CardContent className="p-6">
                        <p>{t("notFound")}</p>
                        <Button onClick={handleBackToRoadmap} className="mt-4">
                            {t("backToRoadmap")}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Sidebar - Steps List */}
                    <div className="lg:col-span-3">
                        <Card className="sticky top-8">
                            <CardHeader>
                                <CardTitle className="text-lg">{t("learningSteps")}</CardTitle>
                                <CardDescription className="text-xs">{t("progress")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {allSteps.map((step) => (
                                    <div
                                        key={step.step}
                                        className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${step.step === stepNumber
                                            ? "border-slate-900 bg-slate-900 text-white"
                                            : stepScores[step.step]
                                                ? "border-green-200 bg-green-50 hover:border-green-300"
                                                : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}
                                        onClick={() => {
                                            if (step.step !== stepNumber) {
                                                const query = projectId ? `?projectId=${projectId}` : "";
                                                router.push(`/quiz/${step.step}${query}`);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${step.step === stepNumber
                                                ? "bg-white text-slate-900"
                                                : "bg-slate-100 text-slate-700"
                                                }`}>
                                                {step.step}
                                            </span>
                                            <span className="text-sm font-medium flex-1 line-clamp-2">
                                                {step.title}
                                            </span>
                                        </div>
                                        {stepScores[step.step] && step.step !== stepNumber && (
                                            <div className="mt-1 text-xs text-green-600 flex items-center justify-between gap-1">
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    {t("completed")}
                                                </div>
                                                <span className="font-semibold">
                                                    {stepScores[step.step].score}/{stepScores[step.step].total} ({stepScores[step.step].percentage}%)
                                                </span>
                                            </div>
                                        )}
                                        {step.step === stepNumber && (
                                            <div className="mt-1 text-xs text-white/80">
                                                {t("inProgress")}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content - Quiz */}
                    <div className="lg:col-span-9 space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Step {stepNumber}: {stepTitle}</h1>
                                {!showFinalResult && <p className="text-slate-600 mt-1">{t("question")} {currentQuizIndex + 1} / {quizzes.length}</p>}
                            </div>
                            <Button variant="outline" onClick={handleBackToRoadmap} className="gap-2">
                                <Home className="h-4 w-4" />
                                {t("backToRoadmap")}
                            </Button>

                        </div>

                        {!showFinalResult && (
                            <>
                                {/* Progress Bar */}
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                    <div
                                        className="bg-slate-900 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${((currentQuizIndex + 1) / quizzes.length) * 100}%` }}
                                    />
                                </div>

                                {/* Quiz Card */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-xl">{t("question")} {currentQuizIndex + 1}</CardTitle>
                                        <CardDescription className="text-base mt-2">{currentQuiz.question}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <RadioGroup value={selectedAnswer !== null ? selectedAnswer.toString() : ""} onValueChange={(value) => handleAnswerSelect(parseInt(value))}>
                                            {currentQuiz.options.map((option, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all ${showResult
                                                        ? index === currentQuiz.answer_index
                                                            ? "border-green-500 bg-green-50"
                                                            : index === selectedAnswer
                                                                ? "border-red-500 bg-red-50"
                                                                : "border-slate-200"
                                                        : selectedAnswer === index
                                                            ? "border-slate-900 bg-slate-50"
                                                            : "border-slate-200 hover:border-slate-300"
                                                        }`}
                                                >
                                                    <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={showResult} />
                                                    <Label
                                                        htmlFor={`option-${index}`}
                                                        className="flex-1 cursor-pointer font-normal leading-relaxed"
                                                    >
                                                        {option}
                                                    </Label>
                                                    {showResult && index === currentQuiz.answer_index && (
                                                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                    )}
                                                    {showResult && index === selectedAnswer && index !== currentQuiz.answer_index && (
                                                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                                    )}
                                                </div>
                                            ))}
                                        </RadioGroup>

                                        {showResult && (
                                            <div className={`p-4 rounded-lg ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                                                <p className={`font-semibold mb-2 ${isCorrect ? "text-green-900" : "text-red-900"}`}>
                                                    {isCorrect ? t("correct") : t("incorrect")}
                                                </p>
                                                <p className={`text-sm ${isCorrect ? "text-green-800" : "text-red-800"}`}>
                                                    {currentQuiz.explanation}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <Button
                                                variant="outline"
                                                onClick={handlePrevious}
                                                disabled={currentQuizIndex === 0 || showFinalResult}
                                                className="gap-2"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                {t("previous")}
                                            </Button>

                                            {!showResult ? (
                                                <Button
                                                    onClick={handleSubmit}
                                                    disabled={selectedAnswer === null}
                                                    className="bg-slate-900 hover:bg-slate-800"
                                                >
                                                    {t("answer")}
                                                </Button>
                                            ) : currentQuizIndex < quizzes.length - 1 ? (
                                                <Button onClick={handleNext} className="gap-2 bg-slate-900 hover:bg-slate-800">
                                                    {t("next")}
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button onClick={handleNext} className="gap-2 bg-green-600 hover:bg-green-700">
                                                    {t("viewResult")}
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* Final Result Screen */}
                        {showFinalResult && (
                            <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-none shadow-2xl">
                                <CardContent className="p-8">
                                    <div className="text-center space-y-6">
                                        <div>
                                            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-400" />
                                            <h2 className="text-3xl font-bold mb-2">{t("stepCompleted", { step: stepNumber })}</h2>
                                            <p className="text-slate-300">{stepTitle}</p>
                                        </div>

                                        <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                                            <p className="text-slate-300 mb-2">{t("yourScore")}</p>
                                            <p className="text-5xl font-bold mb-2">
                                                {score} / {quizzes.length}
                                            </p>
                                            <p className="text-2xl text-slate-300">
                                                {t("accuracy")}: {Math.round((score / quizzes.length) * 100)}%
                                            </p>
                                        </div>

                                        <div className="pt-4 space-y-3">
                                            {stepNumber < totalSteps ? (
                                                <>
                                                    <Button
                                                        onClick={handleNextStep}
                                                        size="lg"
                                                        className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                                                    >
                                                        {t("nextStep", { step: stepNumber + 1 })}
                                                        <ArrowRight className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        onClick={handleBackToRoadmap}
                                                        variant="outline"
                                                        size="lg"
                                                        className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                                                    >
                                                        {t("backToRoadmap")}
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    onClick={handleBackToRoadmap}
                                                    size="lg"
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                                                >
                                                    <CheckCircle2 className="h-5 w-5" />
                                                    {t("allCompleted")}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
