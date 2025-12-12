package database

import (
	"log"

	"github/meso1007/reverse-learn/backend/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitDB() *gorm.DB {
	db, err := gorm.Open(sqlite.Open("reverse-learn.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("failed to connect database")
	}

	// Auto Migrate
	err = db.AutoMigrate(
		&models.User{},
		&models.Project{},
		&models.Step{},
		&models.Quiz{},
		&models.Score{},
		&models.Job{},
	)
	if err != nil {
		log.Fatal("failed to migrate database:", err)
	}

	return db
}
