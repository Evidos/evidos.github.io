---
title: Sealing and seal-only transactions
---

Signhost supports sealing documents in any signing transaction and also offers seal-only transactions where only your organization applies a seal without involving external signers.

### What is sealing?

A seal is an electronic organizational stamp applied by Signhost on behalf of your organization using a dedicated sealing certificate. The seal is embedded in the PDF and recorded in the transaction audit trail, so anyone can verify the integrity and origin of the document afterwards.

### Sealing vs signing

A signer represents a natural person who signs a document, while a seal represents your organization as a legal entity. In a regular signing transaction, signers apply signatures and Signhost optionally applies a seal; in a seal-only transaction, no signers are invited and only the seal is applied.

### Seal types

#### Advanced sealing (default)

By default, sealing uses an **advanced electronic seal** that provides integrity protection and clear evidence that your organization sealed the document. This default seal is applied by Signhost without requiring you to manage certificates or cryptographic keys yourself.

#### Qualified sealing (QSeal)

With **QSeal** enabled, the seal is created with a qualified certificate linked to your organization as a legal entity, meeting higher assurance and regulatory standards. QSeal is a paid add-on that can be activated per environment or account, after which all sealed documents for that configuration are sealed using the qualified certificate.

### Benefits of using sealing

Sealing lets you send the complete PDF to Signhost and receive it back fully sealed, instead of having to compute a hash, build a signature container, and inject timestamps yourself. Signhost handles the full sealing pipeline: hashing, signing with the appropriate (advanced or qualified) certificate, and applying a trusted timestamp, so your integration stays simple and you avoid dealing with low-level cryptography.

### Enabling sealing on a transaction

Sealing is controlled via the `Seal` property on the Transaction model. When `Seal` is `true`, Signhost will seal the final document after all signing is completed. The `Seal` flag is visible both when creating a transaction and when retrieving it through `GET /api/transaction/{transactionId}`, so you can confirm that sealing was active.

#### Example: Regular signing transaction with sealing

```json
POST /api/transaction
{
  "Seal": true,
  "Signers": [
    {
      "Email": "user@example.com",
      "SendSignRequest": true,
      "SignRequestMessage": "Please sign this contract",
      "DaysToRemind": 7
    }
  ],
  "SendEmailNotifications": true
}
```

In this example, the signer will first sign the document, and then Signhost will apply a seal on behalf of your organization.

### Creating a seal-only transaction

A seal-only transaction is a regular transaction with `Seal` set to `true` and without any signers. Signhost seals the uploaded document as soon as the transaction is started. This pattern is useful for internal archiving, issuing digitally sealed statements, or automatically sealing system-generated PDFs without human interaction.

#### Example: Seal-only transaction

**Create the transaction**

```json
POST /api/transaction
{
  "Seal": true,
  "Signers": [],
  "SendEmailNotifications": false,
  "Reference": "Monthly-report-2026-01"
}
```

**Upload the document**

```http
PUT /api/transaction/{transactionId}/file/file.pdf
Authorization: APIKey {usertoken}
Application: APPKey {appkey}
Content-Type: application/pdf
Digest: SHA-256=...

<PDF file content>
```

**Start the transaction**

```http
PUT /api/transaction/{transactionId}/start
Authorization: APIKey {usertoken}
Application: APPKey {appkey}
```

Once the transaction is started, Signhost will seal the document and mark the transaction as completed (status `30`).

### Retrieving sealed documents and receipt

Use `GET /api/transaction/{transactionId}/file/file.pdf` to download the sealed PDF once the transaction reaches an end status (for example, status `30` for completed).

Use `GET /api/file/receipt/{transactionId}` to retrieve the evidential receipt that contains the full audit trail, including the information that a seal was applied to the document.

#### Example: Download sealed document

```bash
curl \
  -H "Authorization: APIKey {usertoken}" \
  -H "Application: APPKey {appkey}" \
  https://api.signhost.com/api/transaction/{transactionId}/file/Report.pdf \
  -o sealed-report.pdf
```

#### Example: Download receipt

```bash
curl \
  -H "Authorization: APIKey {usertoken}" \
  -H "Application: APPKey {appkey}" \
  https://api.signhost.com/api/file/receipt/{transactionId} \
  -o receipt.pdf
```

### Use cases

#### Internal document archiving

Seal official documents, such as board resolutions or policy updates, before storing them in your document management system to ensure their integrity and authenticity.

#### Automated document generation

Automatically seal system-generated invoices, statements, or reports without requiring manual signing, streamlining your document workflows.

#### Multi-party contracts with organizational seal

Combine signer signatures with an organizational seal to demonstrate that both individuals and your organization endorse the contract.

### Related resources

- [Transaction endpoints](../../openapi/)
- [Statuses & Activities](/status/)
- [Postback service](/postbacks/)
