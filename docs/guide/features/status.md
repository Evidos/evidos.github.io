---
title: Statuses & Activities
---

Some of Signhost API endpoints return both the status of the transaction and signer activities. A list of all the transaction statuses as well as a list of all the signer activity statuses can be found below.

:::tip
Status 20 will be returned whenever there is processing involved by Signhost.
:::

### Transaction Status

| Status | Message              |
| ------ | -------------------- |
| 5      | Waiting for document |
| 10     | Waiting for signer   |
| 20     | In progress          |
| 30     | Signed               |
| 40     | Rejected             |
| 50     | Expired              |
| 60     | Cancelled            |
| 70     | Failed               |

### Signer Activity

| Status | Message                    |
| ------ | -------------------------- |
| 101    | Invitation sent            |
| 103    | Opened                     |
| 104    | Reminder sent              |
| 105    | Document opened            |
| 202    | Rejected                   |
| 203    | Signed                     |
| 204    | Signer delegated           |
| 301    | Signed document sent       |
| 302    | Signed document opened     |
| 303    | Signed document downloaded |
| 401    | Receipt sent               |
| 402    | Receipt opened             |
| 403    | Receipt downloaded         |
