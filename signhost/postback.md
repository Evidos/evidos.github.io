---
layout: page
title: Postback
permalink: signhost/postback/
product: Signhost

redirect_from:
  - /postback
  - /postback/
---

The Signhost postback service is meant to provide realtime updates on your transactions.
Please refrain from active polling with GET requests to stay up-to-date.
If you cannot implement the postback service, or you have any questions regarding the service, please contact [support](mailto:support@evidos.nl).

### Advised postback implementation flow

To avoid postback queues for your application, we advise the following flow once a postback arrives at your server:
  1. Perform checksum validation
      * Validate the body is valid JSON, if not move to step 2;
      * Validate the JSON has a Checksum property, if not move to step 2;
      * Validate the Checksum value, if there is a mismatch move to step 2.
  2. Always return a 200 OK response*
	    * Skip rest of the steps if the checksum validation failed.
  3. Save verified postback to storage
  4. Continue business logic

\* This is a security precaution which prevents information on your validation process to return to the - potentially malicious - sender of the postback.
Any other response than 2xx will lead to the formation of a postback queue (see below).

## Request Information

### Parameters

None.

### Description

By default we will send a postback when:

*   There is a status change in the transaction (eg the transaction went from waiting for signer to all signed)
*   There is a signer activity (eg an email was sent)
*   There is a receiver activity (eg an email was sent)

A postback is sent at-least-once.
There is no deduplication.
If the postback url returns a non 2xx http status code we will queue any new postbacks.
In the meantime we will retry to deliver the first failed postback with an increasing interval (the first retry is within a few minutes).
After 5 successive failed attempts we will send you an email.
We will include the attachment with the received response (if any).
When we receive a 2xx http status code we will mark the postback url as available and start sending the queued postbacks.

### Checksum

To verify that the postback responses are from SignHost you MUST verify our digital signature checksum. This signature is a hash of some parameters from the response and the sharedsecret. In order the generate the Checksum you will need a sharedsecret.

The checksum is generated using the following formula:

    Checksum = SHA1(transaction id + || + status  + | + sharedsecret)

> There is a double “pipe” sign between the transaction id and the status.
> If you are still using our legacy API - you are seeing a File object in your postback and get responses - you'll have to include the file id at this location.
> eg ```Checksum = SHA1(transaction id + | + file id + | + status  + | + sharedsecret)```

As you may have noticed the “pipe” sign ( &#124; ) is used as the delimiter between values. You may need to put the delimiters between single quotes (‘) or double quotes (“) depending on the programming language that you will be using. The value returned by the SHA1 function is a string of 40 characters representing a hexadecimal value. How to use the SHA1 algorithm depends on your development platform. Most languages and frameworks (such as PHP and ASP.NET) have built-in implementations of the SHA1 algorithm. For other languages, such as classic ASP, implementations of the SHA1 algorithm are available online.

### Request body formats

```
{
  "Id": "b10ae331-af78-4e79-a39e-5b64693b6b68",
  "Status": 20,
  "Seal": true,
  "Signers": [
    {
      "Id": "fa95495d-6c59-48e0-962a-a4552f8d6b85",
      "Expires": null,
      "Email": "user@example.com",
      "Mobile": "+31612345678",
      "Iban": null,
      "BSN": null,
      "RequireScribbleName": false,
      "RequireScribble": true,
      "RequireEmailVerification": true,
      "RequireSmsVerification": true,
      "RequireIdealVerification": false,
      "RequireDigidVerification": false,
      "RequireKennisnetVerification": false,
      "RequireSurfnetVerification": false,
      "SendSignRequest": true,
      "SendSignConfirmation": null,
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
      "RejectReason": null,
      "SignUrl": "https://view.signhost.com/sign/d3c93bd6-f1ce-48e7-8c9c-c2babfdd4034",
      "SignedDateTime": null,
      "RejectDateTime": null,
      "CreatedDateTime": "2016-06-15T23:33:04.1965465+02:00",
      "ModifiedDateTime": "2016-06-15T23:33:04.1965465+02:00",
      "Context": null
    }
  ],
  "Receivers": [
    {
      "Id": "97ed6b54-b6d1-46ed-88c1-79779c3b47b1",
      "Name": "John Doe",
      "Email": "user@example.com",
      "Language": "en-US",
      "Message": "Hello, please find enclosed the digital signed document. Best regards, John Doe",
      "Reference": null,
      "Activities": null,
      "CreatedDateTime": "2016-06-15T23:33:04.1965465+02:00",
      "ModifiedDateTime": "2016-06-15T23:33:04.1965465+02:00",
      "Context": null
    }
  ],
  "Reference": "Contract #123",
  "PostbackUrl": "https://example.com/postback.php",
  "SignRequestMode": 2,
  "DaysToExpire": 30,
  "SendEmailNotifications": true,
  "CreatedDateTime": "2016-08-31T21:22:56.2467731+02:00",
  "ModifiedDateTime": "2016-08-31T21:22:56.2467731+02:00",
  "CanceledDateTime": null,
  "Context": null,
  "Checksum": "b5a99e1de5b9e0e9915df09d3b819be188dae900"
}
```

### What happens if your postback URL is down or can't accept requests?

If the webhook URL doesn't return a 2xx HTTP response code, that POST request will be re-attempted with a random increasing interval.
All following postbacks will be put in a postback queue, and will wait there untill the first postback in the queue gets a 2xx HTTP response code.

If a particular POST request is unsuccessful and is being retried, no other POSTs will be attempted until the first one succeeds or is marked as failed.
Requests are marked failed after about 1 week since the request was created.
Subsequent postbacks are deferred until the first completes.
Once the first postback request completes the deferred requests will be processed sequentially.

Since postback requests can ultimately fail, it's best to accept and store data on your end (with an HTTP 200 response to Signhost) for later processing to avoid data loss.
