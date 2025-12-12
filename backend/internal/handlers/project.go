package handlers

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"time"

	"github/meso1007/reverse-learn/backend/internal/models"

	"github.com/labstack/echo/v4"
)

func (h *Handler) ProposePlan(c echo.Context) error {
	req := new(models.ProposeRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	// Create Job
	inputBytes, _ := json.Marshal(req)
	job := models.Job{
		Type:   "propose_plan",
		Status: "pending",
		Input:  inputBytes,
	}
	if err := h.DB.Create(&job).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create job"})
	}

	// Push to Queue
	select {
	case h.JobQueue <- job.ID:
		return c.JSON(http.StatusAccepted, map[string]interface{}{
			"job_id": job.ID,
			"status": "pending",
		})
	default:
		// Queue is full
		job.Status = "failed"
		job.Error = "Server is busy, please try again later"
		h.DB.Save(&job)
		return c.JSON(http.StatusServiceUnavailable, map[string]string{"error": "Server is busy"})
	}
}

func (h *Handler) GenerateRoadmap(c echo.Context) error {
	userID := c.Get("userID").(uint)

	req := new(models.GenerateRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	// Create Job
	inputBytes, _ := json.Marshal(req)
	job := models.Job{
		UserID: userID,
		Type:   "generate_roadmap",
		Status: "pending",
		Input:  inputBytes,
	}
	if err := h.DB.Create(&job).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create job"})
	}

	// Push to Queue
	select {
	case h.JobQueue <- job.ID:
		return c.JSON(http.StatusAccepted, map[string]interface{}{
			"job_id": job.ID,
			"status": "pending",
		})
	default:
		// Queue is full
		job.Status = "failed"
		job.Error = "Server is busy, please try again later"
		h.DB.Save(&job)
		return c.JSON(http.StatusServiceUnavailable, map[string]string{"error": "Server is busy"})
	}
}

func (h *Handler) GenerateStepQuiz(c echo.Context) error {
	userID := c.Get("userID").(uint)

	req := new(models.GenerateStepQuizRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	// Check Cache (DB)
	var project models.Project
	h.DB.Where("user_id = ? AND goal = ?", userID, req.Goal).First(&project)
	if project.ID != 0 {
		var step models.Step
		h.DB.Where("project_id = ? AND step_number = ?", project.ID, req.StepNumber).Preload("Quizzes").First(&step)
		if step.ID != 0 && len(step.Quizzes) > 0 {
			// Return cached quizzes
			type QuizResponse struct {
				Question    string   `json:"question"`
				Options     []string `json:"options"`
				AnswerIndex int      `json:"answer_index"`
				Explanation string   `json:"explanation"`
			}
			var quizzesResp []QuizResponse
			for _, q := range step.Quizzes {
				var options []string
				json.Unmarshal(q.Options, &options)
				quizzesResp = append(quizzesResp, QuizResponse{
					Question:    q.Question,
					Options:     options,
					AnswerIndex: q.AnswerIndex,
					Explanation: q.Explanation,
				})
			}

			return c.JSON(http.StatusOK, map[string]interface{}{
				"quizzes": quizzesResp,
			})
		}
	}

	// Ensure locale matches project locale
	if project.ID != 0 && project.Locale != "" {
		req.Locale = project.Locale
	}

	// Create Job
	inputBytes, _ := json.Marshal(req)
	job := models.Job{
		UserID: userID,
		Type:   "generate_quiz",
		Status: "pending",
		Input:  inputBytes,
	}
	if err := h.DB.Create(&job).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create job"})
	}

	// Push to Queue
	select {
	case h.JobQueue <- job.ID:
		return c.JSON(http.StatusAccepted, map[string]interface{}{
			"job_id": job.ID,
			"status": "pending",
		})
	default:
		// Queue is full
		job.Status = "failed"
		job.Error = "Server is busy, please try again later"
		h.DB.Save(&job)
		return c.JSON(http.StatusServiceUnavailable, map[string]string{"error": "Server is busy"})
	}
}

