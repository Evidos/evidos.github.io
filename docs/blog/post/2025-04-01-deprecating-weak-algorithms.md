---
title: Deprecating Weak Algorithms
date: 2025-04-01 08:00:00
outline: false
sidebar: false
---

_April 01, 2025_

# Strengthening Security: Deprecating Weak Hash Algorithms in File Upload API

As part of our ongoing commitment to security best practices, we're announcing the deprecation of weak cryptographic hash algorithms in the Signhost REST API file upload endpoint. This change enhances the security of document integrity verification and aligns with modern cryptographic standards.

## What's Changing

The `/api/transaction/${TRANSACTION_ID}/file/{fileId}` endpoint will no longer accept MD5 and SHA-1 digest headers. These algorithms have known vulnerabilities and are considered cryptographically weak by current security standards.

### Affected Algorithms (Being Deprecated)

- **MD5** - Vulnerable to collision attacks since 2004
- **SHA-1** - Deprecated by NIST and major browsers due to collision vulnerabilities

### Supported Algorithms (Recommended)

- **SHA-256** - Industry standard, secure hash algorithm
- **SHA-512** - Enhanced security with longer hash length

## Why This Change Matters

Cryptographic hash algorithms are essential for verifying file integrity during upload. Weak algorithms like MD5 and SHA-1 can be exploited by attackers to create malicious files that produce the same hash as legitimate documents, potentially compromising document authenticity.

By requiring stronger algorithms, we ensure:

- **Enhanced Security**: Protection against collision and preimage attacks
- **Compliance**: Alignment with industry security standards (NIST, FIPS)
- **Future-Proofing**: Preparation for evolving security requirements

## Migration Guide

### Current Implementation (Deprecated)

```bash
# ❌ Will be rejected
curl -X PUT "https://api.signhost.com/api/transaction/${TRANSACTION_ID}/file/document.pdf" \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -H "Content-Type: application/pdf" \
  -H "Digest: MD5=XrY7u+Ae7tCTyyK7j1rNww==" \
  --data-binary @document.pdf
```

### Updated Implementation (Recommended)

```bash
# ✅ Use SHA-256 for secure file integrity verification
curl -X PUT "https://api.signhost.com/api/transaction/${TRANSACTION_ID}/file/document.pdf" \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -H "Content-Type: application/pdf" \
  -H "Digest: SHA-256=HtHRpLOZBEMnTpQS6Zn12veC4uhjtMwamfVAwmPQPmE=" \
  --data-binary @document.pdf
```

### Code Examples

#### C# (.NET)

```csharp
using System.Security.Cryptography;

public static string GenerateSHA256Digest(byte[] fileBytes)
{
    using (var sha256 = SHA256.Create())
    {
        var hash = sha256.ComputeHash(fileBytes);
        var base64Hash = Convert.ToBase64String(hash);
        return $"SHA-256={base64Hash}";
    }
}
```

## SDK Updates

The official .NET SDK has long used SHA-256 by default, ensuring secure file uploads. Other SDKs and libraries should be updated to use SHA-256 or SHA-512 for digest calculations.

## Need Help?

If you have questions about this migration:

- **Documentation**: [File Upload API Reference](../../openapi/files/uploadFile.md)
- **Support**: Contact [support@signhost.com](mailto:support@signhost.com)

---

This change reinforces our commitment to providing a secure, enterprise-grade digital signing platform. We appreciate your cooperation in maintaining the highest security standards for document integrity verification.

_The Signhost Developer Team_
