package models

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// --- API Request/Response Models ---

type ProposeRequest struct {
	Goal   string `json:"goal"`   // 作りたいもの
	Stack  string `json:"stack"`  // 技術スタック（任意）
	Level  string `json:"level"`  // 現在のレベル
	Locale string `json:"locale"` // 言語設定
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
	Locale    string     `json:"locale"`     // 言語設定
}

type GenerateStepQuizRequest struct {
	Goal       string `json:"goal"`        // 作りたいもの
	Stack      string `json:"stack"`       // 技術スタック
	Level      string `json:"level"`       // 現在のレベル
	StepNumber int    `json:"step_number"` // ステップ番号
	StepTitle  string `json:"step_title"`  // ステップタイトル
	StepDesc   string `json:"step_desc"`   // ステップ説明
	Locale     string `json:"locale"`      // 言語設定
}

// --- DB Models ---

type User struct {
	ID                 uint   `gorm:"primaryKey"`
	Email              string `gorm:"uniqueIndex;size:255"`
	Username           string `gorm:"size:100"`
	ProfileImage       string `gorm:"size:500"`
	IsAdmin            bool   `gorm:"default:false"`
	StripeCustomerID   string `gorm:"size:255"`
	SubscriptionID     string `gorm:"size:255"`
	SubscriptionStatus string `gorm:"size:50"` // active, past_due, canceled, etc.
	SubscriptionPlan   string `gorm:"size:50"` // free, pro
	PasswordHash       string
}

type Project struct {
	ID        uint `gorm:"primaryKey"`
	UserID    uint `gorm:"index"`
	Goal      string
	Stack     string
	Level     string
	Locale    string
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
	ID         uint `gorm:"primaryKey" json:"id"`
	StepID     uint `gorm:"uniqueIndex" json:"step_id"`
	Score      int  `json:"score"`
	Total      int  `json:"total"`
	Percentage int  `json:"percentage"`
}

type Job struct {
	ID        uint   `gorm:"primaryKey"`
	UserID    uint   `gorm:"index"`                   // Added UserID
	Type      string `gorm:"size:50"`                 // propose_plan, generate_roadmap, generate_quiz
	Status    string `gorm:"size:20;default:pending"` // pending, processing, completed, failed
	Input     []byte `gorm:"type:json"`
	Result    []byte `gorm:"type:json"`
	Error     string
	CreatedAt time.Time
	UpdatedAt time.Time
}

// --- Auth Structs ---

type SignupRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  struct {
		ID                 uint   `json:"id"`
		Email              string `json:"email"`
		Username           string `json:"username"`
		ProfileImage       string `json:"profile_image"`
		IsAdmin            bool   `json:"is_admin"`
		SubscriptionStatus string `json:"subscription_status"`
		SubscriptionPlan   string `json:"subscription_plan"`
	} `json:"user"`
}

type JWTCustomClaims struct {
	UserID uint `json:"user_id"`
	jwt.RegisteredClaims
}

// --- Worker Response Models ---

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

type StepResponse struct {
	Step        int         `json:"step"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	IsCompleted bool        `json:"is_completed"`
	Score       interface{} `json:"score"`
}
