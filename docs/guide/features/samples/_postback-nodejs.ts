import { createHash, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";

// Configuration
const SHARED_SECRET = process.env.SIGNHOST_SHARED_SECRET ?? "";
const EXPECTED_AUTH_HEADER = process.env.SIGNHOST_AUTH_HEADER ?? "";

interface PostbackPayload {
  Id: string;
  Status: number;
  Checksum: string;
  [key: string]: unknown;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function calculateChecksum(
  transactionId: string,
  status: number,
  sharedSecret: string,
): string {
  // Note: Double pipe (||) between transaction ID and status
  const checksumString = `${transactionId}||${status}|${sharedSecret}`;
  return createHash("sha1").update(checksumString).digest("hex");
}

function validatePostback(
  payload: PostbackPayload,
  authorizationHeader: string | undefined,
): ValidationResult {
  const errors: string[] = [];

  // Step 1: Validate Authorization header
  if (authorizationHeader !== EXPECTED_AUTH_HEADER) {
    errors.push("Invalid Authorization header");
  }

  // Step 2: Validate JSON structure
  if (!payload.Id || payload.Status === undefined || !payload.Checksum) {
    errors.push("Missing required fields");
  }

  // Step 3: Validate checksum using constant-time comparison
  const expectedChecksum = calculateChecksum(
    payload.Id,
    payload.Status,
    SHARED_SECRET,
  );

  // Use timingSafeEqual for constant-time comparison to prevent timing attacks
  const expectedBuffer = Buffer.from(expectedChecksum);
  const receivedBuffer = Buffer.from(payload.Checksum || "");

  if (
    expectedBuffer.length !== receivedBuffer.length ||
    !timingSafeEqual(expectedBuffer, receivedBuffer)
  ) {
    errors.push("Invalid checksum");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Express.js example
app.post("/postback", express.json(), (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const payload = req.body as PostbackPayload;

  const validation = validatePostback(payload, authHeader);

  // CRITICAL: Always return 200 OK
  if (!validation.valid) {
    console.error("Invalid postback:", validation.errors);
    return res.status(200).send("OK");
  }

  // Process valid postback
  console.log("Valid postback received:", payload.Id);
  // ... your business logic here ...

  res.status(200).send("OK");
});
