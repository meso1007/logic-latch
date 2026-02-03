package handlers

import (
	"github/meso1007/reverse-learn/backend/internal/payment"

	"gorm.io/gorm"
)

type Handler struct {
	DB             *gorm.DB
	JobQueue       chan uint
	JWTSecret      []byte
	PaymentService *payment.Service
}

func NewHandler(db *gorm.DB, jobQueue chan uint, secret string, paymentService *payment.Service) *Handler {
	return &Handler{
		DB:             db,
		JobQueue:       jobQueue,
		JWTSecret:      []byte(secret),
		PaymentService: paymentService,
	}
}
