---
layout: frontpage
---

The Signhost API is RESTful and HTTP-based. Basically, this means that the communication is made through normal HTTP requests.

Required steps to create a transaction:

1.  Create a new transaction with [POST api/transaction](/endpoints#%23/paths//api/transaction/post).
2.  Optionally you can add metadata to generate fields with [PUT api/transaction/{transactionId}/file/{fileId}](/endpoints#%23/paths//api/transaction/%7BtransactionId%7D/file/%7BfileId%7D/put).
You have to submit the metadata first before you upload the file.
Make sure you use the same fileId for both the metadata and the file.
3.  Upload the documents you want to be signed by performing a [PUT api/transaction/{transactionId}/file/{fileId}](/endpoints#%23/paths//api/transaction/%7BtransactionId%7D/file/%7BfileId%7D/put).
Repeat for each file.
4.  Finally start the transaction with [PUT api/transaction/{transactionId}/start](/endpoints#%23/paths//api/transaction/%7BtransactionId%7D/start/put).

### Server Address

The REST gateway BaseURL is: https://api.signhost.com/api/

### Security

We require that all requests are done over SSL.

## Authentication

To authenticate you have to add two HTTP headers to every request you make.
The first header includes the name "Application" with the value "APPKey {appkey here}".
This application key will be provided to you by email.
The second header includes the name "Authorization" with the value "APIKey {your usertoken}".
The Usertoken can be generated via Settings > Usertokens at the [SignHost Portal](https://portal.signhost.com/).
A name for the usertoken has to be submitted, after which the value for this usertoken will be displayed once only.
The amount of usertokens that can be generated for an account is limited to 64.
If more usertokens are needed, this needs to be requested at support@signhost.com.

Below you find a HTTP request header example:

    Content-Type: application/json
    Authorization: APIKey {usertoken here}
    Application: APPKey {appkey here}
    Accept: */*
    Connection: keep-alive

## Get signed document and receipt

With the Signhost API it is possible to facilitate two different signing flows to the signer.

**Invite flow;** Signhost API will send a SignRequest by email to the signer and will facilitate the workflow process for sending reminder emails and the signed result.

**The direct flow;** The Signhost API returns a URL you will be able to directly redirect the signer on your portal or send the signer a message with the signing link yourself.

By default the direct flow will be used when you create a transaction.
If you would like to make use of the Invite flow, you can do so by setting the SendSignRequest parameter to TRUE during the POST api/transaction.

If you choose to make use of the Invite flow we will send a reminder after 7 days, you can adjust the amount of days by supplying a DaysToRemind parameter during the POST api/transaction (a value of -1 disables reminders).

When the transaction is successfully signed (Status=30) you will be able to GET the signed document and receipt with a HTTP GET request to [api/transaction/{transactionId}/file/{fileId}](/endpoints#%23/paths//api/transaction/%7BtransactionId%7D/file/%7BfileId%7D//get) or [api/file/receipt/{transactionId}](/endpoints#%23/paths//api/file/receipt/%7BtransactionId%7D/get).
Do not forget to add the authorization headers as well.

For legal proof it is important to store both the signed document and the receipt.

*   The Sender will receive the signed documents and receipt per mail when the **SendEmailNotification** is set to true.
*   The Signers will receive the signed documents and receipt per mail when the **SendSignConfirmation** is set to true.
*   The Receivers will always receive the signed documents per mail.

## Specify signature location

We provide three ways to specify the location for the signatures.

### Signer tag

In our API it is possible to specify the signature location in the PDF document. When you create the PDF that needs to be signed you can include the tag {% raw %}{{Signer1}}, {{Signer2}}{% endraw %}, etc.. at the location you want the signature displayed.

If you do not want to show a {% raw %}{{Signer}}{% endraw %} tag in your document you can give the tag the background colour of your document, in general this is the colour white.

Although PDF is a document standard we strongly recommend to test the signer location and {% raw %}{{Signer}}{% endraw %} tag to see if the location is correct.

Please be aware that including a lot of {% raw %}{{Signer}}{% endraw %} tags will have an impact on the performance and signature validation process. For a digital signature we do not recommend to include a signature on every page. If you do not include the {% raw %}{{Signer}}{% endraw %} tag, or you do not use another way to specify the location, we will use the default signing location; top right on the first page.

### Create fields through API calls

A second method of specifying the signature location is via the api.

For this method you do not need to prepare the PDF file in any way.
The flow of making a transaction is basically the same as before, although this time you need to add file metadata to the transaction before uploading the file(s).
For more information about this method please take a further look at the following post: [How to create a transaction with api generated fields]({% post_url 2016-10-06-api-generated-fields %}).

### Signature fields

Besides specifying the signature location via the signer tag or via the API you also make use of pdf signature fields.
This method is not recommended as it requires external PDF tools.
To make sure that the signature fields are recognized they have to be named a specific pattern: Signature-x_y. Where the x stands for the signer and the y for the signature number.

For example: Signature-1_2 will specify the place for the second signature of the first signer.

## Webhook / Postback URL

In your request you can specify a PostbackUrl.
On this URL on your own server Signhost will do a POST with the status of the request.
We only support a postback on the default https:// port 443.
Port 80 / http:// is *not* supported.
We will only issue 1 postback per PostbackURL at a time, one-by-one.

When a postback fails we will queue all new postbacks and retry these again at a later time.
If the postback succeeds again we will continue issuing the remaining queued postbacks.

For more information about postbacks and calculating the checksum and the body of the request view the [webhook postback sample](/postback) help page.

## Return URL Parameters

When the user signs or rejects the transaction we will redirect the browser to the return URL.
The return URL will have one of the following parameters, determined by the user action:

*   **User signs :**
    https://www.example.org/[yourReturnUrl]?sh_signerstatus=signed
*   **User rejects :**
    https://www.example.org/[yourReturnUrl]?sh_signerstatus=rejected
*   **Other :**
    https://www.example.org/[yourReturnUrl] or https://www.example.org/[yourReturnUrl]?sh_signerstatus=

The user actions provide an indication on what the user chose to do.
However, you must validate the actual status using the API, and you should not trust the sh_signerstatus for any important processing.
Depending on the communicated sh_signerstatus, you might want to show a different page.
Once the user signed or rejected the transaction, the server will process the input.
Therefore, the return URL will always be available before the transaction status has been updated.
Once the server has completed processing, a new postback will be send with the new transaction status.

## Return codes

Our REST API uses the standard [HTTP/1.1 status codes](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) to return the status of your request.
In short this means that any status code in the range of:

*   **2xx** (eg 200) your request was successful;
*   **4xx** (eg 400 bad request, invalid email address) there is an error in your request.
You must not retry this request unless you have corrected the error;
*   **5xx** (eg 500) there was an error on our side. You may retry this request at a later time.
If you implement a retry policy you should use a backoff policy.

## Formats

JSON results which contain a date, time or datetime property are formatted according to [ISO8601](https://www.iso.org/iso/iso8601). A short explanation of the format is available at [w3.org - Date and Time Formats](https://www.w3.org/TR/NOTE-datetime).

## Libraries & demos

There are a few libraries and demos available to make connecting to our API easier.

*   [.Net Client Library](https://github.com/Evidos/SignhostClientLibrary)
*   [PHP Demo Client](https://github.com/Evidos/signhost-phpdemoclient)
*   [Java Client Library](https://github.com/Evidos/OndertekenenDemo-Java)
*   [SignHost Ruby Gem](https://rubygems.org/gems/sign_host)

## Handy tools

*   [Webhook Tester](https://webhook.site) / [Webhook Inbox*](http://webhookinbox.com/) for testing the postback.
*   [JSONLint](https://jsonlint.com/) for formatting and checking json messages.

\* Webhook Inbox only supports HTTP.

## Posts
<ul class="post-list">
  {% for post in site.posts reversed %}
    <li>
      <span class="post-meta">{{ post.date | date: "%b %-d, %Y" }}</span>

      <h2>
        <a class="post-link" href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
      </h2>
    </li>
  {% endfor %}
</ul>
