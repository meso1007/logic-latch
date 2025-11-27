"use client";

import { useState } from "react";
import { Quiz } from "@/src/roadmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";

interface QuizCardProps {
  quiz: Quiz;
}

export function QuizCard({ quiz }: QuizCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const isAnswered = selectedIndex !== null;
  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedIndex(index);
  };

  return (
    <Card className="mt-4 border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-start gap-2 text-slate-800">
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">
            Q
          </span>
          {quiz.question}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 選択肢リスト */}
        <div className="space-y-2">
          {quiz.options.map((option, index) => {
            // 判定ロジック: 回答済みなら、正解/不正解の色をつける
            let optionStyle = "border-slate-200 hover:bg-slate-50"; // デフォルト

            if (isAnswered) {
              if (index === quiz.answer_index) {
                // 正解の選択肢（緑）
                optionStyle = "border-green-500 bg-green-50 text-green-700 ring-1 ring-green-500";
              } else if (index === selectedIndex) {
                // 間違えて選んだ選択肢（赤）
                optionStyle = "border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500";
              } else {
                // その他の選択肢（薄くする）
                optionStyle = "border-slate-100 opacity-50";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleSelect(index)}
                disabled={isAnswered}
                className={cn(
                  "w-full text-left p-3 rounded-lg border text-sm transition-all duration-200 flex justify-between items-center",
                  optionStyle
                )}
              >
                <span>{option}</span>
                {/* アイコン表示 */}
                {isAnswered && index === quiz.answer_index && (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                )}
                {isAnswered && index === selectedIndex && index !== quiz.answer_index && (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* 解説エリア（回答後にふわっと表示） */}
        {isAnswered && (
          <div className="mt-4 p-4 bg-blue-50/80 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-2">
              <Lightbulb className="h-4 w-4" />
              解説
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {quiz.explanation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}