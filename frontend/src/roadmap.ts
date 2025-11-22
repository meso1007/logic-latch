export interface Quiz {
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
}

export interface Step {
  step: number;
  title: string;
  description: string;
  quizzes: Quiz[]; // 10問のクイズ
}

export interface RoadmapResponse {
  complexity: string;
  roadmap: Step[];
}