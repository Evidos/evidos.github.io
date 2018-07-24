---
layout: post
title:  "Updated timezone information on data retrieval"
date:   2015-12-07 00:00:00 +0000
categories: api changes
---

## Losing timezone information

When creating a transaction all datetime properties we return, as always, include timezone information. 
For example when doing a POST on /api/transaction you would receive the following JSON response (this is an abbreviated example):

``` json
{
  "Id": "4e60e355-f875-4e81-8b44-37d7473388e2",
  "Status": 20,
  "File": {
    "Id": "efaba45b-abd2-4a72-82f1-61cefda89b6d",
    "Name": "contract.pdf"
  },
  "Signers": [
    {
      "Id": "b2b861dc-d0ce-4733-b6d5-e90243213f74",
      "Email": "user@example.com",
      "SendSignRequest": true,
      "SignRequestMessage": "Hello, could you please sign this document? Best regards, John Doe",
      "SignedDateTime": null,
      "RejectDateTime": null,
      "CreatedDateTime": "2015-12-07T15:49:30.7415254+01:00",
      "ModifiedDateTime": "2015-12-07T15:49:30.7415254+01:00",
      "Context": null
    }
  ],
  "CreatedDateTime": "2015-12-07T15:49:30.7415254+01:00",
  "ModifiedDateTime": "2015-12-07T15:49:30.7415254+01:00",
  "CanceledDateTime": null,
  "Context": null
}
```

The CreatedDateTime property contains the value "2015-12-07T15:49:30.7415254**+01:00**".
As can be seen, there is a "+01:00" timezone information included.
This is an absolute point in time, this is correct behaviour.

Unfortunately sometimes (particularly on older transactions) you might have noticed that we did not include the timezone information and the "+01:00" got lost.
For example, when doing a GET on the previous example you would receive:

``` json
{
  "Id": "4e60e355-f875-4e81-8b44-37d7473388e2",
  "Status": 20,
  "File": {
    "Id": "efaba45b-abd2-4a72-82f1-61cefda89b6d",
    "Name": "contract.pdf"
  },
  "Signers": [
    {
      "Id": "b2b861dc-d0ce-4733-b6d5-e90243213f74",
      "Email": "user@example.com",
      "SendSignRequest": true,
      "SignRequestMessage": "Hello, could you please sign this document? Best regards, John Doe",
      "SignedDateTime": null,
      "RejectDateTime": null,
      "CreatedDateTime": "2015-12-07T15:49:30.7415254",
      "ModifiedDateTime": "2015-12-07T15:49:30.7415254",
      "Context": null
    }
  ],
  "CreatedDateTime": "2015-12-07T15:49:30.7415254",
  "ModifiedDateTime": "2015-12-07T15:49:30.7415254",
  "CanceledDateTime": null,
  "Context": null
}
```

Strictly speaking this should be translated to a local time. That would mean that when you are in a different timezone then we are, you might have given it a different timezone offset (if you performed this conversion).

On newer requests we include the timezone information on all datetime properties where we have this data available.
This means on a GET or webhook postback the result will be the same as in the first example, including the "+01:00" (or a different timezone if applicable).

### What does this mean for you?

All datetime properties are still formatted according to [ISO8601](https://www.iso.org/iso/iso8601).
When you are using a correct JSON parser this should cause no problems for you.
We are not changing the actual datetime values (no conversion is applied) but only including extra information.