func (h *Handler) GetProjects(c echo.Context) error {
	userID := c.Get("userID").(uint)
	var projects []models.Project
	if err := h.DB.Where("user_id = ?", userID).Order("created_at desc").Find(&projects).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch projects"})
	}

	type ProjectSummary struct {
		ID        uint      `json:"id"`
		Goal      string    `json:"goal"`
		CreatedAt time.Time `json:"created_at"`
	}

	var summaries []ProjectSummary
	for _, p := range projects {
		summaries = append(summaries, ProjectSummary{
			ID:        p.ID,
			Goal:      p.Goal,
			CreatedAt: p.CreatedAt,
		})
	}

	return c.JSON(http.StatusOK, summaries)
}

func (h *Handler) GetLatestProject(c echo.Context) error {
	userID := c.Get("userID").(uint)
	locale := c.QueryParam("locale")

	var project models.Project
	query := h.DB.Where("user_id = ?", userID).Order("created_at desc").Preload("Steps")

	if locale != "" {
		query = query.Where("locale = ?", locale)
	}

	if err := query.First(&project).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "No project found"})
	}

	// Also load scores for the steps
	var scores []models.Score
	stepIDs := make([]uint, len(project.Steps))
	for i, s := range project.Steps {
		stepIDs[i] = s.ID
	}
	h.DB.Where("step_id IN ?", stepIDs).Find(&scores)

	// Map scores to step IDs
	scoreMap := make(map[uint]models.Score)
	for _, s := range scores {
		scoreMap[s.StepID] = s
	}

	// Construct response
	type StepResponse struct {
		Step        int    `json:"step"`
		Title       string `json:"title"`
		Description string `json:"description"`
		IsCompleted bool   `json:"is_completed"`
		Score       *struct {
			Score      int `json:"score"`
			Total      int `json:"total"`
			Percentage int `json:"percentage"`
		} `json:"score,omitempty"`
	}

	var stepsResp []StepResponse
	for _, s := range project.Steps {
		var scoreResp *struct {
			Score      int `json:"score"`
			Total      int `json:"total"`
			Percentage int `json:"percentage"`
		}
		isCompleted := false
		if sc, ok := scoreMap[s.ID]; ok {
			isCompleted = true
			scoreResp = &struct {
				Score      int `json:"score"`
				Total      int `json:"total"`
				Percentage int `json:"percentage"`
			}{
				Score:      sc.Score,
				Total:      sc.Total,
				Percentage: sc.Percentage,
			}
		}
		stepsResp = append(stepsResp, StepResponse{
			Step:        s.StepNumber,
			Title:       s.Title,
			Description: s.Description,
			IsCompleted: isCompleted,
			Score:       scoreResp,
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"id":      project.ID,
		"goal":    project.Goal,
		"stack":   project.Stack,
		"level":   project.Level,
		"roadmap": stepsResp,
	})
}

func (h *Handler) GetProject(c echo.Context) error {
	userID := c.Get("userID").(uint)
	projectID := c.Param("id")

	var project models.Project
	if err := h.DB.Where("id = ? AND user_id = ?", projectID, userID).Preload("Steps").First(&project).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Project not found"})
	}

	// Also load scores for the steps
	var scores []models.Score
	stepIDs := make([]uint, len(project.Steps))
	for i, s := range project.Steps {
		stepIDs[i] = s.ID
	}
	h.DB.Where("step_id IN ?", stepIDs).Find(&scores)

	// Map scores to step IDs
	scoreMap := make(map[uint]models.Score)
	for _, s := range scores {
		scoreMap[s.StepID] = s
	}

	// Construct response
	type StepResponse struct {
		Step        int    `json:"step"`
		Title       string `json:"title"`
		Description string `json:"description"`
		IsCompleted bool   `json:"is_completed"`
		Score       *struct {
			Score      int `json:"score"`
			Total      int `json:"total"`
			Percentage int `json:"percentage"`
		} `json:"score,omitempty"`
	}

	var stepsResp []StepResponse
	for _, s := range project.Steps {
		var scoreResp *struct {
			Score      int `json:"score"`
			Total      int `json:"total"`
			Percentage int `json:"percentage"`
		}
		isCompleted := false
		if sc, ok := scoreMap[s.ID]; ok {
			isCompleted = true
			scoreResp = &struct {
				Score      int `json:"score"`
				Total      int `json:"total"`
				Percentage int `json:"percentage"`
			}{
				Score:      sc.Score,
				Total:      sc.Total,
				Percentage: sc.Percentage,
			}
		}
		stepsResp = append(stepsResp, StepResponse{
			Step:        s.StepNumber,
			Title:       s.Title,
			Description: s.Description,
			IsCompleted: isCompleted,
			Score:       scoreResp,
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"id":      project.ID,
		"goal":    project.Goal,
		"stack":   project.Stack,
		"level":   project.Level,
		"roadmap": stepsResp,
	})
}

