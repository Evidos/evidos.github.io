package main

import (
	"crypto/sha1"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

// Configuration
var (
	sharedSecret       = os.Getenv("SIGNHOST_SHARED_SECRET")
	expectedAuthHeader = os.Getenv("SIGNHOST_AUTH_HEADER")
)

type PostbackPayload struct {
	ID       string `json:"Id"`
	Status   int    `json:"Status"`
	Checksum string `json:"Checksum"`
}

type ValidationResult struct {
	Valid  bool
	Errors []string
}

func calculateChecksum(transactionID string, status int, sharedSecret string) string {
	// Note: Double pipe (||) between transaction ID and status
	checksumString := fmt.Sprintf("%s||%d|%s", transactionID, status, sharedSecret)

	hash := sha1.New()
	hash.Write([]byte(checksumString))
	return hex.EncodeToString(hash.Sum(nil))
}

func validatePostback(payload PostbackPayload, authorizationHeader string) ValidationResult {
	errors := []string{}

	// Step 1: Validate Authorization header
	if authorizationHeader != expectedAuthHeader {
		errors = append(errors, "Invalid Authorization header")
	}

	// Step 2: Validate JSON structure
	if payload.ID == "" || payload.Checksum == "" {
		errors = append(errors, "Missing required fields")
	}

	// Step 3: Validate checksum using constant-time comparison
	expectedChecksum := calculateChecksum(payload.ID, payload.Status, sharedSecret)

	// Use subtle.ConstantTimeCompare for constant-time comparison to prevent timing attacks
	if subtle.ConstantTimeCompare([]byte(payload.Checksum), []byte(expectedChecksum)) != 1 {
		errors = append(errors, "Invalid checksum")
	}

	return ValidationResult{
		Valid:  len(errors) == 0,
		Errors: errors,
	}
}

func postbackHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	authHeader := r.Header.Get("Authorization")

	var payload PostbackPayload
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		log.Printf("Invalid JSON: %v", err)
		// CRITICAL: Always return 200 OK
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, "OK")
		return
	}

	validation := validatePostback(payload, authHeader)

	// CRITICAL: Always return 200 OK
	if !validation.Valid {
		log.Printf("Invalid postback: %v", validation.Errors)
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, "OK")
		return
	}

	// Process valid postback
	log.Printf("Valid postback received: %s", payload.ID)
	// ... your business logic here ...

	w.WriteHeader(http.StatusOK)
	fmt.Fprint(w, "OK")
}

func main() {
	http.HandleFunc("/postback", postbackHandler)

	log.Println("Server starting on :3000")
	if err := http.ListenAndServe(":3000", nil); err != nil {
		log.Fatal(err)
	}
}
