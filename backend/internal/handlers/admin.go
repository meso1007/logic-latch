package handlers

import (
	"net/http"

	"github/meso1007/reverse-learn/backend/internal/models"

	"github.com/labstack/echo/v4"
)

func (h *Handler) GetUsers(c echo.Context) error {
	var users []models.User
	if err := h.DB.Find(&users).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch users"})
	}

	type UserResponse struct {
		ID                 uint   `json:"id"`
		Email              string `json:"email"`
		Username           string `json:"username"`
		ProfileImage       string `json:"profile_image"`
		IsAdmin            bool   `json:"is_admin"`
		SubscriptionStatus string `json:"subscription_status"`
		SubscriptionPlan   string `json:"subscription_plan"`
	}

	var response []UserResponse
	for _, u := range users {
		response = append(response, UserResponse{
			ID:                 u.ID,
			Email:              u.Email,
			Username:           u.Username,
			ProfileImage:       u.ProfileImage,
			IsAdmin:            u.IsAdmin,
			SubscriptionStatus: u.SubscriptionStatus,
			SubscriptionPlan:   u.SubscriptionPlan,
		})
	}

	return c.JSON(http.StatusOK, response)
}

func (h *Handler) GetStats(c echo.Context) error {
	var userCount int64
	var projectCount int64
	var adminCount int64

	h.DB.Model(&models.User{}).Count(&userCount)
	h.DB.Model(&models.Project{}).Count(&projectCount)
	h.DB.Model(&models.User{}).Where("is_admin = ?", true).Count(&adminCount)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"total_users":    userCount,
		"total_projects": projectCount,
		"total_admins":   adminCount,
	})
}

func (h *Handler) ToggleAdmin(c echo.Context) error {
	userID := c.Param("id")

	var user models.User
	if result := h.DB.First(&user, userID); result.Error != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
	}

	user.IsAdmin = !user.IsAdmin
	if err := h.DB.Save(&user).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to update user"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"id":       user.ID,
		"email":    user.Email,
		"is_admin": user.IsAdmin,
	})
}

func (h *Handler) DeleteUser(c echo.Context) error {
	userID := c.Param("id")

	// Delete user's projects and related data
	h.DB.Where("user_id = ?", userID).Delete(&models.Project{})

	// Delete user
	if result := h.DB.Delete(&models.User{}, userID); result.Error != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete user"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "User deleted successfully"})
}
