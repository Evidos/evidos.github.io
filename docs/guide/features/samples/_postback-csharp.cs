using System;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;

public class PostbackController : ControllerBase
{
    private readonly string _sharedSecret = Environment.GetEnvironmentVariable("SIGNHOST_SHARED_SECRET");
    private readonly string _expectedAuthHeader = Environment.GetEnvironmentVariable("SIGNHOST_AUTH_HEADER");

    private string CalculateChecksum(string transactionId, int status, string sharedSecret)
    {
        // Note: Double pipe (||) between transaction ID and status
        var checksumString = $"{transactionId}||{status}|{sharedSecret}";
        
        using (var sha1 = SHA1.Create())
        {
            var hash = sha1.ComputeHash(Encoding.UTF8.GetBytes(checksumString));
            return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
        }
    }

    private (bool valid, List<string> errors) ValidatePostback(PostbackPayload payload, string authorizationHeader)
    {
        var errors = new List<string>();
        
        // Step 1: Validate Authorization header
        if (authorizationHeader != _expectedAuthHeader)
        {
            errors.Add("Invalid Authorization header");
        }
        
        // Step 2: Validate JSON structure
        if (string.IsNullOrEmpty(payload.Id) || string.IsNullOrEmpty(payload.Checksum))
        {
            errors.Add("Missing required fields");
        }
        
        // Step 3: Validate checksum using constant-time comparison
        var expectedChecksum = CalculateChecksum(payload.Id, payload.Status, _sharedSecret);
        
        // Use CryptographicOperations.FixedTimeEquals for constant-time comparison to prevent timing attacks
        var expectedBytes = Encoding.UTF8.GetBytes(expectedChecksum);
        var receivedBytes = Encoding.UTF8.GetBytes(payload.Checksum ?? "");
        
        if (expectedBytes.Length != receivedBytes.Length || 
            !CryptographicOperations.FixedTimeEquals(expectedBytes, receivedBytes))
        {
            errors.Add("Invalid checksum");
        }
        
        return (errors.Count == 0, errors);
    }

    [HttpPost("postback")]
    public IActionResult ReceivePostback([FromBody] PostbackPayload payload)
    {
        var authHeader = Request.Headers["Authorization"].ToString();
        var validation = ValidatePostback(payload, authHeader);
        
        // CRITICAL: Always return 200 OK
        if (!validation.valid)
        {
            _logger.LogError("Invalid postback: {Errors}", string.Join(", ", validation.errors));
            return Ok();
        }
        
        // Process valid postback
        _logger.LogInformation("Valid postback received: {TransactionId}", payload.Id);
        // ... your business logic here ...
        
        return Ok();
    }
}

public class PostbackPayload
{
    public string Id { get; set; }
    public int Status { get; set; }
    public string Checksum { get; set; }
    // Add other properties as needed
}
