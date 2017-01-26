---
layout: frontpage
---

The Signhost API is RESTful and HTTP-based. Basically, this means that the communication is made through normal HTTP requests.

Required steps to create a transaction:

1.  Create a new transaction with [POST api/transaction](/endpoints#%23/paths//api/transaction/post)
2.  Upload the documents you want to be signed by performing a [PUT api/transaction/{transactionId}/file/{fileId}](/endpoints#%23/paths//api/transaction/%7BtransactionId%7D/file/%7BfileId%7D/put). Repeat for each file.
3.  Finally start the transaction with [PUT api/transaction/{transactionId}/start](/endpoints#%23/paths//api/transaction/%7BtransactionId%7D/start/put)

## Server Address

The REST gateway BaseURL is: https://api.signhost.com/api/

## Security

We require that all requests are done over SSL.

### Authorization

To authenticate you have to add two HTTP headers to every request you make. The first header includes the name "Application" with the value "APPKey [the app key]". The second header includes the name "Authorization" with the value "APIKey [your api key]". Below you find a HTTP request header example:

    Content-Type: application/json
    Application: APPKey ApplicationName 6kDtzzEoHKmmc2dqnkIqfIQaoKQTdFj1Wl7ZQNsDHR8=
    Authorization: APIKey 426b4a90907f0fecc69334686a2576668d00a6d6b8c897b949f2faaca0965d66
    Accept: */*
    Connection: keep-alive

## Webhook / Postback URL

In your request you can specify a PostbackUrl. On this URL on your own server Signhost will do a POST with the status of the request. We only support a postback on the default http:// port 80 and https:// port 443. We strongly recommend to use a https:// protected URL. We will only issue 1 postback per PostbackURL at a time, one-by-one.

When a postback fails we will queue all new postbacks and retry these again at a later time.
If the postback succeeds again we will continue issuing the remaining queued postbacks.

For more information about postbacks and calculating the checksum and the body of the request view the [webhook postback sample](/postback) help page.


## Direct or invite SignRequest

With the Signhost API it is possible to facilitate two different signing flows to the signer.

**Invite flow;** Signhost API will send a SignRequest by email to the signer and will facilitate the workflow process for sending reminder emails and the signed result.

**The direct flow;** The Signhost API returns a URL you will be able to directly redirect the signer on your portal or send the signer a message with the signing link yourself.

When you create a transaction the Inviteflow is initiated setting the SendSignRequest parameter TRUE during the POST api/transaction.

## Specify signature location

We provide two ways to specify the location for the signatures.

### Signer tag

In our API it is possible to specify the signature location in the PDF document. When you create the PDF that needs to be signed you can include the tag {% raw %}{{Signer1}}, {{Signer2}}{% endraw %}, etc.. at the location you want the signature displayed.

If you do not want to show a {% raw %}{{Signer}}{% endraw %} tag in your document you can give the tag the background colour of your document, in general this is the colour white.

Although PDF is a document standard we strongly recommend to test the signer location and {% raw %}{{Signer}}{% endraw %} tag to see if the location is correct.

Please be aware that including a lot of {% raw %}{{Signer}}{% endraw %} tags will have an impact on the performance and signature validation process. For a digital signature we do not recommend to include a signature on every page. If you do not include the {% raw %}{{Signer}}{% endraw %} tag we will use the default signing location; top right on the first page.

### Signature fields

A second method of specifying the signature location is with the use of pdf signature fields. To make sure that the signature fields are recognized they have to be named a specific pattern: Signature-x_y. Where the x stands for the signer and the y for the signature number.

For example: Signature-1_2 will specify the place for the second signature of the first signer.

## Formats

JSON results which contain a date, time or datetime property are formatted according to [ISO8601](http://www.iso.org/iso/iso8601). A short explanation of the format is available at [w3.org - Date and Time Formts](http://www.w3.org/TR/NOTE-datetime).

## Return codes

Our REST API uses the standard [HTTP/1.1 status codes](http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) to return the status of your request. In short this means that any status code in the range of:

*   **2xx** (eg 200) your request was successful;
*   **4xx** (eg 400 bad request, invalid email address) there is an error in your request. You must not retry this request unless you have corrected the error;
*   **5xx** (eg 500) there was an error on our side. You may retry this request at a later time. If you implement a retry policy you should use a backoff policy.

## Return URL Parameters

When the user signs or rejects the transaction we will redirect the browser to the return URL. The returnURL will contain the following parameters:  
?sh_id=transactionid&status=status_of_transaction&reference=your_reference

## Get signed document and receipt

When the transaction is successfully signed (Status=30) you will be able to GET the signed document and receipt with a HTTP GET request to [api/file/document/{fileId}](/endpoints#get/api/transaction/{transactionId}/file/{fileId}/) or [api/file/receipt/{transactionId}](/endpoints#get/api/file/receipt/{transactionId}). Do not forget to add the authorization headers as well.

For legal proof it is important to store both the signed document and the receipt.

*   The Sender will receive the signed documents and receipt per mail when the **SendEmailNotification** is set to true.
*   The Signers will receive the signed documents and receipt per mail when the **SendSignConfirmation** is set to true.
*   The Receivers will always receive the signed documents and receipts per mail.

## Libraries & demos

There are a few libraries and demos available to make connecting to our API easier.

*   [.Net Client Library](https://github.com/Evidos/SignhostClientLibrary)
*   [PHP Demo Client](https://github.com/Evidos/signhost-phpdemoclient)
*   [Java Client Library](https://github.com/Evidos/OndertekenenDemo-Java)
*   [SignHost Ruby Gem](https://rubygems.org/gems/sign_host)

## Handy tools

*   [RequestBin](http://requestb.in/) for testing the postback.
*   [JSONLint](http://jsonlint.com/) for formatting and checking json messages.
