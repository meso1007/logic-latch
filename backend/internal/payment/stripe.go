package payment

import (
	"errors"
	"os"
	"github.com/stripe/stripe-go/v79"
	billingportalsession "github.com/stripe/stripe-go/v79/billingportal/session"
	checkoutsession "github.com/stripe/stripe-go/v79/checkout/session"
	"github.com/stripe/stripe-go/v79/customer"
	"github.com/stripe/stripe-go/v79/webhook"
)

type Service struct {
	StripeKey      string
	WebhookSecret  string
	PremiumPriceID string
	AppURL         string
}

func NewService() *Service {
	key := os.Getenv("STRIPE_SECRET_KEY")
	stripe.Key = key
	return &Service{
		StripeKey:      key,
		WebhookSecret:  os.Getenv("STRIPE_WEBHOOK_SECRET"),
		PremiumPriceID: os.Getenv("STRIPE_PRICE_ID_PREMIUM"),
		AppURL:         os.Getenv("NEXT_PUBLIC_APP_URL"),
	}
}

func (s *Service) CreateCustomer(email, name string) (string, error) {
	params := &stripe.CustomerParams{
		Email: stripe.String(email),
		Name:  stripe.String(name),
	}
	c, err := customer.New(params)
	if err != nil {
		return "", err
	}
	return c.ID, nil
}

func (s *Service) CreateCheckoutSession(customerID, email string) (string, error) {
	if s.PremiumPriceID == "" || s.AppURL == "" {
		return "", errors.New("stripe configuration missing")
	}

	params := &stripe.CheckoutSessionParams{
		Customer: stripe.String(customerID),
		Mode:     stripe.String(string(stripe.CheckoutSessionModeSubscription)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(s.PremiumPriceID),
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String(s.AppURL + "/upgrade/success?session_id={CHECKOUT_SESSION_ID}"),
		CancelURL:  stripe.String(s.AppURL + "/upgrade"),
	}

	sess, err := checkoutsession.New(params)
	if err != nil {
		return "", err
	}
	return sess.URL, nil
}

func (s *Service) CreatePortalSession(customerID string) (string, error) {
	if s.AppURL == "" {
		return "", errors.New("app url missing")
	}

	params := &stripe.BillingPortalSessionParams{
		Customer:  stripe.String(customerID),
		ReturnURL: stripe.String(s.AppURL + "/settings"),
	}

	sess, err := billingportalsession.New(params)
	if err != nil {
		return "", err
	}
	return sess.URL, nil
}

func (s *Service) ConstructEvent(payload []byte, header string) (stripe.Event, error) {
	return webhook.ConstructEvent(payload, header, s.WebhookSecret)
}
