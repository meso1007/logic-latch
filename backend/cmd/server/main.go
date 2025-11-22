package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"google.golang.org/api/option"
)

// フロントエンドから受け取るデータの形
type GenerateRequest struct {
	Goal  string `json:"goal"`  // 作りたいもの
	Stack string `json:"stack"` // 技術スタック
	Level string `json:"level"` // 現在のレベル
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

	// 2. Echo (Webサーバー) のセットアップ
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{http.MethodPost}, // POSTを許可
	}))

	// 3. Geminiクライアントの初期化
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	// 生成モデルの選択 (Flashは高速・安価)
	model := client.GenerativeModel("gemini-2.0-flash")
	model.ResponseMIMEType = "application/json"

	// 4. APIエンドポイントの作成
	e.POST("/api/generate-roadmap", func(c echo.Context) error {
		// リクエストボディを構造体にバインド
		req := new(GenerateRequest)
		if err := c.Bind(req); err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
		}

		// プロンプトの作成
		prompt := fmt.Sprintf(`
あなたは熟練のエンジニアメンターです。
ユーザーの以下の要望に基づき、学習ロードマップとクイズをJSONで作成してください。

# ユーザーの要望
- 作りたいもの: %s
- 技術スタック: %s
- 現在のレベル: %s

# ルール
1. プロジェクトの複雑さに応じて、全3〜5ステップで構成してください。
2. **最後のステップは必ず「セキュリティと脆弱性対策」にしてください。**
3. 各ステップには、その実装に必要な知識を問う4択クイズを1問含めてください。

# 出力JSONフォーマット
{
  "complexity": "Medium",
  "roadmap": [
    {
      "step": 1,
      "title": "ステップのタイトル",
      "description": "ステップの説明",
      "quiz": {
        "question": "問題文...",
        "options": ["A...", "B...", "C...", "D..."],
        "answer_index": 0,
        "explanation": "解説..."
      }
    }
  ]
}
`, req.Goal, req.Stack, req.Level)

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

		// 生のJSON文字列をそのまま返す（パースはフロントエンドに任せるか、ここでするかはお好みで）
		// 今回はシンプルに文字列として返すのではなく、JSONとして解釈させて返す（Blobとして扱う）
		return c.Blob(http.StatusOK, "application/json", []byte(generatedText))
	})

	// サーバー起動
	e.Logger.Fatal(e.Start(":8080"))
}
