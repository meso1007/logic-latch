package handlers

import (
	"gorm.io/gorm"
)

type Handler struct {
	DB        *gorm.DB
	JobQueue  chan uint
	JWTSecret []byte
}

func NewHandler(db *gorm.DB, jobQueue chan uint, secret string) *Handler {
	return &Handler{
		DB:        db,
		JobQueue:  jobQueue,
		JWTSecret: []byte(secret),
	}
}
