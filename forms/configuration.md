---
layout: page
title: Configuration of the form to Evidos Signhost
permalink: forms/configuration/
product: Forms
---

Evidos forms has a native integration with [Evidos Signhost](/signhost) the signing API of Evidos.
After the user filled all the information the signing transaction including the PDF(s) to be signed are created.

## Mapping formfields to sign API

The creation of the PDF is based on a template.
Within the project, the PDF template is mapped to the formfields.

The formfield are included in the postback/GET using the Context property, a valid json object containing the name and input of the formfield.
This also includes hidden fields for additional background validations.

See Evidos Signhost get for an example of the result. In the json the Context property could look like:
```json
"Context": {
	"Name": {
		"Firstname": "John",
		"Lastname": "Doe",
	}
```

## Defining the signing flow – Number of Signers
At the end of the form it is possible to let the user define if he will be the authoritative signer and directly view and sign the document(s), or define the authoritative signer(s) by typing the name/ email.
The customer needs to know or decide if the end user is allowed to sign directly and/or delegate to other signers.
If other signers are defined the signing URL will be sent by email to the other signers or the enduser is able to distribute the signing link himself.

## Sign Parameters
It is also required to define the additional parameters for Evidos Signhost.
During the project, these parameters will be defined with the customer.
A detailed overview of the parameters can be viewed in the Evidos Signhost API: [https://evidos.github.io/signhost/endpoints/##/definitions/Transaction](/signhost/endpoints/##/definitions/Transaction)

## Verificationmethods
It is important to decide on what level the enduser will identify during the signing process, for example SMS, Scribble, eID. Multiple verification methods are supported.
Methods are described here: [https://evidos.github.io/signhost/endpoints/##/definitions/Verification](/signhost/endpoints/##/definitions/Verification)

## Postback URL
When the customer system will use the Signhost API to retrieve the document(s) and receipt a postback must be configured.
For details on the postback mechanism see: [https://evidos.github.io/signhost/postback/](/signhost/postback)

## Return URL
At the end of the signing, the signers are sent to a return URL.
This can be a result page of the customer or a result page on Evidos forms.
Within the Evidos forms, it is possible to additionally start a payment process or any other trigger.

## Retrieving the result Postback/ Get
For the webform a specific postback URL is configured.
This postback URL can be an endpoint at the customer system.
The customer system is able to retrieve the filled form data from the postback.
The formfield are included in the postback using the Context property, a valid json object containing the name and input of the formfield.
This also includes hidden fields for additional background validations.

Based on the postback the customer system is also informed on the transaction and signer activities like; how many signers signed, clicked or looked at the transaction.
See status in our signing api: [https://evidos.github.io/signhost/status-activity/](/signhost/status-activity)

Based on the postback the customer system can do a GET to retrieve the signed documents and transaction receipt.

Signed document(s):
[https://evidos.github.io/signhost/endpoints/##/paths//api/transaction/{transactionId}/file/{fileId}//get](/signhost/endpoints/##/paths//api/transaction/{transactionId}/file/{fileId}//get)

Transaction Receipt:
[https://evidos.github.io/signhost/endpoints/##/paths//api/file/receipt/{transactionId}/get](/signhost/endpoints/##/paths//api/file/receipt/{transactionId}/get)

**Note:** If no postback can be implemented it is possible to configure Evidos Forms to send the result by email or other secure distribution mechanisms.

## Delete a transaction
Within Evidos Signhost a time is defined for the sign URL’s to be available.
Optionally the customer system can send a delete after successfully retrieving the signed documents and transaction receipt.
This delete will directly remove the customer data from the Evidos Signhost system.

## Transaction dashboard
Based on the postback integration the customer system is able to integrate a status dashboard of the signing transactions linked with the form webanalytics.
If this is not available or implemented the Evidos Portal can be used to view the signing transaction dashboard. ([https://portal.signhost.com](https://portal.signhost.com))