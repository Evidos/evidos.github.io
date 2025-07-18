---
title: Quick Start
---

Get up and running with the Entrust Signhost API in minutes. This guide will walk you through creating your first digital signing transaction.

## Prerequisites

Before you begin, you'll need:

- An active Signhost account. [Sign up here](https://www.signhost.com/) if you don't have one yet.
- A PDF document that you want to have signed

## Step 1: Get Your API Credentials

### 1.1 Generate Application Key

1. Log in to the [Signhost Portal](https://portal.signhost.com)
2. Navigate to the [Application Key](https://portal.signhost.com/ApplicationKey) page
3. Click "Generate New Application Key"
4. Copy and securely store your **Application Key**

### 1.2 Generate User Token

1. Go to the [Settings](https://portal.signhost.com/v2/settings/tokens) page in the portal
2. Click "Generate token"
3. Copy and securely store your **User Token**

:::warning
**Important**: Both keys are only shown once during generation. Store them securely - if you lose them, you'll need to generate new ones.
:::

## Step 2: Create Your First Transaction

### 2.1 Create a New Transaction

Make a `POST` request to create a new transaction:

```bash
curl -X POST "https://api.signhost.com/api/transaction" \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "Signers": [
      {
        "Email": "signer@example.com",
        "SignRequestMessage": "Please sign this document",
        "SendSignRequest": true,
        "Verifications": [{
          "Type": "Consent"
         }]
      }
    ]
  }'
```

**Response**: You'll receive a transaction object with an `Id` field. This is the `transactionId` that you'll need for the next steps.

### 2.2 Upload Your Document

Upload the PDF document to be signed:

```bash
curl -X PUT "https://api.signhost.com/api/transaction/${TRANSACTION_ID}/file/document.pdf" \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -H "Content-Type: application/pdf" \
  --data-binary @/path/to/your/document.pdf
```

Replace:

- `${TRANSACTION_ID}` with the ID from step 2.1
- `document.pdf` with your desired filename
- `/path/to/your/document.pdf` with the actual path to your PDF

### 2.3 Start the Transaction

Activate the transaction to send signing invitations:

```bash
curl -X PUT "https://api.signhost.com/api/transaction/${TRANSACTION_ID}/start" \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}"
```

## Step 3: Monitor Transaction Status

### Recommended Approach: Use Postbacks

The best way to monitor transaction status is by configuring [**postbacks**](../features/postbacks.md) (webhooks) that notify your application when status changes occur.

The recommended way to set up postbacks is to configure a [Global Postback URL](../features/postbacks#global-postback-url-recommended). Global postbacks support security features like digest security and security headers.

The example below shows how to set a [Dynamic Postback URL](../features/postbacks#dynamic-postback-url) when creating a transaction:

```bash
# Include postback URL when creating transaction
curl -X POST "https://api.signhost.com/api/transaction" \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "Signers": [
      {
        "Email": "signer@example.com",
        "SignRequestMessage": "Please sign this document",
        "SendSignRequest": true,
        "Verifications": [{
          "Type": "Consent"
         }]
      }
    ],
    "PostbackUrl": "https://yourapp.com/webhook/signhost"
  }'
```

Your webhook endpoint will receive real-time notifications when the transaction status changes.

### Alternative: Check Status Once

:::warning
**Important**: We recommend **NOT** polling the GET transaction API to monitor status changes. This can impact performance and may result in rate limiting.
:::

If you need to check the current status (not for monitoring), you can query it once:

```bash
curl -X GET "https://api.signhost.com/api/transaction/${TRANSACTION_ID}" \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}"
```

The response will include a `Status` field. See the [Statuses & Activites](../features/status#transaction-status) page for possible values.

## Complete Example

Here's a complete example using curl to create and start a transaction:

```bash
# 1. Create transaction
TRANSACTION_RESPONSE=$(curl -s -X POST "https://api.signhost.com/api/transaction" \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "Signers": [
      {
        "Email": "signer@example.com",
        "SignRequestMessage": "Please sign this document",
        "SendSignRequest": true,
        "Verifications": [
          {
            "Type": "Consent"
          }
        ]
      }
    ]
  }')

# Extract transaction ID (requires jq)
TRANSACTION_ID=$(echo $TRANSACTION_RESPONSE | jq -r '.Id')

# 2. Upload document
curl -X PUT "https://api.signhost.com/api/transaction/$TRANSACTION_ID/file/contract.pdf" \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -H "Content-Type: application/pdf" \
  --data-binary @contract.pdf

# 3. Start transaction
curl -X PUT "https://api.signhost.com/api/transaction/$TRANSACTION_ID/start" \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}"

echo "Transaction created with ID: $TRANSACTION_ID"
```

## Next Steps

Now that you've created your first transaction, explore these advanced features:

- **[Multiple Documents](../guides/multidocument-transaction.md)**: Include multiple files in one transaction
- **[Form Fields](../guides/fillable-pdf-fields.md)**: Add fillable form fields to your documents

## Need Help?

- **API Reference**: Explore the full [API documentation](../../openapi/index.md)
- **Support**: Contact [support@signhost.com](mailto:support@signhost.com)
- **Community**: Try our [Postman workspace](https://www.postman.com/dark-capsule-755015/signhost-api-public/overview) for quick testing
