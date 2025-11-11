---
title: Return URLs
---

When creating a transaction via the REST API, you can specify a `ReturnUrl` for each individual Signer.

When the user signs or rejects the transaction, Signhost will redirect the browser to the return URL.

The return URL will have the following query parameters appended:

- `sh_transactionid` - The unique ID of the transaction
- `sh_signerid` - The unique ID of the signer
- `sh_signerstatus` - The status determined by the user action

The `sh_signerstatus` parameter will have one of the following values:

| Action     | Example URL                                                                                                                                                                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signed`   | `https://signhost.com?sh_transactionid=b10ae331-af78-4e79-a39e-5b64693b6b68&sh_signerid=fa95495d-6c59-48e0-962a-a4552f8d6b85&sh_signerstatus=signed`                                                                                                                            |
| `rejected` | `https://signhost.com?sh_transactionid=b10ae331-af78-4e79-a39e-5b64693b6b68&sh_signerid=fa95495d-6c59-48e0-962a-a4552f8d6b85&sh_signerstatus=rejected`                                                                                                                          |
| Other      | `https://signhost.com?sh_transactionid=b10ae331-af78-4e79-a39e-5b64693b6b68&sh_signerid=fa95495d-6c59-48e0-962a-a4552f8d6b85&sh_signerstatus=` or `https://signhost.com?sh_transactionid=b10ae331-af78-4e79-a39e-5b64693b6b68&sh_signerid=fa95495d-6c59-48e0-962a-a4552f8d6b85` |

The query parameters provide an indication of the transaction, signer, and what the user chose to do. Depending on the `sh_signerstatus` value, you might want to show a different page to the user.

:::info
For any important processing however, you should not rely on this status, you must validate the actual transaction status using the Postback or API.
:::

Once the user signed or rejected the transaction, the server will start processing the input. This means the user will be redirected to the return URL before the transaction status has been updated. Once the server has completed processing, a new postback will be sent with the new transaction status.
