# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -o main ./cmd/server/main.go

# Final stage
FROM alpine:latest

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache ca-certificates

# Copy binary from builder
COPY --from=builder /app/main .
# Copy .env if it exists (optional, usually handled by docker-compose or k8s secrets)
# COPY .env .

# Expose the port
EXPOSE 8080

# Command to run the executable
CMD ["./main"]
