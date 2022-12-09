---
layout: page
title: Postback
permalink: /postback/
---

The Signhost postback service is meant to provide realtime updates on your transactions.
Please refrain from active polling with GET requests to stay up-to-date.
If you cannot implement the postback service, or you have any questions regarding the service, please contact [support](mailto:support@evidos.nl).

### Advised postback implementation flow

To avoid postback queues for your application, we advise the following flow once a postback arrives at your server:
  1. Perform [security validation](#security)
      * Validate the security header (if setup), if not move to step 2;
      * Validate the body is valid JSON, if not move to step 2;
      * Validate the JSON has a Checksum property, if not move to step 2;
      * Validate the Checksum value, if there is a mismatch move to step 2.
  2. Always return a 200 OK response*
	    * Skip rest of the steps if the checksum validation failed.
  3. Save verified postback to storage
  4. Continue business logic

\* This is a security precaution which prevents information on your validation process to return to the - potentially malicious - sender of the postback.
Any other response than `2xx` will lead to the formation of a postback queue (see below).

## Postback Information
### General

There are two ways of specifying which URL we should use to deliver our postback messages to.
First, in the Signhost Portal you can [register static postback URLs](https://intercom.help/evidos/en/articles/4739431-postback-header-security) which will be automatically used for every transaction.
Secondly, you can dynamicly specify a postback URL for a specific transaction by providing one in the `PostbackUrl` property of the [transaction object](/endpoints/##/definitions/Transaction) during the [initial POST request](/endpoints/##/paths//api/transaction/post).

By default we will send a postback with the most up-to-date data known at the moment when:

*   There is a status change in the transaction (eg the transaction went from waiting for signer to all signed)
*   There is a signer activity (eg an email was sent)
*   There is a receiver activity (eg an email was sent)

If the postback url returns a non `2xx` HTTP status code we will [queue any new postbacks](#what-happens-if-your-postback-url-is-down-or-cant-accept-requests).
In the meantime we will retry to deliver the first failed postback with an increasing interval (the first retry is within a few minutes).
After 5 successive failed attempts we will send you an email.
We will include the attachment with the received response (if any).
When we receive a `2xx` HTTP status code we will mark the postback url as available and start sending the queued postbacks.

To guarantee performance and uptime, and make sure there is no data loss, it can happen that you receive the same postback twice.
Our system consists of multiple instances.
There is no deduplication.
By checking if the postback from instance one is already sent from instance two, we would re-introduce a single point of failure.
Furthermore, it is possible to receive postbacks containing statuses or activities after a signer signed, or after the entire transaction is marked as signed.
Your system will have to handle these scenarios.

### Adding postback urls
To specify the postback URL, you have two options:

* Use the static method by specifying the postback URL(s) in the Portal for your application. This method supports both digest security and security headers.
* Use the variable method by sending us a postback URL for each transaction when creating the transaction in the API with a POST call.

We recommend using the postback management page found here:
https://portal.signhost.com/RegisteredPostbacks

This page allows you to easily manage postbacks, check for any queued requests, and use security features such as the Authorization header and checksum calculation. For more information, see our security section.

When you create a postback URL, we automatically test if your endpoint is available using POST, PUT, DELETE, and GET calls.

#### Multiple postback urls
During the [POST of a transaction](/endpoints/##/paths//api/transaction/post) you have the possibillity to specify a postback URL for that specific transaction.
This functionality is meant for separating the postbacks into different 'buckets' that would make sense for your implementation,
for example different environments (staging, production, etc.) or different departments (sales, HR, etc.).

However, this functionality is *not* meant to separate postbacks per transaction as this circumvents our postback queueing system.
Your business logic should be able to differentiate between postbacks based on the transaction id.
We reserve the right to block postback URLs if this feature is repeatedly abused.

### Activities & Statuses
A transaction has an overarching status.
This status tells more about the entire transaction, and might contain end statuses as well such as signed, rejected.
A full list can be found at the [transaction statuses section](/status-activity#statuses).

Furthermore, per signer, there can be different statuses, such as signer activities.
These detail what an individual person has done in their signing session.
A full list can be found at the [signer activities section](/status-activity#activities).

A postback is sent out when the entire transaction status changes and we send postbacks for activities from specific signers.
The postback contains only one transaction status at a time.
It does however contain the full list of all signer activities which have taken place.
This can help you list all the activities which have taken place for the individual signers.

### Signer activities
Signer activities detail what interactions a specific person had with the transaction and the documents within.
These activities give real-time insight in the full audit trail of what a signer has done to come to a signed document and can be used in your business logic and dashboarding to provide extra information to your uses.
A signer who checked a document five times but still hasn’t signed, might trigger a signal to give them a call…
A full list can be found at the [signer activities section](/status-activity#activities).

A few scenarios around signer activity postbacks:

- In a transaction with two signers, the first signer signed the document.
The second signer still has to sign.
Your system receives a signer activity __203__ for signer 1.
After signing, the first signer goes back to their email, and clicks the invite link again.
You will receive a subsequent status __103__, but that still means signer 1 has signed the document.

- Due to queuing processes on both our end and your end, you might receive the signer activity postback for 'signed' (__203__) and 'document opened' (__105__) at the same time.
That still means that signer 1 has signed the document.

#### Business logic around signer activities
Signer activities can be identified via a combination of Activity ID, Status code and CreatedDateTime.
This might help you identify and list signer activities in your own system.

Please note that your own business logic might use signer activities for subsequent actions.
For example, if you do not use our email logic, and you want to invite signer 2 after signer 1 signed, you will rely on the signer activity __203__ for signer 1 to send this message.
Make sure that subsequent signer activities or duplicate postbacks _after_ the first ‘signed’ (__203__) do not overwrite or retrigger any invitations.

Please note that the signer activity 'signed' (__203__) only indicates that the signer completed the sign flow with the intent of signing the document.
The fully signed document is only available when we complete the processing of the document and the transaction as a whole reaches status 'signed' (__30__).

### Transaction statuses
A transaction has an overarching status.
This status tells more about the entire transaction, and might contain end statuses as well such as signed, rejected.
A full list can be found at the [transaction statuses section](/status-activity#statuses).

A few scenarios around transaction status postbacks:

- A transaction is created, and two documents are attached.
The transaction still shows ‘waiting for document’ (__5__).
You need to start the transaction so we know you’ve finished uploading files.

- A transaction with two signers is signed by the first signer.
The status is still ‘waiting for signer’ (__10__).
Signer 2 still needs to sign!
After end statuses such as __30__, __40__, __50__, __60__, __70__ you can still receive postbacks with signer activities.
People might click the invite link again or download signed documents.

#### Business logic around transaction statuses
Transaction status postbacks can be identified via a combination of the Transaction ID, Status code and Checksum.
Please note that multiple postbacks with the same combination of these factors might arrive because of the at-least-once principle but also because you receive multiple signer activities falling under the same transaction status.

Please note that your own business logic can handle this, so that subsequent status __30__ postbacks because of at-least-once or new signer activities do not overwrite or retrigger any actions on your end.

### Security
We offer two methods to secure postbacks:

**Postback authorization header:**

This can be any string that you enter while registering the postback URL.
Postbacks sent from us will include this string in the Authorization header of the HTTP POST message,
so you can verify that the message comes from us.

**Checksum calculation:**

This involves calculating a checksum from the information in a received message and a shared secret.
This ensures that the contents of the message have not been altered. Since we use HTTPS connections,
this may be unnecessary.
You will receive the shared secret only once when registering your postback URL.

Please note that IP whitelisting and certificate pinning should not be used as security measures because they are not always reliable.
All security measures can be found and configured on the postback management page in the portal.

The checksum is generated using the following formula:

    Checksum = SHA1(transaction id + || + status  + | + sharedsecret)

> There is a double “pipe” sign between the transaction id and the status.
> If you are still using our legacy API - you are seeing a File object in your postback and get responses - you'll have to include the file id at this location.
> eg ```Checksum = SHA1(transaction id + | + file id + | + status  + | + sharedsecret)```

As you may have noticed the “pipe” sign ( &#124; ) is used as the delimiter between values. You may need to put the delimiters between single quotes (‘) or double quotes (“) depending on the programming language that you will be using. The value returned by the SHA1 function is a string of 40 characters representing a hexadecimal value. How to use the SHA1 algorithm depends on your development platform. Most languages and frameworks (such as PHP and ASP.NET) have built-in implementations of the SHA1 algorithm. For other languages, such as classic ASP, implementations of the SHA1 algorithm are available online.

We strongly urge you to protect security information by only returning a HTTP 2xx response code, even if an expected security header or checksum does not match.
Failing to do so could potentially allow attackers to probe your security measures or cause the formation of queues that could impact the performance of your system.

### What happens if your postback URL is down or can't accept requests?

If the webhook URL doesn't return a `2xx` HTTP response code, that POST request will be re-attempted with a random increasing interval.
All following postbacks will be put in a postback queue, and will wait there untill the first postback in the queue gets a `2xx` HTTP response code.

If a particular POST request is unsuccessful and is being retried, no other POSTs will be attempted until the first one succeeds or is marked as failed.
Requests are marked failed after about 1 week since the request was created.
Subsequent postbacks are deferred until the first completes.
Once the first postback request completes the deferred requests will be processed sequentially.

Since postback requests can ultimately fail, it's best to accept and store data on your end (with an HTTP `200` response to Signhost) for later processing to avoid data loss.

### Request body formats

```
{
  "Id": "b10ae331-af78-4e79-a39e-5b64693b6b68",
  "Status": 20,
  "Seal": true,
  "Signers": [
    {
      "Id": "fa95495d-6c59-48e0-962a-a4552f8d6b85",
      "Email": "user@example.com",
      "Mobile": "+31612345678",
      "RequireScribbleName": false,
      "RequireScribble": true,
      "RequireEmailVerification": true,
      "RequireSmsVerification": true,
      "RequireIdealVerification": false,
      "RequireDigidVerification": false,
      "RequireSurfnetVerification": false,
      "SendSignRequest": true,
      "SendSignConfirmation": true,
      "SignRequestMessage": "Hello, could you please sign this document? Best regards, John Doe",
      "DaysToRemind": 15,
      "Language": "en-US",
      "ScribbleName": "John Doe",
      "ScribbleNameFixed": false,
      "Reference": "Client #123",
      "ReturnUrl": "https://signhost.com",
      "Activities": [
        {
          "Id": "bcba44a9-c201-4494-9920-2c1f7baebcf0",
          "Code": 103,
          "Activity": "Opened",
          "CreatedDateTime": "2016-06-15T23:33:04.1965465+02:00"
        },
        {
          "Id": "de94cf6e-e1a3-4c33-93bf-2013b036daaf",
          "Code": 203,
          "Activity": "Signed",
          "CreatedDateTime": "2016-06-15T23:38:04.1965465+02:00"
        }
      ],
      "SignUrl": "https://view.signhost.com/sign/d3c93bd6-f1ce-48e7-8c9c-c2babfdd4034",
      "CreatedDateTime": "2016-06-15T23:33:04.1965465+02:00",
      "ModifiedDateTime": "2016-06-15T23:33:04.1965465+02:00"
    }
  ],
  "Receivers": [
    {
      "Id": "97ed6b54-b6d1-46ed-88c1-79779c3b47b1",
      "Name": "John Doe",
      "Email": "user@example.com",
      "Language": "en-US",
      "Message": "Hello, please find enclosed the digital signed document. Best regards, John Doe",
      "CreatedDateTime": "2016-06-15T23:33:04.1965465+02:00",
      "ModifiedDateTime": "2016-06-15T23:33:04.1965465+02:00",
      "Activities": []
    }
  ],
  "Reference": "Contract #123",
  "PostbackUrl": "https://example.com/postback.php",
  "SignRequestMode": 2,
  "DaysToExpire": 30,
  "SendEmailNotifications": true,
  "CreatedDateTime": "2016-08-31T21:22:56.2467731+02:00",
  "ModifiedDateTime": "2016-08-31T21:22:56.2467731+02:00",
  "Checksum": "b5a99e1de5b9e0e9915df09d3b819be188dae900"
}
```
