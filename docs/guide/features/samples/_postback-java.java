import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
public class PostbackController {
    
    private final String sharedSecret = System.getenv("SIGNHOST_SHARED_SECRET");
    private final String expectedAuthHeader = System.getenv("SIGNHOST_AUTH_HEADER");
    
    private String calculateChecksum(String transactionId, int status, String sharedSecret) 
            throws NoSuchAlgorithmException {
        // Note: Double pipe (||) between transaction ID and status
        String checksumString = transactionId + "||" + status + "|" + sharedSecret;
        
        MessageDigest md = MessageDigest.getInstance("SHA-1");
        byte[] hash = md.digest(checksumString.getBytes());
        
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        
        return hexString.toString();
    }
    
    private ValidationResult validatePostback(PostbackPayload payload, String authorizationHeader) 
            throws NoSuchAlgorithmException {
        List<String> errors = new ArrayList<>();
        
        // Step 1: Validate Authorization header
        if (!authorizationHeader.equals(expectedAuthHeader)) {
            errors.add("Invalid Authorization header");
        }
        
        // Step 2: Validate JSON structure
        if (payload.getId() == null || payload.getChecksum() == null) {
            errors.add("Missing required fields");
        }
        
        // Step 3: Validate checksum using constant-time comparison
        String expectedChecksum = calculateChecksum(
            payload.getId(),
            payload.getStatus(),
            sharedSecret
        );
        
        // Use MessageDigest.isEqual for constant-time comparison to prevent timing attacks
        byte[] expectedBytes = expectedChecksum.getBytes();
        byte[] receivedBytes = (payload.getChecksum() != null ? payload.getChecksum() : "").getBytes();
        
        if (!MessageDigest.isEqual(expectedBytes, receivedBytes)) {
            errors.add("Invalid checksum");
        }
        
        return new ValidationResult(errors.isEmpty(), errors);
    }
    
    @PostMapping("/postback")
    public ResponseEntity<String> receivePostback(
            @RequestBody PostbackPayload payload,
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            ValidationResult validation = validatePostback(payload, authHeader);
            
            // CRITICAL: Always return 200 OK
            if (!validation.isValid()) {
                System.err.println("Invalid postback: " + String.join(", ", validation.getErrors()));
                return ResponseEntity.ok("OK");
            }
            
            // Process valid postback
            System.out.println("Valid postback received: " + payload.getId());
            // ... your business logic here ...
            
            return ResponseEntity.ok("OK");
            
        } catch (Exception e) {
            System.err.println("Error processing postback: " + e.getMessage());
            return ResponseEntity.ok("OK");
        }
    }
}

class PostbackPayload {
    private String id;
    private int status;
    private String checksum;
    
    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    public String getChecksum() { return checksum; }
    public void setChecksum(String checksum) { this.checksum = checksum; }
}

class ValidationResult {
    private boolean valid;
    private List<String> errors;
    
    public ValidationResult(boolean valid, List<String> errors) {
        this.valid = valid;
        this.errors = errors;
    }
    
    public boolean isValid() { return valid; }
    public List<String> getErrors() { return errors; }
}
