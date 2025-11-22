package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/api/option"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// フロントエンドから受け取るデータの形
type ProposeRequest struct {
	Goal  string `json:"goal"`  // 作りたいもの
	Stack string `json:"stack"` // 技術スタック（任意）
	Level string `json:"level"` // 現在のレベル
}

type PlanStep struct {
	Step  int    `json:"step"`
	Title string `json:"title"`
}

type ProposeResponse struct {
	Complexity string     `json:"complexity"`
	Stack      string     `json:"stack"`
	Reason     string     `json:"reason"`
	Steps      []PlanStep `json:"steps"`
}

type GenerateRequest struct {
	Goal      string     `json:"goal"`       // 作りたいもの
	Stack     string     `json:"stack"`      // 技術スタック
	Level     string     `json:"level"`      // 現在のレベル
	PlanSteps []PlanStep `json:"plan_steps"` // 提案されたステップ
}

type GenerateStepQuizRequest struct {
	Goal       string `json:"goal"`        // 作りたいもの
	Stack      string `json:"stack"`       // 技術スタック
	Level      string `json:"level"`       // 現在のレベル
	StepNumber int    `json:"step_number"` // ステップ番号
	StepTitle  string `json:"step_title"`  // ステップタイトル
	StepDesc   string `json:"step_desc"`   // ステップ説明
}

// --- DB Models ---

type User struct {
	ID           uint   `gorm:"primaryKey"`
	Email        string `gorm:"uniqueIndex;size:255"`
	Username     string `gorm:"size:100"`
	ProfileImage string `gorm:"size:500"`
	IsAdmin      bool   `gorm:"default:false"`
	PasswordHash string
}

type Project struct {
	ID        uint `gorm:"primaryKey"`
	UserID    uint `gorm:"index"`
	Goal      string
	Stack     string
	Level     string
	CreatedAt time.Time
	Steps     []Step `gorm:"foreignKey:ProjectID"`
}

type Step struct {
	ID          uint `gorm:"primaryKey"`
	ProjectID   uint `gorm:"index"`
	StepNumber  int
	Title       string
	Description string
	Quizzes     []Quiz `gorm:"foreignKey:StepID"`
	Score       *Score `gorm:"foreignKey:StepID"`
}

type Quiz struct {
	ID          uint `gorm:"primaryKey"`
	StepID      uint `gorm:"index"`
	Question    string
	Options     []byte `gorm:"type:json"` // JSON string of options
	AnswerIndex int
	Explanation string
}

type Score struct {
	ID         uint `gorm:"primaryKey"`
	StepID     uint `gorm:"uniqueIndex"`
	Score      int
	Total      int
	Percentage int
}

// --- Auth Structs ---

type SignupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  struct {
		ID           uint   `json:"id"`
		Email        string `json:"email"`
		Username     string `json:"username"`
		ProfileImage string `json:"profile_image"`
	} `json:"user"`
}

type JWTCustomClaims struct {
	UserID uint `json:"user_id"`
	jwt.RegisteredClaims
}