func (h *Handler) GetStep(c echo.Context) error {
	userID := c.Get("userID").(uint)
	projectID := c.Param("id")
	stepNumber := c.Param("stepNumber")

	var project models.Project
	if err := h.DB.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Project not found"})
	}

	var step models.Step
	if err := h.DB.Where("project_id = ? AND step_number = ?", project.ID, stepNumber).Preload("Quizzes").First(&step).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Step not found"})
	}

	// Format quizzes
	type QuizResponse struct {
		Question    string   `json:"question"`
		Options     []string `json:"options"`
		AnswerIndex int      `json:"answer_index"`
		Explanation string   `json:"explanation"`
	}
	var quizzes []QuizResponse
	for _, q := range step.Quizzes {
		var options []string
		json.Unmarshal(q.Options, &options)

		// Shuffle options
		shuffledOptions := make([]string, len(options))
		copy(shuffledOptions, options)

		// Create a mapping of old index to new index to update AnswerIndex
		perm := rand.Perm(len(options))
		for i, v := range perm {
			shuffledOptions[i] = options[v]
		}

		// Find new answer index
		newAnswerIndex := 0
		for i, v := range perm {
			if v == q.AnswerIndex {
				newAnswerIndex = i
				break
			}
		}

		quizzes = append(quizzes, QuizResponse{
			Question:    q.Question,
			Options:     shuffledOptions,
			AnswerIndex: newAnswerIndex,
			Explanation: q.Explanation,
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"step":        step.StepNumber,
		"title":       step.Title,
		"description": step.Description,
		"quizzes":     quizzes,
	})
}

func (h *Handler) SaveStepScore(c echo.Context) error {
	userID := c.Get("userID").(uint)
	projectID := c.Param("id")
	stepNumber := c.Param("stepNumber")

	type ScoreRequest struct {
		Score      int `json:"score"`
		Total      int `json:"total"`
		Percentage int `json:"percentage"`
	}
	req := new(ScoreRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid input"})
	}

	var project models.Project
	if err := h.DB.Where("id = ? AND user_id = ?", projectID, userID).First(&project).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Project not found"})
	}

	var step models.Step
	if err := h.DB.Where("project_id = ? AND step_number = ?", project.ID, stepNumber).First(&step).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Step not found"})
	}

	// Save or update score
	var score models.Score
	if err := h.DB.Where("step_id = ?", step.ID).First(&score).Error; err == nil {
		score.Score = req.Score
		score.Total = req.Total
		score.Percentage = req.Percentage
		h.DB.Save(&score)
	} else {
		score = models.Score{
			StepID:     step.ID,
			Score:      req.Score,
			Total:      req.Total,
			Percentage: req.Percentage,
		}
		h.DB.Create(&score)
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "success"})
}

func (h *Handler) DeleteProject(c echo.Context) error {
	userID := c.Get("userID").(uint)
	projectID := c.Param("id")

	var project models.Project
	if result := h.DB.Where("id = ? AND user_id = ?", projectID, userID).First(&project); result.Error != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Project not found"})
	}

	// Delete related steps (and quizzes/scores via GORM if configured, but manual for safety here)
	h.DB.Where("project_id = ?", project.ID).Delete(&models.Step{})

	if err := h.DB.Delete(&project).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to delete project"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Project deleted successfully"})
}
