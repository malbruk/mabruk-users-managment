package handlers

import (
	"encoding/json"
	"net/http"
)

// HealthResponse represents the JSON payload returned by the health-check endpoint.
type HealthResponse struct {
	Status string `json:"status"`
}

// HealthHandler writes a simple JSON response to confirm the API is running.
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(HealthResponse{Status: "ok"})
}
