package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github/meso1007/reverse-learn/backend/internal/models"

	"github.com/google/generative-ai-go/genai"
	"gorm.io/gorm"
)

type Worker struct {
	DB       *gorm.DB
	GenModel *genai.GenerativeModel
	JobQueue chan uint
}

func NewWorker(db *gorm.DB, model *genai.GenerativeModel, queueSize int) *Worker {
	return &Worker{
		DB:       db,
		GenModel: model,
		JobQueue: make(chan uint, queueSize),
	}
}

func (w *Worker) Start() {
	go func() {
		// Rate Limiter: Ensure at least 2 seconds between API calls
		var lastCallTime time.Time

		for jobID := range w.JobQueue {
			// Wait if necessary to respect rate limit
			if time.Since(lastCallTime) < 2*time.Second {
				time.Sleep(2*time.Second - time.Since(lastCallTime))
			}

			var job models.Job
			if err := w.DB.First(&job, jobID).Error; err != nil {
				log.Printf("Worker: Job %d not found", jobID)
				continue
			}

			// Update status to processing
			job.Status = "processing"
			w.DB.Save(&job)

			log.Printf("Worker: Processing job %d (%s)", job.ID, job.Type)

			var result []byte
			var err error

			ctx := context.Background()

			// Process based on type
			switch job.Type {
			case "propose_plan":
				var req models.ProposeRequest
				json.Unmarshal(job.Input, &req)

				// Reconstruct prompt logic
				stackInfo := req.Stack
				if stackInfo == "" {
					stackInfo = "未指定（AIが最適なものを提案）"
				}
				var prompt string
				if req.Locale == "en" {
					prompt = fmt.Sprintf(`
You are an expert engineering mentor.
Based on the user's request below, analyze the project complexity and propose the optimal tech stack and learning steps.

# User Request
- Goal: %s
- Preferred Stack: %s
- Current Level: %s

# Tasks
1. Adjust project complexity based on user level:
   - beginner: Focus on basic implementation with simple features (Low-Medium)
   - intermediate: Include practical features and best practices (Medium-High)
   - advanced: Include advanced features, scalability, and performance optimization (High)

2. Propose the optimal tech stack (respect user preference if specified)
   **Important**: Specify the usage of each technology in parentheses
   Example: "React (Frontend), Node.js (Backend API), PostgreSQL (Database), Redis (Cache)"

3. Briefly explain the reason for selection (including complexity adjustment based on level)

4. Create 3-7 learning step titles based on complexity and level:
   - Beginner: 3-4 steps (Focus on basics)
   - Intermediate: 4-5 steps (Practical features)
   - Advanced: 5-7 steps (Advanced features and optimization)

5. **The last step must be "Security and Vulnerability Measures"**

# Output JSON Format
{
  "complexity": "Medium",
  "stack": "React (Frontend), Node.js (Backend API), PostgreSQL (Database)",
  "reason": "Considering beginner level, I chose a simple configuration focusing on basic CRUD operations...",
  "steps": [
    {"step": 1, "title": "Environment Setup and Project Initialization"},
    {"step": 2, "title": "Basic Feature Implementation"},
    {"step": 3, "title": "Security and Vulnerability Measures"}
  ]
}
`, req.Goal, stackInfo, req.Level)
				} else {
					prompt = fmt.Sprintf(`
あなたは熟練のエンジニアメンターです。
ユーザーの以下の要望に基づき、プロジェクトの複雑度を分析し、最適な技術スタックと学習ステップを提案してください。

# ユーザーの要望
- 作りたいもの: %s
- 希望する技術スタック: %s
- 現在のレベル: %s

# タスク
1. ユーザーのレベルに応じてプロジェクトの複雑度を調整してください：
   - beginner（初心者）: シンプルな機能に絞り、基礎的な実装を重視（Low〜Medium）
   - intermediate（中級者）: 実用的な機能を含め、ベストプラクティスを学ぶ（Medium〜High）
   - advanced（上級者）: 高度な機能、スケーラビリティ、パフォーマンス最適化を含む（High）

2. 最適な技術スタックを提案してください（ユーザーが指定した場合はそれを尊重）
   **重要**: 各技術の後ろに括弧で用途を明記してください
   例: "React (フロントエンド), Node.js (バックエンドAPI), PostgreSQL (データベース), Redis (キャッシュ)"

3. 選定理由を簡潔に説明してください（レベルに応じた複雑度の調整理由も含める）

4. プロジェクトの複雑さとレベルに応じて、3〜7ステップの学習プランのタイトルのみを作成してください
   - 初心者: 3〜4ステップ（基礎に集中）
   - 中級者: 4〜5ステップ（実践的な機能）
   - 上級者: 5〜7ステップ（高度な機能と最適化）

5. **最後のステップは必ず「セキュリティと脆弱性対策」にしてください**

# 出力JSONフォーマット
{
  "complexity": "Medium",
  "stack": "React (フロントエンド), Node.js (バックエンドAPI), PostgreSQL (データベース)",
  "reason": "初心者レベルを考慮し、基本的なCRUD操作に焦点を当てたシンプルな構成にしました。Reactは...",
  "steps": [
    {"step": 1, "title": "環境構築とプロジェクトセットアップ"},
    {"step": 2, "title": "基本機能の実装"},
    {"step": 3, "title": "セキュリティと脆弱性対策"}
  ]
}
`, req.Goal, stackInfo, req.Level)
				}

				resp, genErr := w.GenModel.GenerateContent(ctx, genai.Text(prompt))
				if genErr != nil {
					err = genErr
				} else if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
					err = fmt.Errorf("empty response")
				} else {
					if txt, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
						result = []byte(txt)
					} else {
						err = fmt.Errorf("unexpected response format")
					}
				}

			case "generate_roadmap":
				var req models.GenerateRequest
				json.Unmarshal(job.Input, &req)

				stepsText := ""
				for _, step := range req.PlanSteps {
					stepsText += fmt.Sprintf("  - Step %d: %s\n", step.Step, step.Title)
				}

				var prompt string
				if req.Locale == "en" {
					prompt = fmt.Sprintf(`
You are an expert engineering mentor.
Based on the user's request below, create a learning roadmap.

# User Request
- Goal: %s
- Tech Stack: %s
- Current Level: %s

# Learning Steps (Follow these steps)
%s

# Rules
1. Create detailed descriptions for each step following the steps above.

2. **Do NOT include any quizzes.** Quizzes will be generated separately on demand.
   Set quizzes to an empty array [] for all steps.

# Output JSON Format
{
  "roadmap": [
    {
      "step": 1,
      "title": "Environment Setup and Project Initialization",
      "description": "Install Node.js, create React project...",
      "quizzes": []
    },
    {
      "step": 2,
      "title": "Basic Feature Implementation",
      "description": "...",
      "quizzes": []
    }
  ]
}
`, req.Goal, req.Stack, req.Level, stepsText)
				} else {
					prompt = fmt.Sprintf(`
あなたは熟練のエンジニアメンターです。
ユーザーの以下の要望に基づき、学習ロードマップを作成してください。

# ユーザーの要望
- 作りたいもの: %s
- 技術スタック: %s
- 現在のレベル: %s

# 学習ステップ（このステップに従ってください）
%s

# ルール
1. 上記のステップに従って、各ステップの詳細な説明を作成してください。

2. **クイズは含めないでください。** クイズは別途オンデマンドで生成されます。
   全てのステップでquizzesは空の配列[]にしてください。

# 出力JSONフォーマット
{
  "roadmap": [
    {
      "step": 1,
      "title": "環境構築とプロジェクトセットアップ",
      "description": "Node.jsのインストール、Reactプロジェクトの作成...",
      "quizzes": []
    },
    {
      "step": 2,
      "title": "基本機能の実装",
      "description": "...",
      "quizzes": []
    }
  ]
}
`, req.Goal, req.Stack, req.Level, stepsText)
				}

				resp, genErr := w.GenModel.GenerateContent(ctx, genai.Text(prompt))
				if genErr != nil {
					err = genErr
				} else if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
					err = fmt.Errorf("empty response")
				} else {
					if txt, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
						generatedText := string(txt)

						// Clean JSON string
						jsonStr := generatedText
						if len(jsonStr) > 7 && jsonStr[:7] == "```json" {
							jsonStr = jsonStr[7:]
						}
						if len(jsonStr) > 3 && jsonStr[len(jsonStr)-3:] == "```" {
							jsonStr = jsonStr[:len(jsonStr)-3]
						}

						// Parse Roadmap
						var roadmapResp models.RoadmapResponse
						if parseErr := json.Unmarshal([]byte(jsonStr), &roadmapResp); parseErr != nil {
							err = fmt.Errorf("failed to parse roadmap json: %v", parseErr)
						} else {
							// Save to DB
							project := models.Project{
								UserID:    job.UserID,
								Goal:      req.Goal,
								Stack:     req.Stack,
								Level:     req.Level,
								Locale:    req.Locale,
								CreatedAt: time.Now(),
							}
							if createErr := w.DB.Create(&project).Error; createErr != nil {
								err = fmt.Errorf("failed to create project: %v", createErr)
							} else {
								// Save steps and quizzes
								var stepsResp []models.StepResponse

								for _, s := range roadmapResp.Roadmap {
									step := models.Step{
										ProjectID:   project.ID,
										StepNumber:  s.Step,
										Title:       s.Title,
										Description: s.Description,
									}
									w.DB.Create(&step)

									for _, q := range s.Quizzes {
										optionsBytes, _ := json.Marshal(q.Options)
										quiz := models.Quiz{
											StepID:      step.ID,
											Question:    q.Question,
											Options:     optionsBytes,
											AnswerIndex: q.AnswerIndex,
											Explanation: q.Explanation,
										}
										w.DB.Create(&quiz)
									}

									stepsResp = append(stepsResp, models.StepResponse{
										Step:        s.Step,
										Title:       s.Title,
										Description: s.Description,
										IsCompleted: false,
										Score:       nil,
									})
								}

								// Return result with Project ID
								resultMap := map[string]interface{}{
									"id":      project.ID,
									"goal":    project.Goal,
									"stack":   project.Stack,
									"level":   project.Level,
									"roadmap": stepsResp,
								}
								result, _ = json.Marshal(resultMap)
							}
						}
					} else {
						err = fmt.Errorf("unexpected response format")
					}
				}

			case "generate_quiz":
				var req models.GenerateStepQuizRequest
				json.Unmarshal(job.Input, &req)

				var prompt string
				if req.Locale == "en" {
					prompt = fmt.Sprintf(`
You are an expert engineering mentor.
Create 10 multiple-choice quizzes to check understanding for the following learning step.

# Project Info
- Goal: %s
- Tech Stack: %s
- Level: %s

# Target Step
- Step %d: %s
- Content: %s

# Rules
1. Create 10 questions testing knowledge required for implementing this step or related concepts.
2. Adjust difficulty according to user level (%s).
3. Balance basic and advanced questions.
4. Provide detailed explanations for each quiz.
5. **IMPORTANT: The output MUST be in English, even if the provided project info or step content is in another language.**

# Output JSON Format
{
  "quizzes": [
    {
      "question": "Question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer_index": 0,
      "explanation": "Explanation..."
    }
  ]
}
`, req.Goal, req.Stack, req.Level, req.StepNumber, req.StepTitle, req.StepDesc, req.Level)
				} else {
					prompt = fmt.Sprintf(`
あなたは熟練のエンジニアメンターです。
ユーザーの以下の学習ステップに対して、理解度を確認する4択クイズを10問作成してください。

# プロジェクト情報
- 目標: %s
- 技術スタック: %s
- レベル: %s

# 対象ステップ
- Step %d: %s
- 内容: %s

# ルール
1. このステップの実装に必要な知識や、関連する概念を問う問題を10問作成してください。
2. ユーザーのレベル（%s）に合わせて難易度を調整してください。
3. 基礎的な問題から応用的な問題までバランスよく含めてください。
4. 各クイズには詳しい解説を付けてください。
5. **重要: 出力は必ず日本語で行ってください。**

# 出力JSONフォーマット
{
  "quizzes": [
    {
      "question": "問題文...",
      "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
      "answer_index": 0,
      "explanation": "解説..."
    }
  ]
}
`, req.Goal, req.Stack, req.Level, req.StepNumber, req.StepTitle, req.StepDesc, req.Level)
				}

				resp, genErr := w.GenModel.GenerateContent(ctx, genai.Text(prompt))
				if genErr != nil {
					err = genErr
				} else if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
					err = fmt.Errorf("empty response")
				} else {
					if txt, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
						generatedText := string(txt)

						// Clean JSON string
						jsonStr := generatedText
						if len(jsonStr) > 7 && jsonStr[:7] == "```json" {
							jsonStr = jsonStr[7:]
						}
						if len(jsonStr) > 3 && jsonStr[len(jsonStr)-3:] == "```" {
							jsonStr = jsonStr[:len(jsonStr)-3]
						}

						// Parse Quizzes
						type StepQuizResponse struct {
							Quizzes []struct {
								Question    string   `json:"question"`
								Options     []string `json:"options"`
								AnswerIndex int      `json:"answer_index"`
								Explanation string   `json:"explanation"`
							} `json:"quizzes"`
						}
						var quizResp StepQuizResponse
						if parseErr := json.Unmarshal([]byte(jsonStr), &quizResp); parseErr != nil {
							err = fmt.Errorf("failed to parse quiz json: %v", parseErr)
						} else {
							// Find Project
							var project models.Project
							w.DB.Where("user_id = ? AND goal = ?", job.UserID, req.Goal).First(&project)
							if project.ID == 0 {
								w.DB.Where("user_id = ?", job.UserID).Order("created_at desc").First(&project)
							}

							if project.ID != 0 {
								var step models.Step
								w.DB.Where("project_id = ? AND step_number = ?", project.ID, req.StepNumber).First(&step)
								if step.ID == 0 {
									step = models.Step{
										ProjectID:   project.ID,
										StepNumber:  req.StepNumber,
										Title:       req.StepTitle,
										Description: req.StepDesc,
									}
									w.DB.Create(&step)
								}

								// Save quizzes
								for _, q := range quizResp.Quizzes {
									optionsBytes, _ := json.Marshal(q.Options)
									quiz := models.Quiz{
										StepID:      step.ID,
										Question:    q.Question,
										Options:     optionsBytes,
										AnswerIndex: q.AnswerIndex,
										Explanation: q.Explanation,
									}
									w.DB.Create(&quiz)
								}

								// Return result
								result, _ = json.Marshal(quizResp)
							} else {
								err = fmt.Errorf("project not found")
							}
						}
					} else {
						err = fmt.Errorf("unexpected response format")
					}
				}
			}

			if err != nil {
				log.Printf("Worker: Job %d failed: %v", job.ID, err)
				job.Status = "failed"
				job.Error = err.Error()
			} else {
				log.Printf("Worker: Job %d completed", job.ID)
				job.Status = "completed"
				job.Result = result
			}
			job.UpdatedAt = time.Now()
			w.DB.Save(&job)
			lastCallTime = time.Now() // Update last call time
		}
	}()
}
