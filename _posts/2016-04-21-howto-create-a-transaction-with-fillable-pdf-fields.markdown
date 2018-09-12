---
layout: post
title: "How to create a transaction with fillable form fields"
date: 2016-04-21 00:00:00 +0000
categories: api howto
tags:
- formfields
---

## How-to create a transaction with fillable form fields

During the signing flow we display the PDF document to the end user so the user can read and approve (or disapprove) the document.
We didn't provide the option for the user to fill in specific parts in the displayed document.

For example, maybe you don't have all the information available of the end user during your PDF creation process.
Yet, you want the end user to sign the document, but fill in the missing pieces at the same time as well, e.g. their address details.


**Let's start & prerequisites**

*The form fields API is not yet stable and subject to change*

You will need a PDF which has fillable form fields. At the moment we only support textboxes and checkboxes.
Contact [us](mailto:support@signhost.com?subject=PDF and formfields) if you need help to create such a PDF document. We might be able to create one for you.

**TL;DR**

1. Create a transaction
2. Add document metadata
3. Add document
4. Start the transaction



### Create a transaction

First you will have to create a transaction. We'll use the same flow as in
[How-to start a multi document transaction]({% post_url 2015-11-26-howto-create-a-multidocument-transaction %}).

**POST /api/transaction/**

Example

    curl \
        -H "Authorization: APIKey {usertoken here}" \
        -H "Application: APPKey {appkey here}" \
        -H "Content-Type: application/json" \
        -d '{
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
        ],
          "SendEmailNotifications": true
        }'
        https://api.signhost.com/api/transaction/


And you should receive a reply with at least the following content:

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

- Success 200
- Success 201

The id `b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57` is the transactionId and you will need this in your followup requests.

### Add file meta data to transaction

**PUT /api/transaction/:transactionId/file/:fileId**

Parameter     | Description
--------------|-------------
Content-Type  | application/json
transactionId | id from the transaction as returned by Create a transaction
fileId        | A unique id to be created at your side to identity the document. Could be your document filename.


```json
{
	"DisplayName": "Your personal contract",
	"Signers": {
		"Signer1": {
			"FormSets": [ fileId ]
		}
	}
}
```

The FormSets key should contain an array with only the fileId.

Example

    curl \
        -H "Authorization: APIKey {usertoken here}" \
        -H "Application: APPKey {appkey here}" \
        -H "Content-Type: application/json" \
        -XPUT \
        -d '{
            "DisplayName": "Your personal contract",
            "Signers": {
                "Signer1": {
                    "FormSets": [ "Contract.pdf" ]
                }
            }
        }' \
        https://api.signhost.com/api/transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57/file/Contract.pdf

The response will tell you that it is awaiting the actual document.

### Add the actual file to transaction

**PUT /api/transaction/:transactionId/file/:fileId**

Parameter     | Description
--------------|-------------
Content-Type  | application/pdf
transactionId | id from the transaction as returned by Create a transaction
fileId        | A unique id to be created at your side to identity the document. Should be the same id as the one you provided for the file metadata.


Example

    curl \
        -H "Authorization: APIKey {usertoken here}" \
        -H "Application: APPKey {appkey here}" \
        -H "Content-Type: application/pdf" \
        -XPUT \
        -T Contract.pdf \
        https://api.signhost.com/api/transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57/file/Contract.pdf


- Success 201
- Success 204

*We are looking into combining the metadata and the file contents into one API call*

### Start the transaction

**PUT /api/transaction/:transactionId/start**

Example

    curl \
        -H "Authorization: APIKey {usertoken here}" \
        -H "Application: APPKey {appkey here}" \
        https://api.signhost.com/api.transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57/start

Success 200

When all files are uploaded you can tell signhost to start the transaction.

### Postbacks

When a signer has filled in the form fields and accepts a document you will receive a postback as you normally would.
However we have filled the Context property on the Signer dictionary to contain the user filled-in values of the document.
Our postback data will look something like this:

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
     "ScribbleNameFixed": false,
     "Context": {
       "Contract.pdf": {
           "addressline1": "My adress",
           "addressline2": "anywhere",
           "city": "Haarlem"
       }
     }
   }
  ]
}
```
