package handlers

import (
	"encoding/json"
	"io"
	"net/http"

	"github/meso1007/reverse-learn/backend/internal/models"

	"github.com/labstack/echo/v4"
	"github.com/stripe/stripe-go/v79"
)

func (h *Handler) Subscribe(c echo.Context) error {
	userID := c.Get("userID").(uint)
	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
	}

	if user.SubscriptionPlan == "pro" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Already subscribed"})
	}

	// Create Stripe Customer if not exists
	if user.StripeCustomerID == "" {
		customerID, err := h.PaymentService.CreateCustomer(user.Email, user.Username)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create payment customer"})
		}
		user.StripeCustomerID = customerID
		h.DB.Save(&user)
	}

	url, err := h.PaymentService.CreateCheckoutSession(user.StripeCustomerID, user.Email)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create checkout session"})
	}

	return c.JSON(http.StatusOK, map[string]string{"url": url})
}

func (h *Handler) ManageSubscription(c echo.Context) error {
	userID := c.Get("userID").(uint)
	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
	}

	if user.StripeCustomerID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "No subscription found"})
	}

	url, err := h.PaymentService.CreatePortalSession(user.StripeCustomerID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create portal session"})
	}

	return c.JSON(http.StatusOK, map[string]string{"url": url})
}

func (h *Handler) StripeWebhook(c echo.Context) error {
	const MaxBodyBytes = int64(65536)
	c.Request().Body = http.MaxBytesReader(c.Response(), c.Request().Body, MaxBodyBytes)
	payload, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	event, err := h.PaymentService.ConstructEvent(payload, c.Request().Header.Get("Stripe-Signature"))
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	switch event.Type {
	case "checkout.session.completed":
		var session stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}
		h.handleCheckoutCompleted(&session)

	case "customer.subscription.updated":
		var subscription stripe.Subscription
		if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}
		h.handleSubscriptionUpdated(&subscription)

	case "customer.subscription.deleted":
		var subscription stripe.Subscription
		if err := json.Unmarshal(event.Data.Raw, &subscription); err != nil {
			return c.NoContent(http.StatusBadRequest)
		}
		h.handleSubscriptionDeleted(&subscription)
	}

	return c.NoContent(http.StatusOK)
}

func (h *Handler) handleCheckoutCompleted(session *stripe.CheckoutSession) {
	if session.Customer == nil {
		return
	}
	customerID := session.Customer.ID

	var user models.User
	if err := h.DB.Where("stripe_customer_id = ?", customerID).First(&user).Error; err != nil {
		// Try to find by email if customer ID not yet saved (race condition)
		if session.CustomerDetails != nil && session.CustomerDetails.Email != "" {
			if err := h.DB.Where("email = ?", session.CustomerDetails.Email).First(&user).Error; err != nil {
				return
			}
			user.StripeCustomerID = customerID
		} else {
			return
		}
	}

	if session.Subscription != nil {
		user.SubscriptionID = session.Subscription.ID
		user.SubscriptionStatus = "active"
		user.SubscriptionPlan = "pro"
		h.DB.Save(&user)
	}
}

func (h *Handler) handleSubscriptionUpdated(sub *stripe.Subscription) {
	var user models.User
	if err := h.DB.Where("stripe_customer_id = ?", sub.Customer.ID).First(&user).Error; err != nil {
		return
	}

	user.SubscriptionStatus = string(sub.Status)
	if sub.Status == stripe.SubscriptionStatusActive {
		user.SubscriptionPlan = "pro"
	} else {
		// Keep plan as pro if past_due, but maybe restrict access elsewhere?
		// For now, simple logic:
		if sub.Status == stripe.SubscriptionStatusCanceled || sub.Status == stripe.SubscriptionStatusUnpaid {
			user.SubscriptionPlan = "free"
		}
	}
	h.DB.Save(&user)
}

func (h *Handler) handleSubscriptionDeleted(sub *stripe.Subscription) {
	var user models.User
	if err := h.DB.Where("stripe_customer_id = ?", sub.Customer.ID).First(&user).Error; err != nil {
		return
	}

	user.SubscriptionStatus = "canceled"
	user.SubscriptionPlan = "free"
	user.SubscriptionID = ""
	h.DB.Save(&user)
}
