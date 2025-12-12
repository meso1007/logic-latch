package handlers

import (
	"encoding/json"
	"net/http"

	"github/meso1007/reverse-learn/backend/internal/models"

	"github.com/labstack/echo/v4"
)

func (h *Handler) GetJob(c echo.Context) error {
	jobID := c.Param("id")
	var job models.Job
	if err := h.DB.First(&job, jobID).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Job not found"})
	}

	// If job is completed and type is generate_roadmap, we might need to return the project ID
	// The result is stored as JSON in Job.Result.
	// For now, just return the raw result and status.

	var result interface{}
	if len(job.Result) > 0 {
		json.Unmarshal(job.Result, &result)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"id":         job.ID,
		"type":       job.Type,
		"status":     job.Status,
		"result":     result,
		"error":      job.Error,
		"created_at": job.CreatedAt,
		"updated_at": job.UpdatedAt,
	})
}
