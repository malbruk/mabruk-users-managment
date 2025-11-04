package config

import (
	"fmt"
	"os"
)

// AppConfig defines the configuration values required for the application to run.
type AppConfig struct {
	Port string
}

// Load reads environment variables and constructs an AppConfig with sensible defaults.
func Load() AppConfig {
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	return AppConfig{Port: port}
}

// Addr returns the address the server should listen on.
func (c AppConfig) Addr() string {
	return fmt.Sprintf(":%s", c.Port)
}
