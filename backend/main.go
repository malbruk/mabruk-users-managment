package main

import (
	"log"
	"net/http"

	"backend/config"
	"backend/internal/handlers"
	"backend/internal/middleware"
)

func main() {
	cfg := config.Load()

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", handlers.HealthHandler)

	handler := middleware.Logging(mux)

	log.Printf("Starting server on %s", cfg.Addr())
	if err := http.ListenAndServe(cfg.Addr(), handler); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
