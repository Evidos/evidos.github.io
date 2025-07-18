---
title: Signing Flows
---

With the Signhost API it is possible to facilitate two different signing flows to the signer.

**Invite Flow:** Signhost will send a Sign Request by email to the signer and will facilitate the workflow process by sending reminder emails and emailing the signed results to the signer and the originator.

**Direct Flow:** The Signhost API returns a Sign URL that you will be able to use to directly redirect the signer on your portal or send the signer a message with the signing link yourself.

:::tip
By default the **Direct Flow** will be used when you create a transaction.
:::

If you would like to make use of the **Invite flow**, set the Signer `SendSignRequest` parameter to `true` when creating a transaction.

### Reminders

If you choose to make use of the **Invite flow** we will send a reminder email after 7 days. You can adjust the amount of days by setting the `DaysToRemind` parameter.

A value of -1 disables reminders.

### Signing Artifacts

When the transaction is successfully signed (Status=30) you will be able to GET the signed document and receipt with an HTTP GET request to `api/transaction/${TRANSACTION_ID}/file/{fileId}` or `api/file/receipt/${TRANSACTION_ID}`.

For legal proof it is important to store both the signed document and the receipt.

- The Sender will receive the signed documents and receipt per mail when the **SendEmailNotifications** is set to true.
- The Signers will receive the signed documents and receipt per mail when the **SendSignConfirmation** is set to true.
- The Receivers will always receive the signed documents per mail.
