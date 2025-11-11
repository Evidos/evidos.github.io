import hashlib
import hmac
import os
from flask import Flask, request, Response
import json

app = Flask(__name__)

# Configuration
SHARED_SECRET = os.getenv('SIGNHOST_SHARED_SECRET')
EXPECTED_AUTH_HEADER = os.getenv('SIGNHOST_AUTH_HEADER')

def calculate_checksum(transaction_id: str, status: int, shared_secret: str) -> str:
    """Calculate SHA1 checksum for postback validation."""
    # Note: Double pipe (||) between transaction ID and status
    checksum_string = f"{transaction_id}||{status}|{shared_secret}"
    return hashlib.sha1(checksum_string.encode('utf-8')).hexdigest()

def validate_postback(payload: dict, authorization_header: str) -> tuple[bool, list[str]]:
    """Validate postback payload and return validation result."""
    errors = []
    
    # Step 1: Validate Authorization header
    if authorization_header != EXPECTED_AUTH_HEADER:
        errors.append('Invalid Authorization header')
    
    # Step 2: Validate JSON structure
    if not payload.get('Id') or payload.get('Status') is None or not payload.get('Checksum'):
        errors.append('Missing required fields')
    
    # Step 3: Validate checksum using constant-time comparison
    expected_checksum = calculate_checksum(
        payload.get('Id', ''),
        payload.get('Status', 0),
        SHARED_SECRET
    )
    
    # Use hmac.compare_digest for constant-time comparison to prevent timing attacks
    if not hmac.compare_digest(payload.get('Checksum', ''), expected_checksum):
        errors.append('Invalid checksum')
    
    return (len(errors) == 0, errors)

@app.route('/postback', methods=['POST'])
def receive_postback():
    auth_header = request.headers.get('Authorization')
    
    try:
        payload = request.get_json()
    except Exception as e:
        app.logger.error(f'Invalid JSON: {str(e)}')
        return Response('OK', status=200)
    
    valid, errors = validate_postback(payload, auth_header)
    
    # CRITICAL: Always return 200 OK
    if not valid:
        app.logger.error(f'Invalid postback: {", ".join(errors)}')
        return Response('OK', status=200)
    
    # Process valid postback
    app.logger.info(f'Valid postback received: {payload["Id"]}')
    # ... your business logic here ...
    
    return Response('OK', status=200)

if __name__ == '__main__':
    app.run(port=3000)
