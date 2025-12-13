package handlers

import (
	"net/http"
	"time"

	"github/meso1007/reverse-learn/backend/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

func (h *Handler) Signup(c echo.Context) error {
	req := new(models.SignupRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	// Check if user exists
	var existingUser models.User
	if result := h.DB.Where("email = ?", req.Email).First(&existingUser); result.Error == nil {
		return c.JSON(http.StatusConflict, map[string]string{"error": "Email already registered"})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to hash password"})
	}

	user := models.User{
		Email:        req.Email,
		Username:     req.Username,
		PasswordHash: string(hashedPassword),
	}

	if result := h.DB.Create(&user); result.Error != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create user"})
	}

	// Generate JWT
	claims := &models.JWTCustomClaims{
		UserID: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 72)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString(h.JWTSecret)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
	}

	return c.JSON(http.StatusCreated, models.AuthResponse{
		Token: t,
		User: struct {
			ID           uint   `json:"id"`
			Email        string `json:"email"`
			Username     string `json:"username"`
			ProfileImage string `json:"profile_image"`
			IsAdmin      bool   `json:"is_admin"`
		}{
			ID:           user.ID,
			Email:        user.Email,
			Username:     user.Username,
			ProfileImage: user.ProfileImage,
			IsAdmin:      user.IsAdmin,
		},
	})
}

func (h *Handler) Login(c echo.Context) error {
	req := new(models.LoginRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	var user models.User
	if result := h.DB.Where("email = ?", req.Email).First(&user); result.Error != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid password"})
	}

	// Generate JWT
	claims := &models.JWTCustomClaims{
		UserID: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 72)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	t, err := token.SignedString(h.JWTSecret)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
	}

	return c.JSON(http.StatusOK, models.AuthResponse{
		Token: t,
		User: struct {
			ID           uint   `json:"id"`
			Email        string `json:"email"`
			Username     string `json:"username"`
			ProfileImage string `json:"profile_image"`
			IsAdmin      bool   `json:"is_admin"`
		}{
			ID:           user.ID,
			Email:        user.Email,
			Username:     user.Username,
			ProfileImage: user.ProfileImage,
			IsAdmin:      user.IsAdmin,
		},
	})
}

func (h *Handler) UpdateProfile(c echo.Context) error {
	userID := c.Get("userID").(uint)

	type UpdateProfileRequest struct {
		Username     string `json:"username"`
		ProfileImage string `json:"profile_image"`
	}

	req := new(UpdateProfileRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	var user models.User
	if result := h.DB.First(&user, userID); result.Error != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
	}

	// Update fields
	if req.Username != "" {
		user.Username = req.Username
	}
	if req.ProfileImage != "" {
		user.ProfileImage = req.ProfileImage
	}

	if err := h.DB.Save(&user).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update profile"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"id":            user.ID,
		"email":         user.Email,
		"username":      user.Username,
		"profile_image": user.ProfileImage,
	})
}
