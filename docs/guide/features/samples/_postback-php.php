<?php

// Configuration
$sharedSecret = getenv('SIGNHOST_SHARED_SECRET');
$expectedAuthHeader = getenv('SIGNHOST_AUTH_HEADER');

function calculateChecksum($transactionId, $status, $sharedSecret) {
    // Note: Double pipe (||) between transaction ID and status
    $checksumString = $transactionId . '||' . $status . '|' . $sharedSecret;
    return sha1($checksumString);
}

function validatePostback($payload, $authorizationHeader) {
    global $sharedSecret, $expectedAuthHeader;
    $errors = [];
    
    // Step 1: Validate Authorization header
    if ($authorizationHeader !== $expectedAuthHeader) {
        $errors[] = 'Invalid Authorization header';
    }
    
    // Step 2: Validate JSON structure
    if (empty($payload['Id']) || !isset($payload['Status']) || empty($payload['Checksum'])) {
        $errors[] = 'Missing required fields';
    }
    
    // Step 3: Validate checksum using constant-time comparison
    $expectedChecksum = calculateChecksum(
        $payload['Id'] ?? '',
        $payload['Status'] ?? 0,
        $sharedSecret
    );
    
    // Use hash_equals for constant-time comparison to prevent timing attacks
    if (!hash_equals($expectedChecksum, $payload['Checksum'] ?? '')) {
        $errors[] = 'Invalid checksum';
    }
    
    return [
        'valid' => count($errors) === 0,
        'errors' => $errors
    ];
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $rawBody = file_get_contents('php://input');
    $payload = json_decode($rawBody, true);
    
    // Check for JSON parsing errors
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log('Invalid JSON: ' . json_last_error_msg());
        http_response_code(200);
        echo 'OK';
        exit;
    }
    
    $validation = validatePostback($payload, $authHeader);
    
    // CRITICAL: Always return 200 OK
    if (!$validation['valid']) {
        error_log('Invalid postback: ' . implode(', ', $validation['errors']));
        http_response_code(200);
        echo 'OK';
        exit;
    }
    
    // Process valid postback
    error_log('Valid postback received: ' . $payload['Id']);
    // ... your business logic here ...
    
    http_response_code(200);
    echo 'OK';
    exit;
}

http_response_code(404);
echo 'Not Found';
