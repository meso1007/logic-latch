package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

func main() {
	// .envを読み込む
	if err := godotenv.Load(); err != nil {
		// .envがルートにある場合も想定して、パス指定なしでロード試行
		// (backendディレクトリで実行することを想定)
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY is not set")
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	fmt.Println("--- Available Models ---")
	iter := client.ListModels(ctx)
	for {
		m, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Fatal(err)
		}
		// generateContentメソッドをサポートしているモデルのみ表示
		for _, method := range m.SupportedGenerationMethods {
			if method == "generateContent" {
				fmt.Printf("Name: %s\n", m.Name)
				break
			}
		}
	}
	fmt.Println("------------------------")
}
