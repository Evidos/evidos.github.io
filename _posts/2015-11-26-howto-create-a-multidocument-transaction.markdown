---
layout: post
title:  "How to create a multi document transaction"
date:   2015-11-26 00:00:00 +0000
categories: api howto
tags:
- multidoc
---

## How-to start a multi document transaction

First you will have to create a transaction.
A transactionId will be returned which you can use to add documents to the transaction.
When all documents are uploaded you'll need to start the transaction.


### Create a transaction

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

Success 200
Success 201

The id `b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57` is the transactionId and you will need this in your followup requests.

Please note, previously you would also receive a "File": { "id":  "someid" }, this is no longer the case. 


### Add file to transaction

**PUT /api/transaction/:transactionId/file/:fileId**

Parameter     | Description
--------------|-------------
transactionId | id from the transaction as returned by Create a transaction
filedId       | A unique id to be created at your side to identity the document. Could be your document filename.


HTTP headers

 Header        | Description
---------------|------------
SH-DisplayName | The name of the document we will display on the screen

Example

    curl \
        -H "Authorization: APIKey {usertoken here}" \
        -H "Application: APPKey {appkey here}" \
        -H "SH-DisplayName: Your personal contract" \
        -H "Content-Type: application/pdf" \
        -XPUT \
        -T Contract.pdf \
        https://api.signhost.com/api/transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57/file/Contract.pdf


Success 201
Success 204

You can add another file by using a different fileId like this:

    curl \
        -H "Authorization: APIKey {usertoken here}" \
        -H "Application: APPKey {appkey here}" \
        -H "SH-DisplayName: Extra document to read and sign" \
        -H "Content-Type: application/pdf" \
        -XPUT \
        -T Document.pdf \
        https://api.signhost.com/api/transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57/file/AnotherFile.pdf

### Start the transaction

**PUT /api/transaction/:transactionId/start**

Example

    curl \
        -H "Authorization: APIKey {usertoken here}" \
        -H "Application: APPKey {appkey here}" \
        https://api.signhost.com/api.transaction/b2a9aca4-cd5e-4a21-b7f7-c08a9f2b2d57/start

Success 200

When all files are uploaded you can tell Signhost to start the transaction. Once the transaction is started signers can start viewing and signing the documents.
