package database

import (
	"fmt"
	"log"
	"os"

	"github/meso1007/reverse-learn/backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func InitDB() *gorm.DB {
	var db *gorm.DB
	var err error

	driver := os.Getenv("DB_DRIVER")
	if driver == "postgres" {
		host := os.Getenv("DB_HOST")
		user := os.Getenv("DB_USER")
		password := os.Getenv("DB_PASSWORD")
		dbname := os.Getenv("DB_NAME")
		port := os.Getenv("DB_PORT")
		sslmode := os.Getenv("DB_SSLMODE")
		if sslmode == "" {
			sslmode = "disable"
		}

		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s", host, user, password, dbname, port, sslmode)
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	} else {
		// Default to SQLite
		db, err = gorm.Open(sqlite.Open("reverse-learn.db"), &gorm.Config{})
	}

	if err != nil {
		log.Fatal("failed to connect database: ", err)
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
