package auth

import (
	"log"
	"net/http"
	"strings"

	"github/meso1007/reverse-learn/backend/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type AuthHandler struct {
	JWTSecret []byte
	DB        *gorm.DB
}

func NewAuthHandler(secret string, db *gorm.DB) *AuthHandler {
	return &AuthHandler{
		JWTSecret: []byte(secret),
		DB:        db,
	}
}

// Middleware for protected routes
func (h *AuthHandler) AuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			log.Println("Auth error: Missing authorization header")
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Missing authorization header"})
		}

		if len(authHeader) < 7 || authHeader[:7] != "Bearer " {
			log.Printf("Auth error: Invalid header format. Header: %s", authHeader)
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid authorization header"})
		}

		tokenString := authHeader[len("Bearer "):]
		tokenString = strings.TrimSpace(tokenString)

		token, err := jwt.ParseWithClaims(tokenString, &models.JWTCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
			return h.JWTSecret, nil
		})

		if err != nil {
			log.Printf("Auth error: Token parse error: %v", err)
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
		}

		if !token.Valid {
			log.Println("Auth error: Token is invalid")
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token"})
		}

		claims := token.Claims.(*models.JWTCustomClaims)
		c.Set("userID", claims.UserID)
		return next(c)
	}
}

// Admin middleware (requires AuthMiddleware first)
func (h *AuthHandler) AdminMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return h.AuthMiddleware(func(c echo.Context) error {
		userID := c.Get("userID").(uint)

		var user models.User
		if result := h.DB.First(&user, userID); result.Error != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "User not found"})
		}

		if !user.IsAdmin {
			return c.JSON(http.StatusForbidden, map[string]string{"error": "Admin access required"})
		}

		return next(c)
	})
}
