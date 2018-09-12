---
layout: post
title:  "How to create a transaction with api generated fields"
date:   2016-10-06 00:00:00 +0000
categories: api howto
tags:
- formfields
---

## How-to create a transaction with api generated fields

In this how-to we describe how you can create a transaction with fillable
form fields on a PDF that isn't prepared in any way.
This is different compared to [How-to create a transaction with fillable form fields]({% post_url 2016-04-21-howto-create-a-transaction-with-fillable-pdf-fields %}) where you were required to use a PDF which already has all the form fields embedded in the PDF.

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
	"Id": "SomeTransactionId",
	"Status": 5,
	"Signers": [
		{
		   "Id": "SomeSignerId",
		   "Email": "user@example.com",
		   "RequireScribble": true,
		   "SendSignRequest": true,
		   "SignRequestMessage": "Hello, could you please sign this document? Best regards, John Doe",
		   "DaysToRemind": 15,
		   "ScribbleName": "John Doe",
		   "ScribbleNameFixed": false
		}
	]
}
```

- Success 200
- Success 201

The id `SomeTransactionId` is the transactionId and you will need this in your followup requests.

### Add file meta data to transaction

**PUT /api/transaction/:transactionId/file/:fileId**

Parameter     | Description
--------------|-------------
Content-Type  | application/json
transactionId | id from the transaction as returned by Create a transaction
filedId       | A unique id to be created at your side to identity the document. Could be your document filename.

The following example creates two formset definitions.
The first is named `SampleFormset` and contains 2 single line text fields and 1 signature field.
The second `SecondSigner` only contains a signature field but is not used.
We do recommend to use a width of 140 and a height of 70 for signature fields.

```json
{
	"DisplayName": "Your personal contract",
	"Signers": {
		"SomeSignerId": {
			"FormSets": [ "SampleFormset" ]
		}
	},
	"FormSets": {
		"SampleFormset": {
			"AddressLine1": {
				"Type": "SingleLine",
				"Location": {
					"Search": "Address line 1",
					"Left": 100
				}
			},
			"AddressLine2": {
				"Type": "SingleLine",
				"Location": {
					"Search": "Address line 2",
					"Left": 100
				}
			},
			"SignatureOne": {
				"Type": "Signature",
				"Location": {
					"Right": 10,
					"Top": 10,
					"PageNumber": 1,
					"Width": 140,
					"Height": 70
				}
			}
		},
		"SecondSigner": {
			"Signature-2": {
				"Type": "Signature",
				"Location": {
					"PageNumber": 2,
					"Width": 140,
					"Height": 70
				}

			}
		}
	}
}
```

The FormSets array in the Signers/SomeSignerId should reference one or more keys
in the `FormSets` dictionary.
A FormSet should be *unique* within a transaction.
If you provide a duplicate formset key we will overwrite the old one with the new one. 

#### Field types
You can create various field types.
We have the following field types available at the moment:

Type       | Description
-----------|-------------
Seal       | Create a seal signature. *Not yet implemented*
Signature  | Create a signature for a signer.
Check      | Create a checkbox. Has an additional property `value`.
SingleLine | Create a single line textbox.

##### Check

When you specify the field type `Check` there is an additional `value` property you can set.
The `value` property specifies the checked value of a checkbox. 
This does __not__ specify the label of the checkbox.

For example:

```json
{
	"UserAgrees": {
		"Type": "Check",
		"Value": "I agree",
		"Location": { "Search": "user_agree" }
	}
}
```

#### Field Location
The Location object determines where the field should be placed.
You have the following options:

Property   | Description
-----------|-------------
Search     | The text to search in the pdf document to use as the position for the field. For example `{% raw %}{{Signer1}} {% endraw %}`.
Occurence  | When using text search, only match this matched occurence.
Top        | Offset from the top of the search text or the page
Right      | Offset from the right of the search or the page
Bottom     | Offset from the bottom of the search or the page
Left       | Offset from the left of the search or the page
Width      | The width of the field, can't be used when both Left and Right are specified.
Height     | The height of the field, can't be used when both Bottom and Top are specified.
PageNumber | On which page the field should be placed.

You are only required to provide the properties you want and leave the other properties away.
In the simplest scenario you can only provide a value for `Search`.



Example

	curl \
    -H "Authorization: APIKey {usertoken here}" \
    -H "Application: APPKey {appkey here}" \
		-H "Content-Type: application/json" \
		-XPUT \
		-d '{
			"DisplayName": "Your personal contract",
			"Signers": {
				"SomeSignerId": {
					"FormSets": [ "SampleFormset" ]
				}
			},
			"FormSets": {
				"SampleFormset": {
					"SignatureOne": {
						"Type": "Signature",
						"Location": {
							"Search": "{% raw %}{{Signer1}}{% endraw %}"
						}
					},
				}
			}
		}' \
		https://api.signhost.com/api/transaction/SomeTransactionId/file/Contract.pdf

The response will tell you that it is awaiting the actual document.

### Add the actual file to transaction

**PUT /api/transaction/:transactionId/file/:fileId**

Parameter     | Description
--------------|-------------
Content-Type  | application/pdf
transactionId | id from the transaction as returned by Create a transaction
filedId       | A unique id to be created at your side to identity the document. Should be the same id as the one you provided for the file meta data.


Example

	curl \
    -H "Authorization: APIKey {usertoken here}" \
    -H "Application: APPKey {appkey here}" \
		-H "Content-Type: application/pdf" \
		-XPUT \
		-T Contract.pdf \
		https://api.signhost.com/api/transaction/SomeTransactionId/file/Contract.pdf


- Success 201
- Success 204

*We are looking into combining the meta data and the file contents into one API call*

### Start the transaction

**PUT /api/transaction/:transactionId/start**

Example

	curl \
		-H "Authorization: APIKey {usertoken here}" \
		-H "Application: APPKey {appkey here}" \
		https://api.signhost.com/api.transaction/SomeTransactionId/start

Success 200

When all files are uploaded you can tell signhost to start the transaction.
