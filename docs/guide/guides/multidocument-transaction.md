---
title: Multi-document Transaction
---

This guide will explain how to create a transaction with multiple documents.

### Overview

A transaction can contain multiple documents that need to be signed by one or more signers. Each document can have its own signature locations, and you can specify the order in which the documents are signed.

To create a multi-document transaction, you will follow these steps:

1. **Create a transaction**: This will initialize a new transaction and return a `transactionId`.

   [`POST /api/transaction/`](../../openapi/transactions/createTransaction.md)

2. **Add files to the transaction**: For each document you want to include, you will upload the file using the `transactionId` and a unique `fileId`.

   [`PUT /api/transaction/:transactionId/file/:fileId`](../../openapi/files/uploadFile.md)

3. **Start the transaction**: Once all files are uploaded, you will start the transaction to notify the signers.

   [`PUT /api/transaction/:transactionId/start`](../../openapi/transactions/startTransaction.md)

### Prerequisites

You will need an APP key and User Token to authenticate your requests. Make sure you have these ready before proceeding.

See the [Authentication guide](../features/authentication.md) for more details on how to obtain these tokens.

### Detailed Steps

#### 1. Create a Transaction

Use the [`POST /api/transaction/`](../../openapi/transactions/createTransaction.md) endpoint to create a new transaction. This will return an `id` that you will use in subsequent requests.

Example:

```bash
curl \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "Signers": [
      {
        "Email": "user@example.com",
        "Verifications": [
          {
            "Type": "Scribble",
            "ScribbleName": "John Doe",
            "ScribbleNameFixed": false
          }
        ],
        "SendSignRequest": true,
        "SignRequestMessage": "Hello, could you please sign this document? Best regards, John Doe",
        "DaysToRemind": 15
      }
  ],
    "SendEmailNotifications": true
  }'
  https://api.signhost.com/api/transaction/
```

You should receive a response with the transaction details, including the `Id` which is your `transactionId`.

```json
{
   "Id": "b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57",
   "Status": 5,
   "Signers": [
    {
      "Email": "user@example.com",
      "RequireScribble": true,
      "SendSignRequest": true,
      "SignRequestMessage": "Hello, could you please sign this document? Best regards, John Doe",
      "DaysToRemind": 15,
      "ScribbleName": "John Doe",
      "ScribbleNameFixed": false
    }
 }
}
```

The id `b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57` is the transactionId and you will need this in the next requests.

#### 2. Add File to Transaction

Use the [`PUT /api/transaction/:transactionId/file/:fileId`](../../openapi/files/uploadFile.md) endpoint to add files to the transaction. Each file must have a unique `fileId`.

Example:

```bash
curl \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -H "Content-Type: application/pdf" \
  -X PUT \
  -T Contract1.pdf \
  https://api.signhost.com/api/transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57/file/Contract1.pdf

curl \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  -H "Content-Type: application/pdf" \
  -X PUT \
  -T Contract2.pdf \
  https://api.signhost.com/api/transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57/file/Contract2.pdf
```

This will upload the `Contract1.pdf` and `Contract2.pdf` files to transaction `b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57` and set the `fileId` to `Contract1.pdf` and `Contract2.pdf` respectively.

#### 3. Start the Transaction

Use the [`PUT /api/transaction/:transactionId/start`](../../openapi/transactions/startTransaction.md) endpoint to start the transaction. This will notify the signers that they can now view and sign the documents.

Example:

```bash
curl \
  -H "Authorization: APIKey ${API_KEY}" \
  -H "Application: APPKey ${APP_KEY}" \
  https://api.signhost.com/api/transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57/start
```

This will start the transaction and notify the signers that they can now view and sign the documents.

### Conclusion

You have now created a multi-document transaction using the Signhost API. You can repeat the process to add more documents or signers as needed. For more details on each endpoint, refer to the [API Reference](../../openapi/index.md) or the specific guides for each feature.