func main() {
	// 1. .envファイルを読み込む
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY is not set")
	}

	// 2. DB初期化
	db, err := gorm.Open(sqlite.Open("reverse-learn.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database")
	}

	// マイグレーション
	db.AutoMigrate(&User{}, &Project{}, &Step{}, &Quiz{}, &Score{})

	// 3. Echo (Webサーバー) のセットアップ
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
	}))

	// 4. Geminiクライアントの初期化
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	// 生成モデルの選択 (Flashは高速・安価)
	model := client.GenerativeModel("gemini-2.0-flash")
	model.ResponseMIMEType = "application/json"

	// JWT Secret
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))
	if len(jwtSecret) == 0 {
		jwtSecret = []byte("secret-key-fallback") // 本番では必ず環境変数で設定
	}

	// --- Auth Endpoints ---

	e.POST("/api/auth/signup", func(c echo.Context) error {
		req := new(SignupRequest)
		if err := c.Bind(req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
		}

		// Check if user exists
		var existingUser User
		if result := db.Where("email = ?", req.Email).First(&existingUser); result.Error == nil {
			return c.JSON(http.StatusConflict, map[string]string{"error": "Email already registered"})
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to hash password"})
		}

		user := User{
			Email:        req.Email,
			PasswordHash: string(hashedPassword),
		}

		if result := db.Create(&user); result.Error != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create user"})
		}

		// Generate JWT
		claims := &JWTCustomClaims{
			UserID: user.ID,
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 72)),
			},
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		t, err := token.SignedString(jwtSecret)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
		}

		return c.JSON(http.StatusCreated, AuthResponse{
			Token: t,
			User: struct {
				ID           uint   `json:"id"`
				Email        string `json:"email"`
				Username     string `json:"username"`
				ProfileImage string `json:"profile_image"`
			}{
				ID:           user.ID,
				Email:        user.Email,
				Username:     user.Username,
				ProfileImage: user.ProfileImage,
			},
		})
	})

	e.POST("/api/auth/login", func(c echo.Context) error {
		req := new(LoginRequest)
		if err := c.Bind(req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
		}

		var user User
		if result := db.Where("email = ?", req.Email).First(&user); result.Error != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid credentials"})
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid credentials"})
		}

		// Generate JWT
		claims := &JWTCustomClaims{
			UserID: user.ID,
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 72)),
			},
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		t, err := token.SignedString(jwtSecret)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
		}

		return c.JSON(http.StatusOK, AuthResponse{
			Token: t,
			User: struct {
				ID           uint   `json:"id"`
				Email        string `json:"email"`
				Username     string `json:"username"`
				ProfileImage string `json:"profile_image"`
			}{
				ID:           user.ID,
				Email:        user.Email,
				Username:     user.Username,
				ProfileImage: user.ProfileImage,
			},
		})
	})

	// Update user profile endpoint (will be protected by middleware below)
	updateProfileHandler := func(c echo.Context) error {
		userID := c.Get("userID").(uint)

		type UpdateProfileRequest struct {
			Username     string `json:"username"`
			ProfileImage string `json:"profile_image"`
		}

		req := new(UpdateProfileRequest)
		if err := c.Bind(req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
		}

		var user User
		if result := db.First(&user, userID); result.Error != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
		}

		// Update fields
		if req.Username != "" {
			user.Username = req.Username
		}
		if req.ProfileImage != "" {
			user.ProfileImage = req.ProfileImage
		}

		if err := db.Save(&user).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update profile"})
		}

		return c.JSON(http.StatusOK, map[string]interface{}{
			"id":            user.ID,
			"email":         user.Email,
			"username":      user.Username,
			"profile_image": user.ProfileImage,
		})
	}

	// Middleware for protected routes
	authMiddleware := func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing authorization header"})
			}

			tokenString := authHeader[len("Bearer "):]
			token, err := jwt.ParseWithClaims(tokenString, &JWTCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
				return jwtSecret, nil
			})

			if err != nil || !token.Valid {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
			}

			claims := token.Claims.(*JWTCustomClaims)
			c.Set("userID", claims.UserID)
			return next(c)
		}
	}

	// 5. APIエンドポイントの作成

	// プラン提案エンドポイント (認証不要)
	e.POST("/api/propose-plan", func(c echo.Context) error {
		req := new(ProposeRequest)
		if err := c.Bind(req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
		}

		// プロンプトの作成
		stackInfo := req.Stack
		if stackInfo == "" {
			stackInfo = "未指定（AIが最適なものを提案）"
		}

		prompt := fmt.Sprintf(`
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

		// Geminiに送信
		resp, err := model.GenerateContent(ctx, genai.Text(prompt))
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "AI generation failed: " + err.Error()})
		}

		// AIからの応答（JSON文字列）を取得
		if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Empty response from AI"})
		}

		// テキスト部分を取り出す
		generatedText, ok := resp.Candidates[0].Content.Parts[0].(genai.Text)
		if !ok {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Unexpected response format"})
		}

		return c.Blob(http.StatusOK, "application/json", []byte(generatedText))
	})

	// Profile update endpoint
	e.PUT("/api/profile", authMiddleware(updateProfileHandler))

	// ロードマップ生成エンドポイント (要認証)
	e.POST("/api/generate-roadmap", authMiddleware(func(c echo.Context) error {
		userID := c.Get("userID").(uint)

		// リクエストボディを構造体にバインド
		req := new(GenerateRequest)
		if err := c.Bind(req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
		}

		// ステップのタイトルをフォーマット
		stepsText := ""
		for _, step := range req.PlanSteps {
			stepsText += fmt.Sprintf("  - Step %d: %s\n", step.Step, step.Title)
		}

		// プロンプトの作成
		prompt := fmt.Sprintf(`
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

2. **Step 1のみ、その実装に必要な知識を問う4択クイズを10問含めてください。**
   他のステップ（Step 2以降）は、quizzesを空の配列[]にしてください。

3. ユーザーのレベルに応じてクイズの難易度を調整してください：
   - beginner（初心者）: 基本的な概念、用語の理解、シンプルな実装方法を問う
   - intermediate（中級者）: ベストプラクティス、一般的な問題の解決方法、設計パターンを問う
   - advanced（上級者）: パフォーマンス最適化、セキュリティ、スケーラビリティ、高度な実装を問う

4. Step 1の10問のクイズは段階的に難易度を上げて、そのレベルに適した範囲で基礎から応用まで幅広くカバーしてください。

5. 各クイズには詳しい解説を付けてください。初心者の場合は特に丁寧に説明してください。

# 出力JSONフォーマット
{
  "roadmap": [
    {
      "step": 1,
      "title": "環境構築とプロジェクトセットアップ",
      "description": "Node.jsのインストール、Reactプロジェクトの作成...",
      "quizzes": [
        {
          "question": "Reactコンポーネントで状態を管理するためのフックは？",
          "options": ["useEffect", "useState", "useContext", "useReducer"],
          "answer_index": 1,
          "explanation": "useStateは関数コンポーネントで状態を保持するためのフックです..."
        }
      ]
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

		// Geminiに送信
		resp, err := model.GenerateContent(ctx, genai.Text(prompt))
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "AI generation failed: " + err.Error()})
		}

		// AIからの応答（JSON文字列）を取得
		if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Empty response from AI"})
		}

		generatedText, ok := resp.Candidates[0].Content.Parts[0].(genai.Text)
		if !ok {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Unexpected response format"})
		}

		// Save to DB
		project := Project{
			UserID:    userID,
			Goal:      req.Goal,
			Stack:     req.Stack,
			Level:     req.Level,
			CreatedAt: time.Now(),
		}
		if err := db.Create(&project).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create project"})
		}

		// Parse AI response to save steps and quizzes (Need a temporary struct for parsing)
		type RoadmapResponse struct {
			Roadmap []struct {
				Step        int    `json:"step"`
				Title       string `json:"title"`
				Description string `json:"description"`
				Quizzes     []struct {
					Question    string   `json:"question"`
					Options     []string `json:"options"`
					AnswerIndex int      `json:"answer_index"`
					Explanation string   `json:"explanation"`
				} `json:"quizzes"`
			} `json:"roadmap"`
		}

		// Clean JSON string
		jsonStr := string(generatedText)
		if len(jsonStr) > 7 && jsonStr[:7] == "```json" {
			jsonStr = jsonStr[7:]
		}
		if len(jsonStr) > 3 && jsonStr[len(jsonStr)-3:] == "```" {
			jsonStr = jsonStr[:len(jsonStr)-3]
		}

		var roadmapResp RoadmapResponse
		if err := json.Unmarshal([]byte(jsonStr), &roadmapResp); err != nil {
			log.Printf("Failed to parse AI response: %v", err)
			// Even if parsing fails, return the raw response so frontend might handle it
			return c.Blob(http.StatusOK, "application/json", []byte(generatedText))
		}

		// Save Steps and Quizzes
		for _, s := range roadmapResp.Roadmap {
			step := Step{
				ProjectID:   project.ID,
				StepNumber:  s.Step,
				Title:       s.Title,
				Description: s.Description,
			}
			if err := db.Create(&step).Error; err != nil {
				log.Printf("Failed to create step: %v", err)
				continue
			}

			for _, q := range s.Quizzes {
				optionsJSON, _ := json.Marshal(q.Options)
				quiz := Quiz{
					StepID:      step.ID,
					Question:    q.Question,
					Options:     optionsJSON,
					AnswerIndex: q.AnswerIndex,
					Explanation: q.Explanation,
				}
				db.Create(&quiz)
			}
		}

		// Return the parsed object with ProjectID included if needed, or just the original JSON
		// Frontend expects RoadmapResponse structure.
		return c.JSON(http.StatusOK, roadmapResp)
	}))

	// 特定ステップのクイズ生成エンドポイント (要認証)
	e.POST("/api/generate-step-quiz", authMiddleware(func(c echo.Context) error {
		userID := c.Get("userID").(uint)

		req := new(GenerateStepQuizRequest)
		if err := c.Bind(req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
		}

		// Find the project and step to ensure they exist and belong to user
		var project Project
		if err := db.Where("user_id = ? AND goal = ?", userID, req.Goal).First(&project).Error; err != nil {
			// If project not found by goal (legacy or mismatch), try to find by ID if passed,
			// but for now let's assume frontend passes enough info or we rely on latest project.
			// Actually, frontend passes goal/stack/level.
			// Ideally we should pass ProjectID. For now, let's find the latest project for user.
			db.Where("user_id = ?", userID).Order("created_at desc").First(&project)
		}

		if project.ID == 0 {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Project not found"})
		}

		var step Step
		if err := db.Where("project_id = ? AND step_number = ?", project.ID, req.StepNumber).First(&step).Error; err != nil {
			// If step doesn't exist in DB yet (migrating from local storage flow), create it?
			// Or return error. Let's create it if missing to be safe.
			step = Step{
				ProjectID:   project.ID,
				StepNumber:  req.StepNumber,
				Title:       req.StepTitle,
				Description: req.StepDesc,
			}
			db.Create(&step)
		}

		// Check if quizzes already exist
		var existingQuizzes []Quiz
		db.Where("step_id = ?", step.ID).Find(&existingQuizzes)
		if len(existingQuizzes) > 0 {
			// Return existing quizzes
			type QuizResponse struct {
				Question    string   `json:"question"`
				Options     []string `json:"options"`
				AnswerIndex int      `json:"answer_index"`
				Explanation string   `json:"explanation"`
			}
			var quizzes []QuizResponse
			for _, q := range existingQuizzes {
				var options []string
				json.Unmarshal(q.Options, &options)
				quizzes = append(quizzes, QuizResponse{
					Question:    q.Question,
					Options:     options,
					AnswerIndex: q.AnswerIndex,
					Explanation: q.Explanation,
				})
			}
			return c.JSON(http.StatusOK, map[string]interface{}{"quizzes": quizzes})
		}

		prompt := fmt.Sprintf(`
100: あなたは熟練のエンジニアメンターです。
101: ユーザーの以下の学習ステップに対して、理解度を確認する4択クイズを10問作成してください。
102: 
103: # プロジェクト情報
104: - 目標: %s
105: - 技術スタック: %s
106: - レベル: %s
107: 
108: # 対象ステップ
109: - Step %d: %s
110: - 内容: %s
111: 
112: # ルール
113: 1. このステップの実装に必要な知識や、関連する概念を問う問題を10問作成してください。
114: 2. ユーザーのレベル（%s）に合わせて難易度を調整してください。
115: 3. 基礎的な問題から応用的な問題までバランスよく含めてください。
116: 4. 各クイズには詳しい解説を付けてください。
117: 
118: # 出力JSONフォーマット
119: {
120:   "quizzes": [
121:     {
122:       "question": "問題文...",
123:       "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
124:       "answer_index": 0,
125:       "explanation": "解説..."
126:     }
127:   ]
128: }
129: `, req.Goal, req.Stack, req.Level, req.StepNumber, req.StepTitle, req.StepDesc, req.Level)

		// Geminiに送信
		resp, err := model.GenerateContent(ctx, genai.Text(prompt))
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "AI generation failed: " + err.Error()})
		}

		if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Empty response from AI"})
		}

		generatedText, ok := resp.Candidates[0].Content.Parts[0].(genai.Text)
		if !ok {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Unexpected response format"})
		}

		// Clean JSON
		jsonStr := string(generatedText)
		if len(jsonStr) > 7 && jsonStr[:7] == "```json" {
			jsonStr = jsonStr[7:]
		}
		if len(jsonStr) > 3 && jsonStr[len(jsonStr)-3:] == "```" {
			jsonStr = jsonStr[:len(jsonStr)-3]
		}

		type StepQuizResponse struct {
			Quizzes []struct {
				Question    string   `json:"question"`
				Options     []string `json:"options"`
				AnswerIndex int      `json:"answer_index"`
				Explanation string   `json:"explanation"`
			} `json:"quizzes"`
		}

		var quizResp StepQuizResponse
		if err := json.Unmarshal([]byte(jsonStr), &quizResp); err != nil {
			return c.Blob(http.StatusOK, "application/json", []byte(generatedText))
		}

		// Save to DB
		for _, q := range quizResp.Quizzes {
			optionsJSON, _ := json.Marshal(q.Options)
			quiz := Quiz{
				StepID:      step.ID,
				Question:    q.Question,
				Options:     optionsJSON,
				AnswerIndex: q.AnswerIndex,
				Explanation: q.Explanation,
			}
			db.Create(&quiz)
		}

		return c.JSON(http.StatusOK, quizResp)
	}))

	// --- New Data Access Endpoints ---

	// Get all projects for user (Sidebar list)
	e.GET("/api/projects", authMiddleware(func(c echo.Context) error {
		userID := c.Get("userID").(uint)
		var projects []Project
		if err := db.Where("user_id = ?", userID).Order("created_at desc").Find(&projects).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch projects"})
		}

		type ProjectSummary struct {
			ID        uint      `json:"id"`
			Goal      string    `json:"goal"`
			CreatedAt time.Time `json:"created_at"`
		}

		var summaries []ProjectSummary
		for _, p := range projects {
			summaries = append(summaries, ProjectSummary{
				ID:        p.ID,
				Goal:      p.Goal,
				CreatedAt: p.CreatedAt,
			})
		}

		return c.JSON(http.StatusOK, summaries)
	}))

	// Get latest project for user
	e.GET("/api/projects/latest", authMiddleware(func(c echo.Context) error {
		userID := c.Get("userID").(uint)
		var project Project
		if err := db.Where("user_id = ?", userID).Order("created_at desc").Preload("Steps").First(&project).Error; err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "No project found"})
		}

		// Also load scores for the steps
		var scores []Score
		stepIDs := make([]uint, len(project.Steps))
		for i, s := range project.Steps {
			stepIDs[i] = s.ID
		}
		db.Where("step_id IN ?", stepIDs).Find(&scores)

		// Map scores to step IDs
		scoreMap := make(map[uint]Score)
		for _, s := range scores {
			scoreMap[s.StepID] = s
		}

		// Construct response
		type StepResponse struct {
			Step        int    `json:"step"`
			Title       string `json:"title"`
			Description string `json:"description"`
			IsCompleted bool   `json:"is_completed"`
			Score       *struct {
				Score      int `json:"score"`
				Total      int `json:"total"`
				Percentage int `json:"percentage"`
			} `json:"score,omitempty"`
		}

		var stepsResp []StepResponse
		for _, s := range project.Steps {
			var scoreResp *struct {
				Score      int `json:"score"`
				Total      int `json:"total"`
				Percentage int `json:"percentage"`
			}
			isCompleted := false
			if sc, ok := scoreMap[s.ID]; ok {
				isCompleted = true
				scoreResp = &struct {
					Score      int `json:"score"`
					Total      int `json:"total"`
					Percentage int `json:"percentage"`
				}{
					Score:      sc.Score,
					Total:      sc.Total,
					Percentage: sc.Percentage,
				}
			}
			stepsResp = append(stepsResp, StepResponse{
				Step:        s.StepNumber,
				Title:       s.Title,
				Description: s.Description,
				IsCompleted: isCompleted,
				Score:       scoreResp,
			})
		}

		return c.JSON(http.StatusOK, map[string]interface{}{
			"id":      project.ID,
			"goal":    project.Goal,
			"stack":   project.Stack,
			"level":   project.Level,
			"roadmap": stepsResp,
		})
	}))

	// Get specific project by ID
	e.GET("/api/projects/:id", authMiddleware(func(c echo.Context) error {
		userID := c.Get("userID").(uint)
		projectID := c.Param("id")

		var project Project
		if err := db.Where("id = ? AND user_id = ?", projectID, userID).Preload("Steps").First(&project).Error; err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Project not found"})
		}

		// Also load scores for the steps
		var scores []Score
		stepIDs := make([]uint, len(project.Steps))
		for i, s := range project.Steps {
			stepIDs[i] = s.ID
		}
		db.Where("step_id IN ?", stepIDs).Find(&scores)

		// Map scores to step IDs
		scoreMap := make(map[uint]Score)
		for _, s := range scores {
			scoreMap[s.StepID] = s
		}

		// Construct response
		type StepResponse struct {
			Step        int    `json:"step"`
			Title       string `json:"title"`
			Description string `json:"description"`
			IsCompleted bool   `json:"is_completed"`
			Score       *struct {
				Score      int `json:"score"`
				Total      int `json:"total"`
				Percentage int `json:"percentage"`
			} `json:"score,omitempty"`
		}

		var stepsResp []StepResponse
		for _, s := range project.Steps {
			var scoreResp *struct {
				Score      int `json:"score"`
				Total      int `json:"total"`
				Percentage int `json:"percentage"`
			}
			isCompleted := false
			if sc, ok := scoreMap[s.ID]; ok {
				isCompleted = true
				scoreResp = &struct {
					Score      int `json:"score"`
					Total      int `json:"total"`
					Percentage int `json:"percentage"`
				}{
					Score:      sc.Score,
					Total:      sc.Total,
					Percentage: sc.Percentage,
				}
			}
			stepsResp = append(stepsResp, StepResponse{
				Step:        s.StepNumber,
				Title:       s.Title,
				Description: s.Description,
				IsCompleted: isCompleted,
				Score:       scoreResp,
			})
		}

		return c.JSON(http.StatusOK, map[string]interface{}{
			"id":      project.ID,
			"goal":    project.Goal,
			"stack":   project.Stack,
			"level":   project.Level,
			"roadmap": stepsResp,
		})
	}))

	// Get specific step with quizzes
	e.GET("/api/projects/:id/steps/:stepNumber", authMiddleware(func(c echo.Context) error {
		userID := c.Get("userID").(uint)
		projectID := c.Param("id")
		stepNumber := c.Param("stepNumber")

		var project Project
		if err := db.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error; err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Project not found"})
		}

		var step Step
		if err := db.Where("project_id = ? AND step_number = ?", project.ID, stepNumber).Preload("Quizzes").First(&step).Error; err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Step not found"})
		}

		// Format quizzes
		type QuizResponse struct {
			Question    string   `json:"question"`
			Options     []string `json:"options"`
			AnswerIndex int      `json:"answer_index"`
			Explanation string   `json:"explanation"`
		}
		var quizzes []QuizResponse
		for _, q := range step.Quizzes {
			var options []string
			json.Unmarshal(q.Options, &options)
			quizzes = append(quizzes, QuizResponse{
				Question:    q.Question,
				Options:     options,
				AnswerIndex: q.AnswerIndex,
				Explanation: q.Explanation,
			})
		}

		return c.JSON(http.StatusOK, map[string]interface{}{
			"step":        step.StepNumber,
			"title":       step.Title,
			"description": step.Description,
			"quizzes":     quizzes,
		})
	}))

	// Save score
	e.POST("/api/projects/:id/steps/:stepNumber/score", authMiddleware(func(c echo.Context) error {
		userID := c.Get("userID").(uint)
		projectID := c.Param("id")
		stepNumber := c.Param("stepNumber")

		type ScoreRequest struct {
			Score      int `json:"score"`
			Total      int `json:"total"`
			Percentage int `json:"percentage"`
		}
		req := new(ScoreRequest)
		if err := c.Bind(req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
		}

		var project Project
		if err := db.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error; err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Project not found"})
		}

		var step Step
		if err := db.Where("project_id = ? AND step_number = ?", project.ID, stepNumber).First(&step).Error; err != nil {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Step not found"})
		}

		// Save or update score
		var score Score
		if err := db.Where("step_id = ?", step.ID).First(&score).Error; err == nil {
			score.Score = req.Score
			score.Total = req.Total
			score.Percentage = req.Percentage
			db.Save(&score)
		} else {
			score = Score{
				StepID:     step.ID,
				Score:      req.Score,
				Total:      req.Total,
				Percentage: req.Percentage,
			}
			db.Create(&score)
		}

		return c.JSON(http.StatusOK, map[string]string{"status": "success"})
	}))

	// サーバー起動
	e.Logger.Fatal(e.Start(":8080"))
}
