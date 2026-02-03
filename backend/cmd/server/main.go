package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github/meso1007/reverse-learn/backend/internal/auth"
	"github/meso1007/reverse-learn/backend/internal/database"
	"github/meso1007/reverse-learn/backend/internal/handlers"
	"github/meso1007/reverse-learn/backend/internal/payment"
	"github/meso1007/reverse-learn/backend/internal/worker"

	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"google.golang.org/api/option"
)

func main() {
	// 1. Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("GEMINI_API_KEY is not set")
	}

	// 2. Init DB
	db := database.InitDB()

	// 3. Init Gemini
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-flash-latest")
	model.ResponseMIMEType = "application/json"

	// 4. Init Worker
	w := worker.NewWorker(db, model, 100)
	w.Start()

	// 5. Init Handlers
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "secret-key-fallback"
	}

	paymentService := payment.NewService()
	authMiddlewareHandler := auth.NewAuthHandler(jwtSecret, db)
	h := handlers.NewHandler(db, w.JobQueue, jwtSecret, paymentService)

	// 6. Setup Echo
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
	}))

	// 7. Routes
	// Public Routes
	e.POST("/api/auth/signup", h.Signup)
	e.POST("/api/auth/login", h.Login)
	e.POST("/api/propose-plan", h.ProposePlan)
	e.POST("/api/webhook/stripe", h.StripeWebhook)

	// Protected Routes
	api := e.Group("/api")
	api.Use(authMiddlewareHandler.AuthMiddleware)

	api.PUT("/profile", h.UpdateProfile)
	api.POST("/generate-roadmap", h.GenerateRoadmap)
	api.POST("/generate-step-quiz", h.GenerateStepQuiz)
	api.GET("/projects", h.GetProjects)
	api.GET("/projects/latest", h.GetLatestProject)
	api.GET("/projects/:id", h.GetProject)
	api.DELETE("/projects/:id", h.DeleteProject)
	api.GET("/projects/:id/steps/:stepNumber", h.GetStep)
	api.POST("/projects/:id/steps/:stepNumber/score", h.SaveStepScore)
	api.GET("/jobs/:id", h.GetJob)

	// Payment Routes
	api.POST("/payment/subscribe", h.Subscribe)
	api.POST("/payment/portal", h.ManageSubscription)

	// Admin Routes
	admin := e.Group("/api/admin")
	admin.Use(authMiddlewareHandler.AdminMiddleware)
	admin.GET("/users", h.GetUsers)
	admin.GET("/stats", h.GetStats)
	admin.PUT("/users/:id/toggle-admin", h.ToggleAdmin)
	admin.DELETE("/users/:id", h.DeleteUser)

	// Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	e.Logger.Fatal(e.Start(":" + port))
}
